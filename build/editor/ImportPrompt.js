import { Config } from "../synth/SynthConfig";
import { Note, makeNotePin, Pattern, Instrument, Channel, Synth } from "../synth/synth";
import { EditorConfig } from "./EditorConfig";
import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ChangeGroup } from "./Change";
import { removeDuplicatePatterns, ChangeSong, ChangeReplacePatterns } from "./changes";
import { analogousDrumMap, midiVolumeToVolumeMult, midiExpressionToVolumeMult } from "./Midi";
import { ArrayBufferReader } from "./ArrayBufferReader";
const { button, p, div, h2, input } = HTML;
export class ImportPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._fileInput = input({ type: "file", accept: ".json,application/json,.mid,.midi,audio/midi,audio/x-midi" });
        this._cancelButton = button({ class: "cancelButton" });
        this.container = div({ class: "prompt noSelection", style: "width: 300px;" }, h2("Import"), p({ style: "text-align: left; margin: 0.5em 0;" }, "BeepBox songs can be exported and re-imported as .json files. You could also use other means to make .json files for BeepBox as long as they follow the same structure."), p({ style: "text-align: left; margin: 0.5em 0;" }, "BeepBox can also (crudely) import .mid files. There are many tools available for creating .mid files. Shorter and simpler songs are more likely to work well."), this._fileInput, this._cancelButton);
        this._close = () => {
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._fileInput.removeEventListener("change", this._whenFileSelected);
            this._cancelButton.removeEventListener("click", this._close);
        };
        this._whenFileSelected = () => {
            const file = this._fileInput.files[0];
            if (!file)
                return;
            const extension = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);
            if (extension == "json") {
                const reader = new FileReader();
                reader.addEventListener("load", (event) => {
                    this._doc.prompt = null;
                    this._doc.goBackToStart();
                    this._doc.record(new ChangeSong(this._doc, reader.result), true, true);
                });
                reader.readAsText(file);
            }
            else if (extension == "midi" || extension == "mid") {
                const reader = new FileReader();
                reader.addEventListener("load", (event) => {
                    this._doc.prompt = null;
                    this._doc.goBackToStart();
                    this._parseMidiFile(reader.result);
                });
                reader.readAsArrayBuffer(file);
            }
            else {
                console.error("Unrecognized file extension.");
                this._close();
            }
        };
        this._fileInput.select();
        setTimeout(() => this._fileInput.focus());
        this._fileInput.addEventListener("change", this._whenFileSelected);
        this._cancelButton.addEventListener("click", this._close);
    }
    _parseMidiFile(buffer) {
        const reader = new ArrayBufferReader(new DataView(buffer));
        let headerReader = null;
        const tracks = [];
        while (reader.hasMore()) {
            const chunkType = reader.readUint32();
            const chunkLength = reader.readUint32();
            if (chunkType == 1297377380) {
                if (headerReader == null) {
                    headerReader = reader.getReaderForNextBytes(chunkLength);
                }
                else {
                    console.error("This MIDI file has more than one header chunk.");
                }
            }
            else if (chunkType == 1297379947) {
                const trackReader = reader.getReaderForNextBytes(chunkLength);
                if (trackReader.hasMore()) {
                    tracks.push({
                        reader: trackReader,
                        nextEventMidiTick: trackReader.readMidiVariableLength(),
                        ended: false,
                        runningStatus: -1,
                    });
                }
            }
            else {
                reader.skipBytes(chunkLength);
            }
        }
        if (headerReader == null) {
            console.error("No header chunk found in this MIDI file.");
            this._close();
            return;
        }
        const fileFormat = headerReader.readUint16();
        headerReader.readUint16();
        const midiTicksPerBeat = headerReader.readUint16();
        let currentIndependentTrackIndex = 0;
        const currentTrackIndices = [];
        const independentTracks = (fileFormat == 2);
        if (independentTracks) {
            currentTrackIndices.push(currentIndependentTrackIndex);
        }
        else {
            for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
                currentTrackIndices.push(trackIndex);
            }
        }
        const channelRPNMSB = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
        const channelRPNLSB = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
        const pitchBendRangeMSB = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
        const pitchBendRangeLSB = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const currentInstrumentProgram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const currentInstrumentVolumes = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
        const currentInstrumentPans = [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64];
        const noteEvents = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        const pitchBendEvents = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        const noteSizeEvents = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        let microsecondsPerBeat = 500000;
        let beatsPerBar = 8;
        let numSharps = 0;
        let isMinor = false;
        let currentMidiTick = 0;
        while (true) {
            let nextEventMidiTick = Number.MAX_VALUE;
            let anyTrackHasMore = false;
            for (const trackIndex of currentTrackIndices) {
                const track = tracks[trackIndex];
                while (!track.ended && track.nextEventMidiTick == currentMidiTick) {
                    const peakStatus = track.reader.peakUint8();
                    const eventStatus = (peakStatus & 0x80) ? track.reader.readUint8() : track.runningStatus;
                    const eventType = eventStatus & 0xF0;
                    const eventChannel = eventStatus & 0x0F;
                    if (eventType != 240) {
                        track.runningStatus = eventStatus;
                    }
                    let foundTrackEndEvent = false;
                    switch (eventType) {
                        case 128:
                            {
                                const pitch = track.reader.readMidi7Bits();
                                track.reader.readMidi7Bits();
                                noteEvents[eventChannel].push({ midiTick: currentMidiTick, pitch: pitch, velocity: 0.0, program: -1, instrumentVolume: -1, instrumentPan: -1, on: false });
                            }
                            break;
                        case 144:
                            {
                                const pitch = track.reader.readMidi7Bits();
                                const velocity = track.reader.readMidi7Bits();
                                if (velocity == 0) {
                                    noteEvents[eventChannel].push({ midiTick: currentMidiTick, pitch: pitch, velocity: 0.0, program: -1, instrumentVolume: -1, instrumentPan: -1, on: false });
                                }
                                else {
                                    const volume = Math.max(0, Math.min(Config.volumeRange - 1, Math.round(Synth.volumeMultToInstrumentVolume(midiVolumeToVolumeMult(currentInstrumentVolumes[eventChannel])))));
                                    const pan = Math.max(0, Math.min(Config.panMax, Math.round(((currentInstrumentPans[eventChannel] - 64) / 63 + 1) * Config.panCenter)));
                                    noteEvents[eventChannel].push({
                                        midiTick: currentMidiTick,
                                        pitch: pitch,
                                        velocity: Math.max(0.0, Math.min(1.0, (velocity + 14) / 90.0)),
                                        program: currentInstrumentProgram[eventChannel],
                                        instrumentVolume: volume,
                                        instrumentPan: pan,
                                        on: true,
                                    });
                                }
                            }
                            break;
                        case 160:
                            {
                                track.reader.readMidi7Bits();
                                track.reader.readMidi7Bits();
                            }
                            break;
                        case 176:
                            {
                                const message = track.reader.readMidi7Bits();
                                const value = track.reader.readMidi7Bits();
                                switch (message) {
                                    case 6:
                                        {
                                            if (channelRPNMSB[eventChannel] == 0 && channelRPNLSB[eventChannel] == 0) {
                                                pitchBendRangeMSB[eventChannel] = value;
                                            }
                                        }
                                        break;
                                    case 7:
                                        {
                                            currentInstrumentVolumes[eventChannel] = value;
                                        }
                                        break;
                                    case 10:
                                        {
                                            currentInstrumentPans[eventChannel] = value;
                                        }
                                        break;
                                    case 11:
                                        {
                                            noteSizeEvents[eventChannel].push({ midiTick: currentMidiTick, size: Synth.volumeMultToNoteSize(midiExpressionToVolumeMult(value)) });
                                        }
                                        break;
                                    case 38:
                                        {
                                            if (channelRPNMSB[eventChannel] == 0 && channelRPNLSB[eventChannel] == 0) {
                                                pitchBendRangeLSB[eventChannel] = value;
                                            }
                                        }
                                        break;
                                    case 100:
                                        {
                                            channelRPNLSB[eventChannel] = value;
                                        }
                                        break;
                                    case 101:
                                        {
                                            channelRPNMSB[eventChannel] = value;
                                        }
                                        break;
                                }
                            }
                            break;
                        case 192:
                            {
                                const program = track.reader.readMidi7Bits();
                                currentInstrumentProgram[eventChannel] = program;
                            }
                            break;
                        case 208:
                            {
                                track.reader.readMidi7Bits();
                            }
                            break;
                        case 224:
                            {
                                const lsb = track.reader.readMidi7Bits();
                                const msb = track.reader.readMidi7Bits();
                                const pitchBend = (((msb << 7) | lsb) / 0x2000) - 1.0;
                                const pitchBendRange = pitchBendRangeMSB[eventChannel] + pitchBendRangeLSB[eventChannel] * 0.01;
                                const interval = pitchBend * pitchBendRange;
                                pitchBendEvents[eventChannel].push({ midiTick: currentMidiTick, interval: interval });
                            }
                            break;
                        case 240:
                            {
                                if (eventStatus == 255) {
                                    const message = track.reader.readMidi7Bits();
                                    const length = track.reader.readMidiVariableLength();
                                    if (message == 47) {
                                        foundTrackEndEvent = true;
                                        track.reader.skipBytes(length);
                                    }
                                    else if (message == 81) {
                                        microsecondsPerBeat = track.reader.readUint24();
                                        track.reader.skipBytes(length - 3);
                                    }
                                    else if (message == 88) {
                                        const numerator = track.reader.readUint8();
                                        let denominatorExponent = track.reader.readUint8();
                                        track.reader.readUint8();
                                        track.reader.readUint8();
                                        track.reader.skipBytes(length - 4);
                                        beatsPerBar = numerator * 4;
                                        while ((beatsPerBar & 1) == 0 && (denominatorExponent > 0 || beatsPerBar > Config.beatsPerBarMax) && beatsPerBar >= Config.beatsPerBarMin * 2) {
                                            beatsPerBar = beatsPerBar >> 1;
                                            denominatorExponent = denominatorExponent - 1;
                                        }
                                        beatsPerBar = Math.max(Config.beatsPerBarMin, Math.min(Config.beatsPerBarMax, beatsPerBar));
                                    }
                                    else if (message == 89) {
                                        numSharps = track.reader.readInt8();
                                        isMinor = track.reader.readUint8() == 1;
                                        track.reader.skipBytes(length - 2);
                                    }
                                    else {
                                        track.reader.skipBytes(length);
                                    }
                                }
                                else if (eventStatus == 0xF0 || eventStatus == 0xF7) {
                                    const length = track.reader.readMidiVariableLength();
                                    track.reader.skipBytes(length);
                                }
                                else {
                                    console.error("Unrecognized event status: " + eventStatus);
                                    this._close();
                                    return;
                                }
                            }
                            break;
                        default: {
                            console.error("Unrecognized event type: " + eventType);
                            this._close();
                            return;
                        }
                    }
                    if (!foundTrackEndEvent && track.reader.hasMore()) {
                        track.nextEventMidiTick = currentMidiTick + track.reader.readMidiVariableLength();
                    }
                    else {
                        track.ended = true;
                        if (independentTracks) {
                            currentIndependentTrackIndex++;
                            if (currentIndependentTrackIndex < tracks.length) {
                                currentTrackIndices[0] = currentIndependentTrackIndex;
                                tracks[currentIndependentTrackIndex].nextEventMidiTick += currentMidiTick;
                                nextEventMidiTick = Math.min(nextEventMidiTick, tracks[currentIndependentTrackIndex].nextEventMidiTick);
                                anyTrackHasMore = true;
                            }
                        }
                    }
                }
                if (!track.ended) {
                    anyTrackHasMore = true;
                    nextEventMidiTick = Math.min(nextEventMidiTick, track.nextEventMidiTick);
                }
            }
            if (anyTrackHasMore) {
                currentMidiTick = nextEventMidiTick;
            }
            else {
                break;
            }
        }
        const microsecondsPerMinute = 60 * 1000 * 1000;
        const beatsPerMinute = Math.max(Config.tempoMin, Math.min(Config.tempoMax, Math.round(microsecondsPerMinute / microsecondsPerBeat)));
        const midiTicksPerPart = midiTicksPerBeat / Config.partsPerBeat;
        const partsPerBar = Config.partsPerBeat * beatsPerBar;
        const songTotalBars = Math.ceil(currentMidiTick / midiTicksPerPart / partsPerBar);
        function quantizeMidiTickToPart(midiTick) {
            return Math.round(midiTick / midiTicksPerPart);
        }
        let key = numSharps;
        if (isMinor)
            key += 3;
        if ((key & 1) == 1)
            key += 6;
        while (key < 0)
            key += 12;
        key = key % 12;
        const pitchChannels = [];
        const noiseChannels = [];
        const modChannels = [];
        for (let midiChannel = 0; midiChannel < 16; midiChannel++) {
            if (noteEvents[midiChannel].length == 0)
                continue;
            const channel = new Channel();
            const channelPresetValue = EditorConfig.midiProgramToPresetValue(noteEvents[midiChannel][0].program);
            const channelPreset = (channelPresetValue == null) ? null : EditorConfig.valueToPreset(channelPresetValue);
            const isDrumsetChannel = (midiChannel == 9);
            const isNoiseChannel = isDrumsetChannel || (channelPreset != null && channelPreset.isNoise == true);
            const isModChannel = (channelPreset != null && channelPreset.isMod == true);
            const channelBasePitch = isNoiseChannel ? Config.spectrumBasePitch : Config.keys[key].basePitch;
            const intervalScale = isNoiseChannel ? Config.noiseInterval : 1;
            const midiIntervalScale = isNoiseChannel ? 0.5 : 1;
            const channelMaxPitch = isNoiseChannel ? Config.drumCount - 1 : Config.maxPitch;
            if (isNoiseChannel) {
                if (isDrumsetChannel) {
                    noiseChannels.unshift(channel);
                }
                else {
                    noiseChannels.push(channel);
                }
            }
            else if (isModChannel) {
                modChannels.push(channel);
            }
            else {
                pitchChannels.push(channel);
            }
            let currentVelocity = 1.0;
            let currentProgram = 0;
            let currentInstrumentVolume = 0;
            let currentInstrumentPan = Config.panCenter;
            if (isDrumsetChannel) {
                const heldPitches = [];
                let currentBar = -1;
                let pattern = null;
                let prevEventPart = 0;
                let setInstrumentVolume = false;
                const presetValue = EditorConfig.nameToPresetValue("standard drumset");
                const preset = EditorConfig.valueToPreset(presetValue);
                const instrument = new Instrument(false, false);
                instrument.fromJsonObject(preset.settings, false, false, false, false, 1);
                instrument.preset = presetValue;
                channel.instruments.push(instrument);
                for (let noteEventIndex = 0; noteEventIndex <= noteEvents[midiChannel].length; noteEventIndex++) {
                    const noMoreNotes = noteEventIndex == noteEvents[midiChannel].length;
                    const noteEvent = noMoreNotes ? null : noteEvents[midiChannel][noteEventIndex];
                    const nextEventPart = noteEvent == null ? Number.MAX_SAFE_INTEGER : quantizeMidiTickToPart(noteEvent.midiTick);
                    if (heldPitches.length > 0 && nextEventPart > prevEventPart && (noteEvent == null || noteEvent.on)) {
                        const bar = Math.floor(prevEventPart / partsPerBar);
                        const barStartPart = bar * partsPerBar;
                        if (currentBar != bar || pattern == null) {
                            currentBar++;
                            while (currentBar < bar) {
                                channel.bars[currentBar] = 0;
                                currentBar++;
                            }
                            pattern = new Pattern();
                            channel.patterns.push(pattern);
                            channel.bars[currentBar] = channel.patterns.length;
                            pattern.instruments[0] = 0;
                            pattern.instruments.length = 1;
                        }
                        if (!setInstrumentVolume || instrument.volume > currentInstrumentVolume) {
                            instrument.volume = currentInstrumentVolume;
                            instrument.pan = currentInstrumentPan;
                            instrument.panDelay = 0;
                            setInstrumentVolume = true;
                        }
                        const drumFreqs = [];
                        let minDuration = channelMaxPitch;
                        let maxDuration = 0;
                        let noteSize = 1;
                        for (const pitch of heldPitches) {
                            const drum = analogousDrumMap[pitch];
                            if (drumFreqs.indexOf(drum.frequency) == -1) {
                                drumFreqs.push(drum.frequency);
                            }
                            noteSize = Math.max(noteSize, Math.round(drum.volume * currentVelocity));
                            minDuration = Math.min(minDuration, drum.duration);
                            maxDuration = Math.max(maxDuration, drum.duration);
                        }
                        const duration = Math.min(maxDuration, Math.max(minDuration, 2));
                        const noteStartPart = prevEventPart - barStartPart;
                        const noteEndPart = Math.min(partsPerBar, Math.min(nextEventPart - barStartPart, noteStartPart + duration * 6));
                        const note = new Note(-1, noteStartPart, noteEndPart, noteSize, true);
                        note.pitches.length = 0;
                        for (let pitchIndex = 0; pitchIndex < Math.min(Config.maxChordSize, drumFreqs.length); pitchIndex++) {
                            const heldPitch = drumFreqs[pitchIndex + Math.max(0, drumFreqs.length - Config.maxChordSize)];
                            if (note.pitches.indexOf(heldPitch) == -1) {
                                note.pitches.push(heldPitch);
                            }
                        }
                        pattern.notes.push(note);
                        heldPitches.length = 0;
                    }
                    if (noteEvent != null && noteEvent.on && analogousDrumMap[noteEvent.pitch] != undefined) {
                        heldPitches.push(noteEvent.pitch);
                        prevEventPart = nextEventPart;
                        currentVelocity = noteEvent.velocity;
                        currentInstrumentVolume = noteEvent.instrumentVolume;
                        currentInstrumentPan = noteEvent.instrumentPan;
                    }
                }
            }
            else {
                let currentMidiInterval = 0.0;
                let currentMidiNoteSize = Config.noteSizeMax;
                let pitchBendEventIndex = 0;
                let noteSizeEventIndex = 0;
                function updateCurrentMidiInterval(midiTick) {
                    while (pitchBendEventIndex < pitchBendEvents[midiChannel].length && pitchBendEvents[midiChannel][pitchBendEventIndex].midiTick <= midiTick) {
                        currentMidiInterval = pitchBendEvents[midiChannel][pitchBendEventIndex].interval;
                        pitchBendEventIndex++;
                    }
                }
                function updateCurrentMidiNoteSize(midiTick) {
                    while (noteSizeEventIndex < noteSizeEvents[midiChannel].length && noteSizeEvents[midiChannel][noteSizeEventIndex].midiTick <= midiTick) {
                        currentMidiNoteSize = noteSizeEvents[midiChannel][noteSizeEventIndex].size;
                        noteSizeEventIndex++;
                    }
                }
                const instrumentByProgram = [];
                const heldPitches = [];
                let currentBar = -1;
                let pattern = null;
                let prevEventMidiTick = 0;
                let prevEventPart = 0;
                let pitchSum = 0;
                let pitchCount = 0;
                for (let noteEvent of noteEvents[midiChannel]) {
                    const nextEventMidiTick = noteEvent.midiTick;
                    const nextEventPart = quantizeMidiTickToPart(nextEventMidiTick);
                    if (heldPitches.length > 0 && nextEventPart > prevEventPart) {
                        const startBar = Math.floor(prevEventPart / partsPerBar);
                        const endBar = Math.ceil(nextEventPart / partsPerBar);
                        let createdNote = false;
                        for (let bar = startBar; bar < endBar; bar++) {
                            const barStartPart = bar * partsPerBar;
                            const barStartMidiTick = bar * beatsPerBar * midiTicksPerBeat;
                            const barEndMidiTick = (bar + 1) * beatsPerBar * midiTicksPerBeat;
                            const noteStartPart = Math.max(0, prevEventPart - barStartPart);
                            const noteEndPart = Math.min(partsPerBar, nextEventPart - barStartPart);
                            const noteStartMidiTick = Math.max(barStartMidiTick, prevEventMidiTick);
                            const noteEndMidiTick = Math.min(barEndMidiTick, nextEventMidiTick);
                            if (noteStartPart < noteEndPart) {
                                const presetValue = EditorConfig.midiProgramToPresetValue(currentProgram);
                                const preset = (presetValue == null) ? null : EditorConfig.valueToPreset(presetValue);
                                if (currentBar != bar || pattern == null) {
                                    currentBar++;
                                    while (currentBar < bar) {
                                        channel.bars[currentBar] = 0;
                                        currentBar++;
                                    }
                                    pattern = new Pattern();
                                    channel.patterns.push(pattern);
                                    channel.bars[currentBar] = channel.patterns.length;
                                    if (instrumentByProgram[currentProgram] == undefined) {
                                        const instrument = new Instrument(isNoiseChannel, isModChannel);
                                        instrumentByProgram[currentProgram] = instrument;
                                        if (presetValue != null && preset != null && (preset.isNoise == true) == isNoiseChannel) {
                                            instrument.fromJsonObject(preset.settings, isNoiseChannel, isModChannel, false, false, 1);
                                            instrument.preset = presetValue;
                                        }
                                        else {
                                            instrument.setTypeAndReset(isModChannel ? 9 : (isNoiseChannel ? 2 : 0), isNoiseChannel, isModChannel);
                                            instrument.chord = 0;
                                        }
                                        instrument.volume = currentInstrumentVolume;
                                        instrument.pan = currentInstrumentPan;
                                        instrument.panDelay = 0;
                                        channel.instruments.push(instrument);
                                    }
                                    pattern.instruments[0] = channel.instruments.indexOf(instrumentByProgram[currentProgram]);
                                    pattern.instruments.length = 1;
                                }
                                if (instrumentByProgram[currentProgram] != undefined) {
                                    instrumentByProgram[currentProgram].volume = Math.min(instrumentByProgram[currentProgram].volume, currentInstrumentVolume);
                                    instrumentByProgram[currentProgram].pan = Math.min(instrumentByProgram[currentProgram].pan, currentInstrumentPan);
                                }
                                const note = new Note(-1, noteStartPart, noteEndPart, Config.noteSizeMax, false);
                                note.pins.length = 0;
                                note.continuesLastPattern = (createdNote && noteStartPart == 0);
                                createdNote = true;
                                updateCurrentMidiInterval(noteStartMidiTick);
                                updateCurrentMidiNoteSize(noteStartMidiTick);
                                const shiftedHeldPitch = heldPitches[0] * midiIntervalScale - channelBasePitch;
                                const initialBeepBoxPitch = Math.round((shiftedHeldPitch + currentMidiInterval) / intervalScale);
                                const heldPitchOffset = Math.round(currentMidiInterval - channelBasePitch);
                                let firstPin = makeNotePin(0, 0, Math.round(currentVelocity * currentMidiNoteSize));
                                note.pins.push(firstPin);
                                const potentialPins = [
                                    { part: 0, pitch: initialBeepBoxPitch, size: firstPin.size, keyPitch: false, keySize: false }
                                ];
                                let prevPinIndex = 0;
                                let prevPartPitch = (shiftedHeldPitch + currentMidiInterval) / intervalScale;
                                let prevPartSize = currentVelocity * currentMidiNoteSize;
                                for (let part = noteStartPart + 1; part <= noteEndPart; part++) {
                                    const midiTick = Math.max(noteStartMidiTick, Math.min(noteEndMidiTick - 1, Math.round(midiTicksPerPart * (part + barStartPart))));
                                    const noteRelativePart = part - noteStartPart;
                                    const lastPart = (part == noteEndPart);
                                    updateCurrentMidiInterval(midiTick);
                                    updateCurrentMidiNoteSize(midiTick);
                                    const partPitch = (currentMidiInterval + shiftedHeldPitch) / intervalScale;
                                    const partSize = currentVelocity * currentMidiNoteSize;
                                    const nearestPitch = Math.round(partPitch);
                                    const pitchIsNearInteger = Math.abs(partPitch - nearestPitch) < 0.01;
                                    const pitchCrossedInteger = (Math.abs(prevPartPitch - Math.round(prevPartPitch)) < 0.01)
                                        ? Math.abs(partPitch - prevPartPitch) >= 1.0
                                        : Math.floor(partPitch) != Math.floor(prevPartPitch);
                                    const keyPitch = pitchIsNearInteger || pitchCrossedInteger;
                                    const nearestSize = Math.round(partSize);
                                    const sizeIsNearInteger = Math.abs(partSize - nearestSize) < 0.01;
                                    const sizeCrossedInteger = (Math.abs(prevPartSize - Math.round(prevPartSize)))
                                        ? Math.abs(partSize - prevPartSize) >= 1.0
                                        : Math.floor(partSize) != Math.floor(prevPartSize);
                                    const keySize = sizeIsNearInteger || sizeCrossedInteger;
                                    prevPartPitch = partPitch;
                                    prevPartSize = partSize;
                                    if (keyPitch || keySize || lastPart) {
                                        const currentPin = { part: noteRelativePart, pitch: nearestPitch, size: nearestSize, keyPitch: keyPitch || lastPart, keySize: keySize || lastPart };
                                        const prevPin = potentialPins[prevPinIndex];
                                        let addPin = false;
                                        let addPinAtIndex = Number.MAX_VALUE;
                                        if (currentPin.keyPitch) {
                                            const slope = (currentPin.pitch - prevPin.pitch) / (currentPin.part - prevPin.part);
                                            let furthestIntervalDistance = Math.abs(slope);
                                            let addIntervalPin = false;
                                            let addIntervalPinAtIndex = Number.MAX_VALUE;
                                            for (let potentialIndex = prevPinIndex + 1; potentialIndex < potentialPins.length; potentialIndex++) {
                                                const potentialPin = potentialPins[potentialIndex];
                                                if (potentialPin.keyPitch) {
                                                    const interpolatedInterval = prevPin.pitch + slope * (potentialPin.part - prevPin.part);
                                                    const distance = Math.abs(interpolatedInterval - potentialPin.pitch);
                                                    if (furthestIntervalDistance < distance) {
                                                        furthestIntervalDistance = distance;
                                                        addIntervalPin = true;
                                                        addIntervalPinAtIndex = potentialIndex;
                                                    }
                                                }
                                            }
                                            if (addIntervalPin) {
                                                addPin = true;
                                                addPinAtIndex = Math.min(addPinAtIndex, addIntervalPinAtIndex);
                                            }
                                        }
                                        if (currentPin.keySize) {
                                            const slope = (currentPin.size - prevPin.size) / (currentPin.part - prevPin.part);
                                            let furthestSizeDistance = Math.abs(slope);
                                            let addSizePin = false;
                                            let addSizePinAtIndex = Number.MAX_VALUE;
                                            for (let potentialIndex = prevPinIndex + 1; potentialIndex < potentialPins.length; potentialIndex++) {
                                                const potentialPin = potentialPins[potentialIndex];
                                                if (potentialPin.keySize) {
                                                    const interpolatedSize = prevPin.size + slope * (potentialPin.part - prevPin.part);
                                                    const distance = Math.abs(interpolatedSize - potentialPin.size);
                                                    if (furthestSizeDistance < distance) {
                                                        furthestSizeDistance = distance;
                                                        addSizePin = true;
                                                        addSizePinAtIndex = potentialIndex;
                                                    }
                                                }
                                            }
                                            if (addSizePin) {
                                                addPin = true;
                                                addPinAtIndex = Math.min(addPinAtIndex, addSizePinAtIndex);
                                            }
                                        }
                                        if (addPin) {
                                            const toBePinned = potentialPins[addPinAtIndex];
                                            note.pins.push(makeNotePin(toBePinned.pitch - initialBeepBoxPitch, toBePinned.part, toBePinned.size));
                                            prevPinIndex = addPinAtIndex;
                                        }
                                        potentialPins.push(currentPin);
                                    }
                                }
                                const lastToBePinned = potentialPins[potentialPins.length - 1];
                                note.pins.push(makeNotePin(lastToBePinned.pitch - initialBeepBoxPitch, lastToBePinned.part, lastToBePinned.size));
                                let maxPitch = channelMaxPitch;
                                let minPitch = 0;
                                for (const notePin of note.pins) {
                                    maxPitch = Math.min(maxPitch, channelMaxPitch - notePin.interval);
                                    minPitch = Math.min(minPitch, -notePin.interval);
                                }
                                note.pitches.length = 0;
                                for (let pitchIndex = 0; pitchIndex < Math.min(Config.maxChordSize, heldPitches.length); pitchIndex++) {
                                    let heldPitch = heldPitches[pitchIndex + Math.max(0, heldPitches.length - Config.maxChordSize)] * midiIntervalScale;
                                    if (preset != null && preset.midiSubharmonicOctaves != undefined) {
                                        heldPitch -= 12 * preset.midiSubharmonicOctaves;
                                    }
                                    const shiftedPitch = Math.max(minPitch, Math.min(maxPitch, Math.round((heldPitch + heldPitchOffset) / intervalScale)));
                                    if (note.pitches.indexOf(shiftedPitch) == -1) {
                                        note.pitches.push(shiftedPitch);
                                        const weight = note.end - note.start;
                                        pitchSum += shiftedPitch * weight;
                                        pitchCount += weight;
                                    }
                                }
                                pattern.notes.push(note);
                            }
                        }
                    }
                    if (heldPitches.indexOf(noteEvent.pitch) != -1) {
                        heldPitches.splice(heldPitches.indexOf(noteEvent.pitch), 1);
                    }
                    if (noteEvent.on) {
                        heldPitches.push(noteEvent.pitch);
                        currentVelocity = noteEvent.velocity;
                        currentProgram = noteEvent.program;
                        currentInstrumentVolume = noteEvent.instrumentVolume;
                        currentInstrumentPan = noteEvent.instrumentPan;
                    }
                    prevEventMidiTick = nextEventMidiTick;
                    prevEventPart = nextEventPart;
                }
                const averagePitch = pitchSum / pitchCount;
                channel.octave = (isNoiseChannel || isModChannel) ? 0 : Math.max(0, Math.min(Config.pitchOctaves - 1, Math.floor((averagePitch / 12))));
            }
            while (channel.bars.length < songTotalBars) {
                channel.bars.push(0);
            }
        }
        function compactChannels(channels, maxLength) {
            while (channels.length > maxLength) {
                let bestChannelIndexA = channels.length - 2;
                let bestChannelIndexB = channels.length - 1;
                let fewestConflicts = Number.MAX_VALUE;
                let fewestGaps = Number.MAX_VALUE;
                for (let channelIndexA = 0; channelIndexA < channels.length - 1; channelIndexA++) {
                    for (let channelIndexB = channelIndexA + 1; channelIndexB < channels.length; channelIndexB++) {
                        const channelA = channels[channelIndexA];
                        const channelB = channels[channelIndexB];
                        let conflicts = 0;
                        let gaps = 0;
                        for (let barIndex = 0; barIndex < channelA.bars.length && barIndex < channelB.bars.length; barIndex++) {
                            if (channelA.bars[barIndex] != 0 && channelB.bars[barIndex] != 0)
                                conflicts++;
                            if (channelA.bars[barIndex] == 0 && channelB.bars[barIndex] == 0)
                                gaps++;
                        }
                        if (conflicts <= fewestConflicts) {
                            if (conflicts < fewestConflicts || gaps < fewestGaps) {
                                bestChannelIndexA = channelIndexA;
                                bestChannelIndexB = channelIndexB;
                                fewestConflicts = conflicts;
                                fewestGaps = gaps;
                            }
                        }
                    }
                }
                const channelA = channels[bestChannelIndexA];
                const channelB = channels[bestChannelIndexB];
                const channelAInstrumentCount = channelA.instruments.length;
                const channelAPatternCount = channelA.patterns.length;
                for (const instrument of channelB.instruments) {
                    channelA.instruments.push(instrument);
                }
                for (const pattern of channelB.patterns) {
                    pattern.instruments[0] += channelAInstrumentCount;
                    channelA.patterns.push(pattern);
                }
                for (let barIndex = 0; barIndex < channelA.bars.length && barIndex < channelB.bars.length; barIndex++) {
                    if (channelA.bars[barIndex] == 0 && channelB.bars[barIndex] != 0) {
                        channelA.bars[barIndex] = channelB.bars[barIndex] + channelAPatternCount;
                    }
                }
                channels.splice(bestChannelIndexB, 1);
            }
        }
        compactChannels(pitchChannels, Config.pitchChannelCountMax);
        compactChannels(noiseChannels, Config.noiseChannelCountMax);
        compactChannels(modChannels, Config.modChannelCountMax);
        class ChangeImportMidi extends ChangeGroup {
            constructor(doc) {
                super();
                const song = doc.song;
                song.tempo = beatsPerMinute;
                song.beatsPerBar = beatsPerBar;
                song.key = key;
                song.scale = 11;
                song.rhythm = 1;
                song.layeredInstruments = false;
                song.patternInstruments = pitchChannels.some(channel => channel.instruments.length > 1) || noiseChannels.some(channel => channel.instruments.length > 1);
                removeDuplicatePatterns(pitchChannels);
                removeDuplicatePatterns(noiseChannels);
                removeDuplicatePatterns(modChannels);
                this.append(new ChangeReplacePatterns(doc, pitchChannels, noiseChannels, modChannels));
                song.loopStart = 0;
                song.loopLength = song.barCount;
                this._didSomething();
                doc.notifier.changed();
            }
        }
        this._doc.goBackToStart();
        for (const channel of this._doc.song.channels)
            channel.muted = false;
        this._doc.prompt = null;
        this._doc.record(new ChangeImportMidi(this._doc), true, true);
    }
}
//# sourceMappingURL=ImportPrompt.js.map