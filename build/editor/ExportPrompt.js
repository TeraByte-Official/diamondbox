import { Config, getArpeggioPitchIndex } from "../synth/SynthConfig";
import { Synth } from "../synth/synth";
import { ColorConfig } from "./ColorConfig";
import { EditorConfig } from "./EditorConfig";
import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ArrayBufferWriter } from "./ArrayBufferWriter";
import { volumeMultToMidiVolume, volumeMultToMidiExpression, defaultMidiPitchBend, defaultMidiExpression } from "./Midi";
const { button, div, h2, input, select, option } = HTML;
function lerp(low, high, t) {
    return low + t * (high - low);
}
function save(blob, name) {
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, name);
        return;
    }
    const anchor = document.createElement("a");
    if (anchor.download != undefined) {
        const url = URL.createObjectURL(blob);
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        anchor.href = url;
        anchor.download = name;
        setTimeout(function () { anchor.dispatchEvent(new MouseEvent("click")); }, 0);
    }
    else {
        const url = URL.createObjectURL(blob);
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        if (!window.open(url, "_blank"))
            window.location.href = url;
    }
}
export class ExportPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this.outputStarted = false;
        this._fileName = input({ type: "text", style: "width: 10em;", value: "BeepBox-Song", maxlength: 250, "autofocus": "autofocus" });
        this._computedSamplesLabel = div({ style: "width: 10em;" }, new Text("0:00"));
        this._enableIntro = input({ type: "checkbox" });
        this._loopDropDown = input({ style: "width: 2em;", type: "number", min: "1", max: "4", step: "1" });
        this._enableOutro = input({ type: "checkbox" });
        this._formatSelect = select({ style: "width: 100%;" }, option({ value: "wav" }, "Export to .wav file."), option({ value: "mp3" }, "Export to .mp3 file."), option({ value: "midi" }, "Export to .mid file."), option({ value: "json" }, "Export to .json file."), option({ value: "html" }, "Export to .html file."));
        this._cancelButton = button({ class: "cancelButton" });
        this._exportButton = button({ class: "exportButton", style: "width:45%;" }, "Export");
        this._outputProgressBar = div({ style: `width: 0%; background: ${ColorConfig.loopAccent}; height: 100%; position: absolute; z-index: 2;` });
        this._outputProgressLabel = div({ style: `position: relative; top: -1px; z-index: 3;` }, "0%");
        this._outputProgressContainer = div({ style: `height: 12px; background: ${ColorConfig.uiWidgetBackground}; display: block; position: relative; z-index: 1;` }, this._outputProgressBar, this._outputProgressLabel);
        this.container = div({ class: "prompt noSelection", style: "width: 200px;" }, h2("Export Options"), div({ style: "display: flex; flex-direction: row; align-items: center; justify-content: space-between;" }, "File name:", this._fileName), div({ style: "display: flex; flex-direction: row; align-items: center; justify-content: space-between;" }, "Length:", this._computedSamplesLabel), div({ style: "display: table; width: 100%;" }, div({ style: "display: table-row;" }, div({ style: "display: table-cell;" }, "Intro:"), div({ style: "display: table-cell;" }, "Loop Count:"), div({ style: "display: table-cell;" }, "Outro:")), div({ style: "display: table-row;" }, div({ style: "display: table-cell; vertical-align: middle;" }, this._enableIntro), div({ style: "display: table-cell; vertical-align: middle;" }, this._loopDropDown), div({ style: "display: table-cell; vertical-align: middle;" }, this._enableOutro))), div({ class: "selectContainer", style: "width: 100%;" }, this._formatSelect), div({ style: "text-align: left;" }, "Exporting can be slow. Reloading the page or clicking the X will cancel it. Please be patient."), this._outputProgressContainer, div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._exportButton), this._cancelButton);
        this._close = () => {
            if (this.synth != null)
                this.synth.renderingSong = false;
            this.outputStarted = false;
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._fileName.removeEventListener("input", ExportPrompt._validateFileName);
            this._loopDropDown.removeEventListener("blur", ExportPrompt._validateNumber);
            this._exportButton.removeEventListener("click", this._export);
            this._cancelButton.removeEventListener("click", this._close);
            this.container.removeEventListener("keydown", this._whenKeyPressed);
        };
        this._whenKeyPressed = (event) => {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                this._export();
            }
        };
        this._export = () => {
            if (this.outputStarted == true)
                return;
            window.localStorage.setItem("exportFormat", this._formatSelect.value);
            switch (this._formatSelect.value) {
                case "wav":
                    this.outputStarted = true;
                    this._exportTo("wav");
                    break;
                case "mp3":
                    this.outputStarted = true;
                    this._exportTo("mp3");
                    break;
                case "midi":
                    this.outputStarted = true;
                    this._exportToMidi();
                    break;
                case "json":
                    this.outputStarted = true;
                    this._exportToJson();
                    break;
                case "html":
                    this._exportToHtml();
                    break;
                default:
                    throw new Error("Unhandled file export type.");
            }
        };
        this._loopDropDown.value = "1";
        if (this._doc.song.loopStart == 0) {
            this._enableIntro.checked = false;
            this._enableIntro.disabled = true;
        }
        else {
            this._enableIntro.checked = true;
            this._enableIntro.disabled = false;
        }
        if (this._doc.song.loopStart + this._doc.song.loopLength == this._doc.song.barCount) {
            this._enableOutro.checked = false;
            this._enableOutro.disabled = true;
        }
        else {
            this._enableOutro.checked = true;
            this._enableOutro.disabled = false;
        }
        const lastExportFormat = window.localStorage.getItem("exportFormat");
        if (lastExportFormat != null) {
            this._formatSelect.value = lastExportFormat;
        }
        this._fileName.select();
        setTimeout(() => this._fileName.focus());
        this._fileName.addEventListener("input", ExportPrompt._validateFileName);
        this._loopDropDown.addEventListener("blur", ExportPrompt._validateNumber);
        this._exportButton.addEventListener("click", this._export);
        this._cancelButton.addEventListener("click", this._close);
        this._enableOutro.addEventListener("click", () => { this._computedSamplesLabel.firstChild.textContent = this.samplesToTime(this._doc.synth.getTotalSamples(this._enableIntro.checked, this._enableOutro.checked, +this._loopDropDown.value - 1)); });
        this._enableIntro.addEventListener("click", () => { this._computedSamplesLabel.firstChild.textContent = this.samplesToTime(this._doc.synth.getTotalSamples(this._enableIntro.checked, this._enableOutro.checked, +this._loopDropDown.value - 1)); });
        this._loopDropDown.addEventListener("change", () => { this._computedSamplesLabel.firstChild.textContent = this.samplesToTime(this._doc.synth.getTotalSamples(this._enableIntro.checked, this._enableOutro.checked, +this._loopDropDown.value - 1)); });
        this.container.addEventListener("keydown", this._whenKeyPressed);
        this._fileName.value = _doc.song.title;
        ExportPrompt._validateFileName(null, this._fileName);
        this._computedSamplesLabel.firstChild.textContent = this.samplesToTime(this._doc.synth.getTotalSamples(this._enableIntro.checked, this._enableOutro.checked, +this._loopDropDown.value - 1));
    }
    samplesToTime(samples) {
        const rawSeconds = Math.round(samples / this._doc.synth.samplesPerSecond);
        const seconds = rawSeconds % 60;
        const minutes = Math.floor(rawSeconds / 60);
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }
    changeFileName(newValue) {
        this._fileName.value = newValue;
    }
    static _validateFileName(event, use) {
        let input;
        if (event != null) {
            input = event.target;
        }
        else if (use != undefined) {
            input = use;
        }
        else {
            return;
        }
        const deleteChars = /[\+\*\$\?\|\{\}\\\/<>#%!`&'"=:@]/gi;
        if (deleteChars.test(input.value)) {
            let cursorPos = input.selectionStart;
            input.value = input.value.replace(deleteChars, "");
            cursorPos--;
            input.setSelectionRange(cursorPos, cursorPos);
        }
    }
    static _validateNumber(event) {
        const input = event.target;
        input.value = Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value)))) + "";
    }
    _synthesize() {
        if (this.outputStarted == false) {
            return;
        }
        const samplesPerChunk = this.synth.samplesPerSecond * 5;
        const currentFrame = this.currentChunk * samplesPerChunk;
        const samplesInChunk = Math.min(samplesPerChunk, this.sampleFrames - currentFrame);
        const tempSamplesL = new Float32Array(samplesInChunk);
        const tempSamplesR = new Float32Array(samplesInChunk);
        this.synth.renderingSong = true;
        this.synth.synthesize(tempSamplesL, tempSamplesR, samplesInChunk);
        this.recordedSamplesL.set(tempSamplesL, currentFrame);
        this.recordedSamplesR.set(tempSamplesR, currentFrame);
        this._outputProgressBar.style.setProperty("width", Math.round((this.currentChunk + 1) / this.totalChunks * 100.0) + "%");
        this._outputProgressLabel.innerText = Math.round((this.currentChunk + 1) / this.totalChunks * 100.0) + "%";
        this.currentChunk++;
        if (this.currentChunk >= this.totalChunks) {
            this.synth.renderingSong = false;
            this._outputProgressLabel.innerText = "Encoding...";
            if (this.thenExportTo == "wav") {
                this._exportToWavFinish();
            }
            else if (this.thenExportTo == "mp3") {
                this._exportToMp3Finish();
            }
            else {
                throw new Error("Unrecognized file export type chosen!");
            }
        }
        else {
            setTimeout(() => { this._synthesize(); });
        }
    }
    _exportTo(type) {
        this.thenExportTo = type;
        this.currentChunk = 0;
        this.synth = new Synth(this._doc.song);
        if (type == "wav") {
            this.synth.samplesPerSecond = 48000;
        }
        else if (type == "mp3") {
            this.synth.samplesPerSecond = 44100;
        }
        else {
            throw new Error("Unrecognized file export type chosen!");
        }
        this._outputProgressBar.style.setProperty("width", "0%");
        this._outputProgressLabel.innerText = "0%";
        this.synth.loopRepeatCount = Number(this._loopDropDown.value) - 1;
        if (!this._enableIntro.checked) {
            for (let introIter = 0; introIter < this._doc.song.loopStart; introIter++) {
                this.synth.goToNextBar();
            }
        }
        this.synth.warmUpSynthesizer(this._doc.song);
        this.synth.computeLatestModValues();
        this.sampleFrames = this.synth.getTotalSamples(this._enableIntro.checked, this._enableOutro.checked, this.synth.loopRepeatCount);
        this.totalChunks = Math.ceil(this.sampleFrames / (this.synth.samplesPerSecond * 5));
        this.recordedSamplesL = new Float32Array(this.sampleFrames);
        this.recordedSamplesR = new Float32Array(this.sampleFrames);
        setTimeout(() => { this._synthesize(); });
    }
    _exportToWavFinish() {
        const sampleFrames = this.recordedSamplesL.length;
        const sampleRate = this.synth.samplesPerSecond;
        const wavChannelCount = 2;
        const bytesPerSample = 2;
        const bitsPerSample = 8 * bytesPerSample;
        const sampleCount = wavChannelCount * sampleFrames;
        const totalFileSize = 44 + sampleCount * bytesPerSample;
        let index = 0;
        const arrayBuffer = new ArrayBuffer(totalFileSize);
        const data = new DataView(arrayBuffer);
        data.setUint32(index, 0x52494646, false);
        index += 4;
        data.setUint32(index, 36 + sampleCount * bytesPerSample, true);
        index += 4;
        data.setUint32(index, 0x57415645, false);
        index += 4;
        data.setUint32(index, 0x666D7420, false);
        index += 4;
        data.setUint32(index, 0x00000010, true);
        index += 4;
        data.setUint16(index, 0x0001, true);
        index += 2;
        data.setUint16(index, wavChannelCount, true);
        index += 2;
        data.setUint32(index, sampleRate, true);
        index += 4;
        data.setUint32(index, sampleRate * bytesPerSample * wavChannelCount, true);
        index += 4;
        data.setUint16(index, bytesPerSample * wavChannelCount, true);
        index += 2;
        data.setUint16(index, bitsPerSample, true);
        index += 2;
        data.setUint32(index, 0x64617461, false);
        index += 4;
        data.setUint32(index, sampleCount * bytesPerSample, true);
        index += 4;
        if (bytesPerSample > 1) {
            const range = (1 << (bitsPerSample - 1)) - 1;
            for (let i = 0; i < sampleFrames; i++) {
                let valL = Math.floor(Math.max(-1, Math.min(1, this.recordedSamplesL[i])) * range);
                let valR = Math.floor(Math.max(-1, Math.min(1, this.recordedSamplesR[i])) * range);
                if (bytesPerSample == 2) {
                    data.setInt16(index, valL, true);
                    index += 2;
                    data.setInt16(index, valR, true);
                    index += 2;
                }
                else if (bytesPerSample == 4) {
                    data.setInt32(index, valL, true);
                    index += 4;
                    data.setInt32(index, valR, true);
                    index += 4;
                }
                else {
                    throw new Error("unsupported sample size");
                }
            }
        }
        else {
            for (let i = 0; i < sampleFrames; i++) {
                let valL = Math.floor(Math.max(-1, Math.min(1, this.recordedSamplesL[i])) * 127 + 128);
                let valR = Math.floor(Math.max(-1, Math.min(1, this.recordedSamplesR[i])) * 127 + 128);
                data.setUint8(index, valL > 255 ? 255 : (valL < 0 ? 0 : valL));
                index++;
                data.setUint8(index, valR > 255 ? 255 : (valR < 0 ? 0 : valR));
                index++;
            }
        }
        const blob = new Blob([arrayBuffer], { type: "audio/wav" });
        save(blob, this._fileName.value.trim() + ".wav");
        this._close();
    }
    _exportToMp3Finish() {
        const whenEncoderIsAvailable = () => {
            const lamejs = window["lamejs"];
            const channelCount = 2;
            const kbps = 192;
            const sampleBlockSize = 1152;
            const mp3encoder = new lamejs.Mp3Encoder(channelCount, this.synth.samplesPerSecond, kbps);
            const mp3Data = [];
            const left = new Int16Array(this.recordedSamplesL.length);
            const right = new Int16Array(this.recordedSamplesR.length);
            const range = (1 << 15) - 1;
            for (let i = 0; i < this.recordedSamplesL.length; i++) {
                left[i] = Math.floor(Math.max(-1, Math.min(1, this.recordedSamplesL[i])) * range);
                right[i] = Math.floor(Math.max(-1, Math.min(1, this.recordedSamplesR[i])) * range);
            }
            for (let i = 0; i < left.length; i += sampleBlockSize) {
                const leftChunk = left.subarray(i, i + sampleBlockSize);
                const rightChunk = right.subarray(i, i + sampleBlockSize);
                const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
                if (mp3buf.length > 0)
                    mp3Data.push(mp3buf);
            }
            const mp3buf = mp3encoder.flush();
            if (mp3buf.length > 0)
                mp3Data.push(mp3buf);
            const blob = new Blob(mp3Data, { type: "audio/mp3" });
            save(blob, this._fileName.value.trim() + ".mp3");
            this._close();
        };
        if ("lamejs" in window) {
            whenEncoderIsAvailable();
        }
        else {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js";
            script.onload = whenEncoderIsAvailable;
            document.head.appendChild(script);
        }
    }
    _exportToMidi() {
        const song = this._doc.song;
        const midiTicksPerBeepBoxTick = 2;
        const midiTicksPerBeat = midiTicksPerBeepBoxTick * Config.ticksPerPart * Config.partsPerBeat;
        const midiTicksPerPart = midiTicksPerBeepBoxTick * Config.ticksPerPart;
        const secondsPerMinute = 60;
        const microsecondsPerMinute = secondsPerMinute * 1000000;
        const beatsPerMinute = song.getBeatsPerMinute();
        const microsecondsPerBeat = Math.round(microsecondsPerMinute / beatsPerMinute);
        const midiTicksPerBar = midiTicksPerBeat * song.beatsPerBar;
        const pitchBendRange = 24;
        const defaultNoteVelocity = 90;
        const unrolledBars = [];
        if (this._enableIntro.checked) {
            for (let bar = 0; bar < song.loopStart; bar++) {
                unrolledBars.push(bar);
            }
        }
        for (let loopIndex = 0; loopIndex < Number(this._loopDropDown.value); loopIndex++) {
            for (let bar = song.loopStart; bar < song.loopStart + song.loopLength; bar++) {
                unrolledBars.push(bar);
            }
        }
        if (this._enableOutro.checked) {
            for (let bar = song.loopStart + song.loopLength; bar < song.barCount; bar++) {
                unrolledBars.push(bar);
            }
        }
        const tracks = [{ isMeta: true, channel: -1, midiChannel: -1, isNoise: false, isDrumset: false }];
        let midiChannelCounter = 0;
        let foundADrumset = false;
        for (let channel = 0; channel < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount; channel++) {
            if (!foundADrumset && this._doc.song.channels[channel].instruments[0].type == 4) {
                tracks.push({ isMeta: false, channel: channel, midiChannel: 9, isNoise: true, isDrumset: true });
                foundADrumset = true;
            }
            else {
                if (midiChannelCounter >= 16)
                    continue;
                tracks.push({ isMeta: false, channel: channel, midiChannel: midiChannelCounter++, isNoise: this._doc.song.getChannelIsNoise(channel), isDrumset: false });
                if (midiChannelCounter == 9)
                    midiChannelCounter++;
            }
        }
        const writer = new ArrayBufferWriter(1024);
        writer.writeUint32(1297377380);
        writer.writeUint32(6);
        writer.writeUint16(1);
        writer.writeUint16(tracks.length);
        writer.writeUint16(midiTicksPerBeat);
        for (const track of tracks) {
            writer.writeUint32(1297379947);
            const { isMeta, channel, midiChannel, isNoise, isDrumset } = track;
            const trackStartIndex = writer.getWriteIndex();
            writer.writeUint32(0);
            let prevTime = 0;
            let barStartTime = 0;
            const writeEventTime = function (time) {
                if (time < prevTime)
                    throw new Error("Midi event time cannot go backwards.");
                writer.writeMidiVariableLength(time - prevTime);
                prevTime = time;
            };
            const writeControlEvent = function (message, value) {
                if (!(value >= 0 && value <= 0x7F))
                    throw new Error("Midi control event value out of range: " + value);
                writer.writeUint8(176 | midiChannel);
                writer.writeMidi7Bits(message);
                writer.writeMidi7Bits(value | 0);
            };
            if (isMeta) {
                writeEventTime(0);
                writer.writeUint8(255);
                writer.writeMidi7Bits(1);
                writer.writeMidiAscii("Composed with jummbus.bitbucket.io");
                writeEventTime(0);
                writer.writeUint8(255);
                writer.writeMidi7Bits(81);
                writer.writeMidiVariableLength(3);
                writer.writeUint24(microsecondsPerBeat);
                writeEventTime(0);
                writer.writeUint8(255);
                writer.writeMidi7Bits(88);
                writer.writeMidiVariableLength(4);
                writer.writeUint8(song.beatsPerBar);
                writer.writeUint8(2);
                writer.writeUint8(24);
                writer.writeUint8(8);
                let tempScale = song.scale == Config.scales.dictionary["Custom"].index ? song.scaleCustom : Config.scales[song.scale].flags;
                const isMinor = tempScale[3] && !tempScale[4];
                const key = song.key;
                let numSharps = key;
                if ((key & 1) == 1)
                    numSharps += 6;
                if (isMinor)
                    numSharps += 9;
                while (numSharps > 6)
                    numSharps -= 12;
                writeEventTime(0);
                writer.writeUint8(255);
                writer.writeMidi7Bits(89);
                writer.writeMidiVariableLength(2);
                writer.writeInt8(numSharps);
                writer.writeUint8(isMinor ? 1 : 0);
                if (this._enableIntro.checked)
                    barStartTime += midiTicksPerBar * song.loopStart;
                writeEventTime(barStartTime);
                writer.writeUint8(255);
                writer.writeMidi7Bits(6);
                writer.writeMidiAscii("Loop Start");
                for (let loopIndex = 0; loopIndex < parseInt(this._loopDropDown.value); loopIndex++) {
                    barStartTime += midiTicksPerBar * song.loopLength;
                    writeEventTime(barStartTime);
                    writer.writeUint8(255);
                    writer.writeMidi7Bits(6);
                    writer.writeMidiAscii(loopIndex < Number(this._loopDropDown.value) - 1 ? "Loop Repeat" : "Loop End");
                }
                if (this._enableOutro.checked)
                    barStartTime += midiTicksPerBar * (song.barCount - song.loopStart - song.loopLength);
                if (barStartTime != midiTicksPerBar * unrolledBars.length)
                    throw new Error("Miscalculated number of bars.");
            }
            else {
                let channelName = isNoise
                    ? "noise channel " + channel
                    : "pitch channel " + channel;
                writeEventTime(0);
                writer.writeUint8(255);
                writer.writeMidi7Bits(3);
                writer.writeMidiAscii(channelName);
                writeEventTime(0);
                writeControlEvent(101, 0);
                writeEventTime(0);
                writeControlEvent(100, 0);
                writeEventTime(0);
                writeControlEvent(6, pitchBendRange);
                writeEventTime(0);
                writeControlEvent(38, 0);
                writeEventTime(0);
                writeControlEvent(101, 127);
                writeEventTime(0);
                writeControlEvent(100, 127);
                let prevInstrumentIndex = -1;
                function writeInstrumentSettings(instrumentIndex) {
                    const instrument = song.channels[channel].instruments[instrumentIndex];
                    const preset = EditorConfig.valueToPreset(instrument.preset);
                    if (prevInstrumentIndex != instrumentIndex) {
                        prevInstrumentIndex = instrumentIndex;
                        writeEventTime(barStartTime);
                        writer.writeUint8(255);
                        writer.writeMidi7Bits(4);
                        writer.writeMidiAscii("Instrument " + (instrumentIndex + 1));
                        if (!isDrumset) {
                            let instrumentProgram = 81;
                            if (preset != null && preset.midiProgram != undefined) {
                                instrumentProgram = preset.midiProgram;
                            }
                            else if (instrument.type == 4) {
                                instrumentProgram = 116;
                            }
                            else {
                                if (instrument.type == 2 || instrument.type == 3) {
                                    if (isNoise) {
                                        instrumentProgram = 116;
                                    }
                                    else {
                                        instrumentProgram = 75;
                                    }
                                }
                                else if (instrument.type == 0) {
                                    if (ExportPrompt.midiChipInstruments.length > instrument.chipWave) {
                                        instrumentProgram = ExportPrompt.midiChipInstruments[instrument.chipWave];
                                    }
                                }
                                else if (instrument.type == 6 || instrument.type == 1 || instrument.type == 5) {
                                    instrumentProgram = 81;
                                }
                                else if (instrument.type == 7) {
                                    instrumentProgram = 0x19;
                                }
                                else if (instrument.type == 8) {
                                    instrumentProgram = 81;
                                }
                                else {
                                    throw new Error("Unrecognized instrument type.");
                                }
                            }
                            writeEventTime(barStartTime);
                            writer.writeUint8(192 | midiChannel);
                            writer.writeMidi7Bits(instrumentProgram);
                        }
                        writeEventTime(barStartTime);
                        let instrumentVolume = volumeMultToMidiVolume(Synth.instrumentVolumeToVolumeMult(instrument.volume));
                        writeControlEvent(7, Math.min(0x7f, Math.round(instrumentVolume)));
                        writeEventTime(barStartTime);
                        let instrumentPan = (instrument.pan / Config.panCenter - 1) * 0x3f + 0x40;
                        writeControlEvent(10, Math.min(0x7f, Math.round(instrumentPan)));
                    }
                }
                if (song.getPattern(channel, 0) == null) {
                    writeInstrumentSettings(0);
                }
                let prevPitchBend = defaultMidiPitchBend;
                let prevExpression = defaultMidiExpression;
                let shouldResetExpressionAndPitchBend = false;
                const channelRoot = isNoise ? Config.spectrumBasePitch : Config.keys[song.key].basePitch;
                const intervalScale = isNoise ? Config.noiseInterval : 1;
                for (const bar of unrolledBars) {
                    const pattern = song.getPattern(channel, bar);
                    if (pattern != null) {
                        const instrumentIndex = pattern.instruments[0];
                        const instrument = song.channels[channel].instruments[instrumentIndex];
                        const preset = EditorConfig.valueToPreset(instrument.preset);
                        writeInstrumentSettings(instrumentIndex);
                        let usesArpeggio = instrument.getChord().arpeggiates;
                        let polyphony = usesArpeggio ? 1 : Config.maxChordSize;
                        if (instrument.getChord().customInterval) {
                            if (instrument.type == 0 || instrument.type == 5) {
                                polyphony = 2;
                                usesArpeggio = true;
                            }
                            else if (instrument.type == 1) {
                                polyphony = Config.operatorCount;
                            }
                            else {
                                console.error("Unrecognized instrument type for harmonizing arpeggio: " + instrument.type);
                            }
                        }
                        for (let noteIndex = 0; noteIndex < pattern.notes.length; noteIndex++) {
                            const note = pattern.notes[noteIndex];
                            const noteStartTime = barStartTime + note.start * midiTicksPerPart;
                            let pinTime = noteStartTime;
                            let pinSize = note.pins[0].size;
                            let pinInterval = note.pins[0].interval;
                            const prevPitches = [-1, -1, -1, -1];
                            const nextPitches = [-1, -1, -1, -1];
                            const toneCount = Math.min(polyphony, note.pitches.length);
                            const velocity = isDrumset ? Math.max(1, Math.round(defaultNoteVelocity * note.pins[0].size / Config.noteSizeMax)) : defaultNoteVelocity;
                            let mainInterval = note.pickMainInterval();
                            let pitchOffset = mainInterval * intervalScale;
                            if (!isDrumset) {
                                let maxPitchOffset = pitchBendRange;
                                let minPitchOffset = -pitchBendRange;
                                for (let pinIndex = 1; pinIndex < note.pins.length; pinIndex++) {
                                    const interval = note.pins[pinIndex].interval * intervalScale;
                                    maxPitchOffset = Math.min(maxPitchOffset, interval + pitchBendRange);
                                    minPitchOffset = Math.max(minPitchOffset, interval - pitchBendRange);
                                }
                                pitchOffset = Math.min(maxPitchOffset, Math.max(minPitchOffset, pitchOffset));
                            }
                            for (let pinIndex = 1; pinIndex < note.pins.length; pinIndex++) {
                                const nextPinTime = noteStartTime + note.pins[pinIndex].time * midiTicksPerPart;
                                const nextPinSize = note.pins[pinIndex].size;
                                const nextPinInterval = note.pins[pinIndex].interval;
                                const length = nextPinTime - pinTime;
                                for (let midiTick = 0; midiTick < length; midiTick++) {
                                    const midiTickTime = pinTime + midiTick;
                                    const linearSize = lerp(pinSize, nextPinSize, midiTick / length);
                                    const linearInterval = lerp(pinInterval, nextPinInterval, midiTick / length);
                                    const interval = linearInterval * intervalScale - pitchOffset;
                                    const pitchBend = Math.max(0, Math.min(0x3fff, Math.round(0x2000 * (1.0 + interval / pitchBendRange))));
                                    const expression = Math.min(0x7f, Math.round(volumeMultToMidiExpression(Synth.noteSizeToVolumeMult(linearSize))));
                                    if (pitchBend != prevPitchBend) {
                                        writeEventTime(midiTickTime);
                                        writer.writeUint8(224 | midiChannel);
                                        writer.writeMidi7Bits(pitchBend & 0x7f);
                                        writer.writeMidi7Bits((pitchBend >> 7) & 0x7f);
                                        prevPitchBend = pitchBend;
                                    }
                                    if (expression != prevExpression && !isDrumset) {
                                        writeEventTime(midiTickTime);
                                        writeControlEvent(11, expression);
                                        prevExpression = expression;
                                    }
                                    const noteStarting = midiTickTime == noteStartTime;
                                    for (let toneIndex = 0; toneIndex < toneCount; toneIndex++) {
                                        let nextPitch = note.pitches[toneIndex];
                                        if (isDrumset) {
                                            nextPitch += mainInterval;
                                            const drumsetMap = [
                                                36,
                                                41,
                                                45,
                                                48,
                                                40,
                                                39,
                                                59,
                                                49,
                                                46,
                                                55,
                                                69,
                                                54,
                                            ];
                                            if (nextPitch < 0 || nextPitch >= drumsetMap.length)
                                                throw new Error("Could not find corresponding drumset pitch. " + nextPitch);
                                            nextPitch = drumsetMap[nextPitch];
                                        }
                                        else {
                                            if (usesArpeggio && note.pitches.length > toneIndex + 1 && toneIndex == toneCount - 1) {
                                                const midiTicksSinceBeat = (midiTickTime - barStartTime) % midiTicksPerBeat;
                                                const midiTicksPerArpeggio = Config.ticksPerArpeggio * midiTicksPerPart / Config.ticksPerPart;
                                                const arpeggio = Math.floor(midiTicksSinceBeat / midiTicksPerArpeggio);
                                                nextPitch = note.pitches[toneIndex + getArpeggioPitchIndex(note.pitches.length - toneIndex, instrument.fastTwoNoteArp, arpeggio)];
                                            }
                                            nextPitch = channelRoot + nextPitch * intervalScale + pitchOffset;
                                            if (preset != null && preset.midiSubharmonicOctaves != undefined) {
                                                nextPitch += 12 * preset.midiSubharmonicOctaves;
                                            }
                                            else if (isNoise) {
                                                nextPitch += 12 * (+EditorConfig.presetCategories.dictionary["Drum Presets"].presets.dictionary["taiko drum"].midiSubharmonicOctaves);
                                            }
                                            if (isNoise)
                                                nextPitch *= 2;
                                        }
                                        nextPitch = Math.max(0, Math.min(127, nextPitch));
                                        nextPitches[toneIndex] = nextPitch;
                                        if (!noteStarting && prevPitches[toneIndex] != nextPitches[toneIndex]) {
                                            writeEventTime(midiTickTime);
                                            writer.writeUint8(128 | midiChannel);
                                            writer.writeMidi7Bits(prevPitches[toneIndex]);
                                            writer.writeMidi7Bits(velocity);
                                        }
                                    }
                                    for (let toneIndex = 0; toneIndex < toneCount; toneIndex++) {
                                        if (noteStarting || prevPitches[toneIndex] != nextPitches[toneIndex]) {
                                            writeEventTime(midiTickTime);
                                            writer.writeUint8(144 | midiChannel);
                                            writer.writeMidi7Bits(nextPitches[toneIndex]);
                                            writer.writeMidi7Bits(velocity);
                                            prevPitches[toneIndex] = nextPitches[toneIndex];
                                        }
                                    }
                                }
                                pinTime = nextPinTime;
                                pinSize = nextPinSize;
                                pinInterval = nextPinInterval;
                            }
                            const noteEndTime = barStartTime + note.end * midiTicksPerPart;
                            for (let toneIndex = 0; toneIndex < toneCount; toneIndex++) {
                                writeEventTime(noteEndTime);
                                writer.writeUint8(128 | midiChannel);
                                writer.writeMidi7Bits(prevPitches[toneIndex]);
                                writer.writeMidi7Bits(velocity);
                            }
                            shouldResetExpressionAndPitchBend = true;
                        }
                    }
                    else {
                        if (shouldResetExpressionAndPitchBend) {
                            shouldResetExpressionAndPitchBend = false;
                            if (prevExpression != defaultMidiExpression) {
                                prevExpression = defaultMidiExpression;
                                writeEventTime(barStartTime);
                                writeControlEvent(11, prevExpression);
                            }
                            if (prevPitchBend != defaultMidiPitchBend) {
                                prevPitchBend = defaultMidiPitchBend;
                                writeEventTime(barStartTime);
                                writer.writeUint8(224 | midiChannel);
                                writer.writeMidi7Bits(prevPitchBend & 0x7f);
                                writer.writeMidi7Bits((prevPitchBend >> 7) & 0x7f);
                            }
                        }
                    }
                    barStartTime += midiTicksPerBar;
                }
            }
            writeEventTime(barStartTime);
            writer.writeUint8(255);
            writer.writeMidi7Bits(47);
            writer.writeMidiVariableLength(0x00);
            writer.rewriteUint32(trackStartIndex, writer.getWriteIndex() - trackStartIndex - 4);
        }
        const blob = new Blob([writer.toCompactArrayBuffer()], { type: "audio/midi" });
        save(blob, this._fileName.value.trim() + ".mid");
        this._close();
    }
    _exportToJson() {
        const jsonObject = this._doc.song.toJsonObject(this._enableIntro.checked, Number(this._loopDropDown.value), this._enableOutro.checked);
        const jsonString = JSON.stringify(jsonObject, null, '\t');
        const blob = new Blob([jsonString], { type: "application/json" });
        save(blob, this._fileName.value.trim() + ".json");
        this._close();
    }
    _exportToHtml() {
        const fileContents = `\
<!DOCTYPE html><meta charset="utf-8">

You should be redirected to the song at:<br /><br />

<a id="destination" href="${new URL("#" + this._doc.song.toBase64String(), location.href).href}"></a>

<style>
	:root {
		color: white;
		background: black;
		font-family:
		sans-serif;
	}
	a {
		color: #98f;
	}
	a[href]::before {
		content: attr(href);
	}
</style>

<script>
	location.assign(document.querySelector("a#destination").href);
</script>
`;
        const blob = new Blob([fileContents], { type: "text/html" });
        save(blob, this._fileName.value.trim() + ".html");
        this._close();
    }
}
ExportPrompt.midiChipInstruments = [
    0x4A,
    0x47,
    0x50,
    0x46,
    0x44,
    0x51,
    0x51,
    0x51,
    0x51,
];
//# sourceMappingURL=ExportPrompt.js.map