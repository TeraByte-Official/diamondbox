import { Config, effectsIncludeDistortion } from "../synth/SynthConfig";
import { Note, makeNotePin, Pattern, FilterControlPoint, Instrument, Channel, Synth } from "../synth/synth";
import { EditorConfig } from "./EditorConfig";
import { Change, ChangeGroup, ChangeSequence, UndoableChange } from "./Change";
import { ColorConfig } from "./ColorConfig";
export function patternsContainSameInstruments(pattern1Instruments, pattern2Instruments) {
    const pattern2Has1Instruments = pattern1Instruments.every(instrument => pattern2Instruments.indexOf(instrument) != -1);
    const pattern1Has2Instruments = pattern2Instruments.every(instrument => pattern1Instruments.indexOf(instrument) != -1);
    return pattern2Has1Instruments && pattern1Has2Instruments && pattern2Instruments.length == pattern1Instruments.length;
}
export function discardInvalidPatternInstruments(instruments, song, channelIndex) {
    const uniqueInstruments = new Set(instruments);
    instruments.length = 0;
    instruments.push(...uniqueInstruments);
    for (let i = 0; i < instruments.length; i++) {
        if (instruments[i] >= song.channels[channelIndex].instruments.length) {
            instruments.splice(i, 1);
            i--;
        }
    }
    if (instruments.length > song.getMaxInstrumentsPerPattern(channelIndex)) {
        instruments.length = song.getMaxInstrumentsPerPattern(channelIndex);
    }
    if (instruments.length <= 0) {
        instruments[0] = 0;
    }
}
export function unionOfUsedNotes(pattern, flags) {
    for (const note of pattern.notes) {
        for (const pitch of note.pitches) {
            for (const pin of note.pins) {
                const key = (pitch + pin.interval) % 12;
                if (!flags[key]) {
                    flags[key] = true;
                }
            }
        }
    }
}
export function generateScaleMap(oldScaleFlags, newScaleValue, customScaleFlags) {
    const newScaleFlags = newScaleValue == Config.scales["dictionary"]["Custom"].index ? customScaleFlags : Config.scales[newScaleValue].flags;
    const oldScale = [];
    const newScale = [];
    for (let i = 0; i < 12; i++) {
        if (oldScaleFlags[i])
            oldScale.push(i);
        if (newScaleFlags[i])
            newScale.push(i);
    }
    const largerToSmaller = oldScale.length > newScale.length;
    const smallerScale = largerToSmaller ? newScale : oldScale;
    const largerScale = largerToSmaller ? oldScale : newScale;
    const roles = ["root", "second", "second", "third", "third", "fourth", "tritone", "fifth", "sixth", "sixth", "seventh", "seventh", "root"];
    let bestScore = Number.MAX_SAFE_INTEGER;
    let bestIndexMap = [];
    const stack = [[0]];
    while (stack.length > 0) {
        const indexMap = stack.pop();
        if (indexMap.length == smallerScale.length) {
            let score = 0;
            for (let i = 0; i < indexMap.length; i++) {
                score += Math.abs(smallerScale[i] - largerScale[indexMap[i]]);
                if (roles[smallerScale[i]] != roles[largerScale[indexMap[i]]]) {
                    score += 0.75;
                }
            }
            if (bestScore > score) {
                bestScore = score;
                bestIndexMap = indexMap;
            }
        }
        else {
            const lowIndex = indexMap[indexMap.length - 1] + 1;
            const highIndex = largerScale.length - smallerScale.length + indexMap.length;
            for (let i = lowIndex; i <= highIndex; i++) {
                stack.push(indexMap.concat(i));
            }
        }
    }
    const sparsePitchMap = [];
    for (let i = 0; i < bestIndexMap.length; i++) {
        const smallerScalePitch = smallerScale[i];
        const largerScalePitch = largerScale[bestIndexMap[i]];
        sparsePitchMap[i] = largerToSmaller
            ? [largerScalePitch, smallerScalePitch]
            : [smallerScalePitch, largerScalePitch];
    }
    sparsePitchMap.push([12, 12]);
    newScale.push(12);
    let sparseIndex = 0;
    const fullPitchMap = [];
    for (let i = 0; i < 12; i++) {
        const oldLow = sparsePitchMap[sparseIndex][0];
        const newLow = sparsePitchMap[sparseIndex][1];
        const oldHigh = sparsePitchMap[sparseIndex + 1][0];
        const newHigh = sparsePitchMap[sparseIndex + 1][1];
        if (i == oldHigh - 1)
            sparseIndex++;
        const transformedPitch = (i - oldLow) * (newHigh - newLow) / (oldHigh - oldLow) + newLow;
        let nearestPitch = 0;
        let nearestPitchDistance = Number.MAX_SAFE_INTEGER;
        for (const newPitch of newScale) {
            let distance = Math.abs(newPitch - transformedPitch);
            if (roles[newPitch] != roles[i]) {
                distance += 0.1;
            }
            if (nearestPitchDistance > distance) {
                nearestPitchDistance = distance;
                nearestPitch = newPitch;
            }
        }
        fullPitchMap[i] = nearestPitch;
    }
    return fullPitchMap;
}
function removeRedundantPins(pins) {
    for (let i = 1; i < pins.length - 1;) {
        if (pins[i - 1].interval == pins[i].interval &&
            pins[i].interval == pins[i + 1].interval &&
            pins[i - 1].size == pins[i].size &&
            pins[i].size == pins[i + 1].size) {
            pins.splice(i, 1);
        }
        else {
            i++;
        }
    }
}
function projectNoteIntoBar(oldNote, timeOffset, noteStartPart, noteEndPart, newNotes) {
    const newNote = new Note(-1, noteStartPart, noteEndPart, Config.noteSizeMax, false);
    newNote.pins.length = 0;
    newNote.pitches.length = 0;
    const newNoteLength = noteEndPart - noteStartPart;
    for (const pitch of oldNote.pitches) {
        newNote.pitches.push(pitch);
    }
    for (let pinIndex = 0; pinIndex < oldNote.pins.length; pinIndex++) {
        const pin = oldNote.pins[pinIndex];
        const newPinTime = pin.time + timeOffset;
        if (newPinTime < 0) {
            if (pinIndex + 1 >= oldNote.pins.length)
                throw new Error("Error converting pins in note overflow.");
            const nextPin = oldNote.pins[pinIndex + 1];
            const nextPinTime = nextPin.time + timeOffset;
            if (nextPinTime > 0) {
                const ratio = (-newPinTime) / (nextPinTime - newPinTime);
                newNote.pins.push(makeNotePin(Math.round(pin.interval + ratio * (nextPin.interval - pin.interval)), 0, Math.round(pin.size + ratio * (nextPin.size - pin.size))));
            }
        }
        else if (newPinTime <= newNoteLength) {
            newNote.pins.push(makeNotePin(pin.interval, newPinTime, pin.size));
        }
        else {
            if (pinIndex < 1)
                throw new Error("Error converting pins in note overflow.");
            const prevPin = oldNote.pins[pinIndex - 1];
            const prevPinTime = prevPin.time + timeOffset;
            if (prevPinTime < newNoteLength) {
                const ratio = (newNoteLength - prevPinTime) / (newPinTime - prevPinTime);
                newNote.pins.push(makeNotePin(Math.round(prevPin.interval + ratio * (pin.interval - prevPin.interval)), newNoteLength, Math.round(prevPin.size + ratio * (pin.size - prevPin.size))));
            }
        }
    }
    const offsetInterval = newNote.pins[0].interval;
    for (let pitchIdx = 0; pitchIdx < newNote.pitches.length; pitchIdx++) {
        newNote.pitches[pitchIdx] += offsetInterval;
    }
    for (let pinIdx = 0; pinIdx < newNote.pins.length; pinIdx++) {
        newNote.pins[pinIdx].interval -= offsetInterval;
    }
    let joinedWithPrevNote = false;
    if (newNote.start == 0) {
        newNote.continuesLastPattern = (timeOffset < 0 || oldNote.continuesLastPattern);
    }
    else {
        newNote.continuesLastPattern = false;
        if (newNotes.length > 0 && oldNote.continuesLastPattern) {
            const prevNote = newNotes[newNotes.length - 1];
            if (prevNote.end == newNote.start && Synth.adjacentNotesHaveMatchingPitches(prevNote, newNote)) {
                joinedWithPrevNote = true;
                const newIntervalOffset = prevNote.pins[prevNote.pins.length - 1].interval;
                const newTimeOffset = prevNote.end - prevNote.start;
                for (let pinIndex = 1; pinIndex < newNote.pins.length; pinIndex++) {
                    const tempPin = newNote.pins[pinIndex];
                    const transformedPin = makeNotePin(tempPin.interval + newIntervalOffset, tempPin.time + newTimeOffset, tempPin.size);
                    prevNote.pins.push(transformedPin);
                    prevNote.end = prevNote.start + transformedPin.time;
                }
                removeRedundantPins(prevNote.pins);
            }
        }
    }
    if (!joinedWithPrevNote) {
        newNotes.push(newNote);
    }
}
export class ChangeMoveAndOverflowNotes extends ChangeGroup {
    constructor(doc, newBeatsPerBar, partsToMove) {
        super();
        const pitchChannels = [];
        const noiseChannels = [];
        const modChannels = [];
        for (let channelIndex = 0; channelIndex < doc.song.getChannelCount(); channelIndex++) {
            const oldChannel = doc.song.channels[channelIndex];
            const newChannel = new Channel();
            if (channelIndex < doc.song.pitchChannelCount) {
                pitchChannels.push(newChannel);
            }
            else if (channelIndex < doc.song.pitchChannelCount + doc.song.noiseChannelCount) {
                noiseChannels.push(newChannel);
            }
            else {
                modChannels.push(newChannel);
            }
            newChannel.muted = oldChannel.muted;
            newChannel.octave = oldChannel.octave;
            newChannel.name = oldChannel.name;
            for (const instrument of oldChannel.instruments) {
                newChannel.instruments.push(instrument);
            }
            const oldPartsPerBar = Config.partsPerBeat * doc.song.beatsPerBar;
            const newPartsPerBar = Config.partsPerBeat * newBeatsPerBar;
            let currentBar = -1;
            let pattern = null;
            for (let oldBar = 0; oldBar < doc.song.barCount; oldBar++) {
                const oldPattern = doc.song.getPattern(channelIndex, oldBar);
                if (oldPattern != null) {
                    const oldBarStart = oldBar * oldPartsPerBar;
                    for (const oldNote of oldPattern.notes) {
                        const absoluteNoteStart = oldNote.start + oldBarStart + partsToMove;
                        const absoluteNoteEnd = oldNote.end + oldBarStart + partsToMove;
                        const startBar = Math.floor(absoluteNoteStart / newPartsPerBar);
                        const endBar = Math.ceil(absoluteNoteEnd / newPartsPerBar);
                        for (let bar = startBar; bar < endBar; bar++) {
                            const barStartPart = bar * newPartsPerBar;
                            const noteStartPart = Math.max(0, absoluteNoteStart - barStartPart);
                            const noteEndPart = Math.min(newPartsPerBar, absoluteNoteEnd - barStartPart);
                            if (noteStartPart < noteEndPart) {
                                if (currentBar < bar || pattern == null) {
                                    currentBar++;
                                    while (currentBar < bar) {
                                        newChannel.bars[currentBar] = 0;
                                        currentBar++;
                                    }
                                    pattern = new Pattern();
                                    newChannel.patterns.push(pattern);
                                    newChannel.bars[currentBar] = newChannel.patterns.length;
                                    pattern.instruments.length = 0;
                                    pattern.instruments.push(...oldPattern.instruments);
                                }
                                pattern = newChannel.patterns[newChannel.bars[bar] - 1];
                                projectNoteIntoBar(oldNote, absoluteNoteStart - barStartPart - noteStartPart, noteStartPart, noteEndPart, pattern.notes);
                            }
                        }
                    }
                }
            }
        }
        removeDuplicatePatterns(pitchChannels);
        removeDuplicatePatterns(noiseChannels);
        removeDuplicatePatterns(modChannels);
        this.append(new ChangeReplacePatterns(doc, pitchChannels, noiseChannels, modChannels));
    }
}
class ChangePins extends UndoableChange {
    constructor(_doc, _note) {
        super(false);
        this._doc = _doc;
        this._note = _note;
        this._oldStart = this._note.start;
        this._oldEnd = this._note.end;
        this._newStart = this._note.start;
        this._newEnd = this._note.end;
        this._oldPins = this._note.pins;
        this._newPins = [];
        this._oldPitches = this._note.pitches;
        this._newPitches = [];
        this._oldContinuesLastPattern = this._note.continuesLastPattern;
        this._newContinuesLastPattern = this._note.continuesLastPattern;
    }
    _finishSetup(continuesLastPattern) {
        for (let i = 0; i < this._newPins.length - 1;) {
            if (this._newPins[i].time >= this._newPins[i + 1].time) {
                this._newPins.splice(i, 1);
            }
            else {
                i++;
            }
        }
        removeRedundantPins(this._newPins);
        const firstInterval = this._newPins[0].interval;
        const firstTime = this._newPins[0].time;
        for (let i = 0; i < this._oldPitches.length; i++) {
            this._newPitches[i] = this._oldPitches[i] + firstInterval;
        }
        for (let i = 0; i < this._newPins.length; i++) {
            this._newPins[i].interval -= firstInterval;
            this._newPins[i].time -= firstTime;
        }
        this._newStart = this._oldStart + firstTime;
        this._newEnd = this._newStart + this._newPins[this._newPins.length - 1].time;
        if (continuesLastPattern != undefined) {
            this._newContinuesLastPattern = continuesLastPattern;
        }
        if (this._newStart != 0) {
            this._newContinuesLastPattern = false;
        }
        this._doForwards();
        this._didSomething();
    }
    _doForwards() {
        this._note.pins = this._newPins;
        this._note.pitches = this._newPitches;
        this._note.start = this._newStart;
        this._note.end = this._newEnd;
        this._note.continuesLastPattern = this._newContinuesLastPattern;
        if (this._doc != null)
            this._doc.notifier.changed();
    }
    _doBackwards() {
        this._note.pins = this._oldPins;
        this._note.pitches = this._oldPitches;
        this._note.start = this._oldStart;
        this._note.end = this._oldEnd;
        this._note.continuesLastPattern = this._oldContinuesLastPattern;
        if (this._doc != null)
            this._doc.notifier.changed();
    }
}
export class ChangeCustomizeInstrument extends Change {
    constructor(doc) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (instrument.preset != instrument.type) {
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeCustomWave extends Change {
    constructor(doc, newArray) {
        super();
        const oldArray = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].customChipWave;
        var comparisonResult = true;
        for (let i = 0; i < oldArray.length; i++) {
            if (oldArray[i] != newArray[i]) {
                comparisonResult = false;
                i = oldArray.length;
            }
        }
        if (comparisonResult == false) {
            let instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
            for (let i = 0; i < newArray.length; i++) {
                instrument.customChipWave[i] = newArray[i];
            }
            let sum = 0.0;
            for (let i = 0; i < instrument.customChipWave.length; i++) {
                sum += instrument.customChipWave[i];
            }
            const average = sum / instrument.customChipWave.length;
            let cumulative = 0;
            let wavePrev = 0;
            for (let i = 0; i < instrument.customChipWave.length; i++) {
                cumulative += wavePrev;
                wavePrev = instrument.customChipWave[i] - average;
                instrument.customChipWaveIntegral[i] = cumulative;
            }
            instrument.customChipWaveIntegral[64] = 0.0;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeCustomAlgorythmorFeedback extends Change {
    constructor(doc, newArray, carry, mode) {
        super();
        if (mode == "algorithm") {
            const oldArray = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].customAlgorithm.modulatedBy;
            const oldCarriercount = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].customAlgorithm.carrierCount;
            var comparisonResult = true;
            if (carry != oldCarriercount) {
                comparisonResult = false;
            }
            else {
                for (let i = 0; i < oldArray.length; i++) {
                    if (oldArray[i].length != newArray[i].length) {
                        comparisonResult = false;
                        break;
                    }
                    else {
                        for (let j = 0; j < oldArray[i].length; j++) {
                            if (oldArray[i][j] != newArray[i][j]) {
                                comparisonResult = false;
                                break;
                            }
                        }
                    }
                }
            }
            if (comparisonResult == false) {
                let instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
                instrument.customAlgorithm.set(carry, newArray);
                instrument.algorithm6Op = 0;
                doc.notifier.changed();
                this._didSomething();
            }
        }
        else if (mode == "feedback") {
            const oldArray = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].customFeedbackType.indices;
            var comparisonResult = true;
            for (let i = 0; i < oldArray.length; i++) {
                if (oldArray[i].length != newArray[i].length) {
                    comparisonResult = false;
                    break;
                }
                else {
                    for (let j = 0; j < oldArray[i].length; j++) {
                        if (oldArray[i][j] != newArray[i][j]) {
                            comparisonResult = false;
                            break;
                        }
                    }
                }
            }
            if (!comparisonResult) {
                let instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
                instrument.customFeedbackType.set(newArray);
                instrument.feedbackType6Op = 0;
                doc.notifier.changed();
                this._didSomething();
            }
        }
    }
}
export class ChangePreset extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.preset;
        if (oldValue != newValue) {
            const preset1 = EditorConfig.instrumentToPreset(newValue);
            const preset = preset1 !== null && preset1 !== void 0 ? preset1 : EditorConfig.valueToPreset(newValue);
            if (preset != null) {
                if (preset.customType != undefined) {
                    instrument.type = preset.customType;
                    if (!Config.instrumentTypeHasSpecialInterval[instrument.type] && Config.chords[instrument.chord].customInterval) {
                        instrument.chord = 0;
                    }
                    instrument.clearInvalidEnvelopeTargets();
                }
                else if (preset.settings != undefined) {
                    const tempVolume = instrument.volume;
                    const tempPan = instrument.pan;
                    const tempPanDelay = instrument.panDelay;
                    instrument.fromJsonObject(preset.settings, doc.song.getChannelIsNoise(doc.channel), doc.song.getChannelIsMod(doc.channel), doc.song.rhythm == 0 || doc.song.rhythm == 2, doc.song.rhythm >= 2);
                    instrument.volume = tempVolume;
                    instrument.pan = tempPan;
                    instrument.panDelay = tempPanDelay;
                    instrument.effects = (instrument.effects | (1 << 2));
                }
            }
            instrument.preset = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeRandomGeneratedInstrument extends Change {
    constructor(doc) {
        super();
        function selectWeightedRandom(entries) {
            let total = 0;
            for (const entry of entries) {
                total += entry.weight;
            }
            let random = Math.random() * total;
            for (const entry of entries) {
                random -= entry.weight;
                if (random <= 0.0)
                    return entry.item;
            }
            return entries[(Math.random() * entries.length) | 0].item;
        }
        function selectCurvedDistribution(min, max, peak, width) {
            const entries = [];
            for (let i = min; i <= max; i++) {
                entries.push({ item: i, weight: 1.0 / (Math.pow((i - peak) / width, 2.0) + 1.0) });
            }
            return selectWeightedRandom(entries);
        }
        class PotentialFilterPoint {
            constructor(chance, type, minFreq, maxFreq, centerHz, centerGain) {
                this.chance = chance;
                this.type = type;
                this.minFreq = minFreq;
                this.maxFreq = maxFreq;
                this.centerHz = centerHz;
                this.centerGain = centerGain;
            }
            ;
        }
        function applyFilterPoints(filter, potentialPoints) {
            filter.reset();
            const usedFreqs = [];
            for (const potentialPoint of potentialPoints) {
                if (Math.random() > potentialPoint.chance)
                    continue;
                const point = new FilterControlPoint();
                point.type = potentialPoint.type;
                point.freq = selectCurvedDistribution(potentialPoint.minFreq, potentialPoint.maxFreq, FilterControlPoint.getRoundedSettingValueFromHz(potentialPoint.centerHz), 1.0 / Config.filterFreqStep);
                point.gain = selectCurvedDistribution(0, Config.filterGainRange - 1, Config.filterGainCenter + potentialPoint.centerGain, 2.0 / Config.filterGainStep);
                if (point.type == 2 && point.gain == Config.filterGainCenter)
                    continue;
                if (usedFreqs.includes(point.freq))
                    continue;
                usedFreqs.push(point.freq);
                filter.controlPoints[filter.controlPointCount] = point;
                filter.controlPointCount++;
            }
        }
        const isNoise = doc.song.getChannelIsNoise(doc.channel);
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        instrument.effects &= 1 << 2;
        instrument.envelopeCount = 0;
        const midFreq = FilterControlPoint.getRoundedSettingValueFromHz(700.0);
        const maxFreq = Config.filterFreqRange - 1;
        applyFilterPoints(instrument.eqFilter, [
            new PotentialFilterPoint(0.8, 0, midFreq, maxFreq, 4000.0, -1),
            new PotentialFilterPoint(0.4, 1, 0, midFreq - 1, 250.0, -1),
            new PotentialFilterPoint(0.5, 2, 0, maxFreq, 2000.0, 0),
            new PotentialFilterPoint(0.4, 2, 0, maxFreq, 1400.0, 0),
            new PotentialFilterPoint(0.3, 2, 0, maxFreq, 1000.0, 0),
            new PotentialFilterPoint(0.2, 2, 0, maxFreq, 500.0, 0),
        ]);
        if (isNoise) {
            const type = selectWeightedRandom([
                { item: 2, weight: 1 },
                { item: 3, weight: 3 },
            ]);
            instrument.preset = instrument.type = type;
            instrument.fadeIn = (Math.random() < 0.8) ? 0 : selectCurvedDistribution(0, Config.fadeInRange - 1, 0, 2);
            instrument.fadeOut = selectCurvedDistribution(0, Config.fadeOutTicks.length - 1, Config.fadeOutNeutral, 2);
            if (Math.random() < 0.1) {
                instrument.effects |= 1 << 10;
                instrument.transition = Config.transitions.dictionary[selectWeightedRandom([
                    { item: "normal", weight: 30 },
                    { item: "interrupt", weight: 1 },
                    { item: "slide", weight: 2 },
                ])].index;
            }
            if (Math.random() < 0.2) {
                instrument.effects |= 1 << 11;
                instrument.chord = Config.chords.dictionary[selectWeightedRandom([
                    { item: "strum", weight: 2 },
                    { item: "arpeggio", weight: 1 },
                ])].index;
            }
            if (Math.random() < 0.1) {
                instrument.pitchShift = selectCurvedDistribution(0, Config.pitchShiftRange - 1, Config.pitchShiftCenter, 2);
                if (instrument.pitchShift != Config.pitchShiftCenter) {
                    instrument.effects |= 1 << 7;
                    instrument.addEnvelope(Config.instrumentAutomationTargets.dictionary["pitchShift"].index, 0, Config.envelopes.dictionary[selectWeightedRandom([
                        { item: "flare 1", weight: 2 },
                        { item: "flare 2", weight: 1 },
                        { item: "flare 3", weight: 1 },
                        { item: "twang 1", weight: 16 },
                        { item: "twang 2", weight: 8 },
                        { item: "twang 3", weight: 4 },
                        { item: "tremolo1", weight: 1 },
                        { item: "tremolo2", weight: 1 },
                        { item: "tremolo3", weight: 1 },
                        { item: "decay 1", weight: 4 },
                        { item: "decay 2", weight: 2 },
                        { item: "decay 3", weight: 1 },
                    ])].index);
                }
            }
            if (Math.random() < 0.1) {
                instrument.effects |= 1 << 9;
                instrument.vibrato = selectCurvedDistribution(0, Config.echoSustainRange - 1, Config.echoSustainRange >> 1, 2);
                instrument.vibrato = Config.vibratos.dictionary[selectWeightedRandom([
                    { item: "light", weight: 2 },
                    { item: "delayed", weight: 2 },
                    { item: "heavy", weight: 1 },
                    { item: "shaky", weight: 2 },
                ])].index;
            }
            if (Math.random() < 0.8) {
                instrument.effects |= 1 << 5;
                applyFilterPoints(instrument.noteFilter, [
                    new PotentialFilterPoint(1.0, 0, midFreq, maxFreq, 8000.0, -1),
                ]);
                instrument.addEnvelope(Config.instrumentAutomationTargets.dictionary["noteFilterAllFreqs"].index, 0, Config.envelopes.dictionary[selectWeightedRandom([
                    { item: "punch", weight: 4 },
                    { item: "flare 1", weight: 2 },
                    { item: "flare 2", weight: 2 },
                    { item: "flare 3", weight: 2 },
                    { item: "twang 1", weight: 8 },
                    { item: "twang 2", weight: 8 },
                    { item: "twang 3", weight: 8 },
                    { item: "swell 1", weight: 2 },
                    { item: "swell 2", weight: 2 },
                    { item: "swell 3", weight: 1 },
                    { item: "tremolo1", weight: 1 },
                    { item: "tremolo2", weight: 1 },
                    { item: "tremolo3", weight: 1 },
                    { item: "tremolo4", weight: 1 },
                    { item: "tremolo5", weight: 1 },
                    { item: "tremolo6", weight: 1 },
                    { item: "decay 1", weight: 4 },
                    { item: "decay 2", weight: 4 },
                    { item: "decay 3", weight: 4 },
                    { item: "wibble 1", weight: 2 },
                    { item: "wibble 2", weight: 2 },
                    { item: "wibble 3", weight: 2 },
                    { item: "linear 1", weight: 2 },
                    { item: "linear 2", weight: 2 },
                    { item: "linear 3", weight: 2 },
                    { item: "linear-1", weight: 1 },
                ])].index);
            }
            if (Math.random() < 0.1) {
                instrument.effects |= 1 << 3;
                instrument.distortion = selectCurvedDistribution(1, Config.distortionRange - 1, Config.distortionRange - 1, 2);
            }
            if (Math.random() < 0.1) {
                instrument.effects |= 1 << 4;
                instrument.bitcrusherFreq = selectCurvedDistribution(0, Config.bitcrusherFreqRange - 1, Config.bitcrusherFreqRange >> 1, 2);
                instrument.bitcrusherQuantization = selectCurvedDistribution(0, Config.bitcrusherQuantizationRange - 1, Config.bitcrusherQuantizationRange >> 1, 2);
            }
            if (Math.random() < 0.1) {
                instrument.effects |= 1 << 1;
                instrument.chorus = selectCurvedDistribution(1, Config.chorusRange - 1, Config.chorusRange - 1, 1);
            }
            if (Math.random() < 0.1) {
                instrument.echoSustain = selectCurvedDistribution(0, Config.echoSustainRange - 1, Config.echoSustainRange >> 1, 2);
                instrument.echoDelay = selectCurvedDistribution(0, Config.echoDelayRange - 1, Config.echoDelayRange >> 1, 2);
                if (instrument.echoSustain != 0 || instrument.echoDelay != 0) {
                    instrument.effects |= 1 << 6;
                }
            }
            if (Math.random() < 0.5) {
                instrument.effects |= 1 << 0;
                instrument.reverb = selectCurvedDistribution(1, Config.reverbRange - 1, 1, 1);
            }
            function normalize(harmonics) {
                let max = 0;
                for (const value of harmonics) {
                    if (value > max)
                        max = value;
                }
                for (let i = 0; i < harmonics.length; i++) {
                    harmonics[i] = Config.harmonicsMax * harmonics[i] / max;
                }
            }
            switch (type) {
                case 2:
                    {
                        instrument.chipNoise = (Math.random() * Config.chipNoises.length) | 0;
                    }
                    break;
                case 3:
                    {
                        const spectrumGenerators = [
                            () => {
                                const spectrum = [];
                                for (let i = 0; i < Config.spectrumControlPoints; i++) {
                                    spectrum[i] = (Math.random() < 0.5) ? Math.random() : 0.0;
                                }
                                return spectrum;
                            },
                            () => {
                                let current = 1.0;
                                const spectrum = [current];
                                for (let i = 1; i < Config.spectrumControlPoints; i++) {
                                    current *= Math.pow(2, Math.random() - 0.52);
                                    spectrum[i] = current;
                                }
                                return spectrum;
                            },
                            () => {
                                let current = 1.0;
                                const spectrum = [current];
                                for (let i = 1; i < Config.spectrumControlPoints; i++) {
                                    current *= Math.pow(2, Math.random() - 0.52);
                                    spectrum[i] = current * Math.random();
                                }
                                return spectrum;
                            },
                        ];
                        const generator = spectrumGenerators[(Math.random() * spectrumGenerators.length) | 0];
                        const spectrum = generator();
                        normalize(spectrum);
                        for (let i = 0; i < Config.spectrumControlPoints; i++) {
                            instrument.spectrumWave.spectrum[i] = Math.round(spectrum[i]);
                        }
                        instrument.spectrumWave.markCustomWaveDirty();
                    }
                    break;
                default: throw new Error("Unhandled noise instrument type in random generator.");
            }
        }
        else {
            const type = selectWeightedRandom([
                { item: 0, weight: 4 },
                { item: 6, weight: 4 },
                { item: 5, weight: 5 },
                { item: 7, weight: 5 },
                { item: 3, weight: 1 },
                { item: 1, weight: 5 },
                { item: 10, weight: 3 },
            ]);
            instrument.preset = instrument.type = type;
            instrument.fadeIn = (Math.random() < 0.5) ? 0 : selectCurvedDistribution(0, Config.fadeInRange - 1, 0, 2);
            instrument.fadeOut = selectCurvedDistribution(0, Config.fadeOutTicks.length - 1, Config.fadeOutNeutral, 2);
            if (type == 0 || type == 5 || type == 7) {
                instrument.unison = Config.unisons.dictionary[selectWeightedRandom([
                    { item: "none", weight: 10 },
                    { item: "shimmer", weight: 5 },
                    { item: "hum", weight: 4 },
                    { item: "honky tonk", weight: 3 },
                    { item: "dissonant", weight: 1 },
                    { item: "fifth", weight: 1 },
                    { item: "octave", weight: 2 },
                    { item: "bowed", weight: 2 },
                    { item: "piano", weight: 5 },
                    { item: "warbled", weight: 3 },
                    { item: "hecking gosh", weight: 2 },
                ])].index;
            }
            if (Math.random() < 0.1) {
                instrument.effects |= 1 << 10;
                instrument.transition = Config.transitions.dictionary[selectWeightedRandom([
                    { item: "interrupt", weight: 1 },
                    { item: "slide", weight: 2 },
                ])].index;
            }
            if (Math.random() < 0.2) {
                instrument.effects |= 1 << 11;
                instrument.chord = Config.chords.dictionary[selectWeightedRandom([
                    { item: "strum", weight: 2 },
                    { item: "arpeggio", weight: 1 },
                ])].index;
            }
            if (Math.random() < 0.05) {
                instrument.pitchShift = selectCurvedDistribution(0, Config.pitchShiftRange - 1, Config.pitchShiftCenter, 1);
                if (instrument.pitchShift != Config.pitchShiftCenter) {
                    instrument.effects |= 1 << 7;
                    instrument.addEnvelope(Config.instrumentAutomationTargets.dictionary["pitchShift"].index, 0, Config.envelopes.dictionary[selectWeightedRandom([
                        { item: "flare 1", weight: 2 },
                        { item: "flare 2", weight: 1 },
                        { item: "flare 3", weight: 1 },
                        { item: "twang 1", weight: 16 },
                        { item: "twang 2", weight: 8 },
                        { item: "twang 3", weight: 4 },
                        { item: "decay 1", weight: 4 },
                        { item: "decay 2", weight: 2 },
                        { item: "decay 3", weight: 1 },
                        { item: "linear 1", weight: 1 },
                        { item: "linear 2", weight: 1 },
                    ])].index);
                }
            }
            if (Math.random() < 0.25) {
                instrument.effects |= 1 << 9;
                instrument.vibrato = selectCurvedDistribution(0, Config.echoSustainRange - 1, Config.echoSustainRange >> 1, 2);
                instrument.vibrato = Config.vibratos.dictionary[selectWeightedRandom([
                    { item: "light", weight: 2 },
                    { item: "delayed", weight: 2 },
                    { item: "heavy", weight: 1 },
                    { item: "shaky", weight: 2 },
                ])].index;
            }
            if (Math.random() < 0.1) {
                instrument.effects |= 1 << 3;
                instrument.distortion = selectCurvedDistribution(1, Config.distortionRange - 1, Config.distortionRange - 1, 2);
            }
            if (effectsIncludeDistortion(instrument.effects) && Math.random() < 0.8) {
                instrument.effects |= 1 << 5;
                applyFilterPoints(instrument.noteFilter, [
                    new PotentialFilterPoint(1.0, 0, midFreq, maxFreq, 2000.0, -1),
                    new PotentialFilterPoint(0.9, 1, 0, midFreq - 1, 500.0, -1),
                    new PotentialFilterPoint(0.4, 2, 0, maxFreq, 1400.0, 0),
                ]);
            }
            else if (Math.random() < 0.5) {
                instrument.effects |= 1 << 5;
                applyFilterPoints(instrument.noteFilter, [
                    new PotentialFilterPoint(1.0, 0, midFreq, maxFreq, 8000.0, -1),
                ]);
                instrument.addEnvelope(Config.instrumentAutomationTargets.dictionary["noteFilterAllFreqs"].index, 0, Config.envelopes.dictionary[selectWeightedRandom([
                    { item: "punch", weight: 6 },
                    { item: "flare -1", weight: 1 },
                    { item: "flare 1", weight: 2 },
                    { item: "flare 2", weight: 4 },
                    { item: "flare 3", weight: 2 },
                    { item: "twang -1", weight: 1 },
                    { item: "twang 1", weight: 2 },
                    { item: "twang 2", weight: 4 },
                    { item: "twang 3", weight: 4 },
                    { item: "swell -1", weight: 4 },
                    { item: "swell 1", weight: 4 },
                    { item: "swell 2", weight: 2 },
                    { item: "swell 3", weight: 1 },
                    { item: "tremolo0", weight: 1 },
                    { item: "tremolo1", weight: 1 },
                    { item: "tremolo2", weight: 1 },
                    { item: "tremolo3", weight: 1 },
                    { item: "tremolo4", weight: 1 },
                    { item: "tremolo5", weight: 1 },
                    { item: "tremolo6", weight: 1 },
                    { item: "decay -1", weight: 1 },
                    { item: "decay 1", weight: 1 },
                    { item: "decay 2", weight: 2 },
                    { item: "decay 3", weight: 2 },
                    { item: "wibble-1", weight: 2 },
                    { item: "wibble 1", weight: 4 },
                    { item: "wibble 2", weight: 4 },
                    { item: "wibble 3", weight: 4 },
                    { item: "linear-2", weight: 1 },
                    { item: "linear-1", weight: 1 },
                    { item: "linear 1", weight: 2 },
                    { item: "linear 2", weight: 3 },
                    { item: "linear 3", weight: 2 },
                    { item: "rise -2", weight: 4 },
                    { item: "rise -1", weight: 4 },
                    { item: "rise 1", weight: 3 },
                    { item: "rise 2", weight: 2 },
                    { item: "rise 3", weight: 1 },
                ])].index);
            }
            if (Math.random() < 0.1) {
                instrument.effects |= 1 << 4;
                instrument.bitcrusherFreq = selectCurvedDistribution(0, Config.bitcrusherFreqRange - 1, 0, 2);
                instrument.bitcrusherQuantization = selectCurvedDistribution(0, Config.bitcrusherQuantizationRange - 1, Config.bitcrusherQuantizationRange >> 1, 2);
            }
            if (Math.random() < 0.1) {
                instrument.effects |= 1 << 1;
                instrument.chorus = selectCurvedDistribution(1, Config.chorusRange - 1, Config.chorusRange - 1, 1);
            }
            if (Math.random() < 0.1) {
                instrument.echoSustain = selectCurvedDistribution(0, Config.echoSustainRange - 1, Config.echoSustainRange >> 1, 2);
                instrument.echoDelay = selectCurvedDistribution(0, Config.echoDelayRange - 1, Config.echoDelayRange >> 1, 2);
                if (instrument.echoSustain != 0 || instrument.echoDelay != 0) {
                    instrument.effects |= 1 << 6;
                }
            }
            if (Math.random() < 0.5) {
                instrument.effects |= 1 << 0;
                instrument.reverb = selectCurvedDistribution(1, Config.reverbRange - 1, 1, 1);
            }
            function normalize(harmonics) {
                let max = 0;
                for (const value of harmonics) {
                    if (value > max)
                        max = value;
                }
                for (let i = 0; i < harmonics.length; i++) {
                    harmonics[i] = Config.harmonicsMax * harmonics[i] / max;
                }
            }
            switch (type) {
                case 0:
                    {
                        instrument.chipWave = (Math.random() * Config.chipWaves.length) | 0;
                    }
                    break;
                case 6:
                    {
                        instrument.pulseWidth = selectCurvedDistribution(0, Config.pulseWidthRange - 1, Config.pulseWidthRange - 1, 2);
                        if (Math.random() < 0.6) {
                            instrument.addEnvelope(Config.instrumentAutomationTargets.dictionary["pulseWidth"].index, 0, Config.envelopes.dictionary[selectWeightedRandom([
                                { item: "punch", weight: 6 },
                                { item: "flare -1", weight: 1 },
                                { item: "flare 1", weight: 2 },
                                { item: "flare 2", weight: 4 },
                                { item: "flare 3", weight: 2 },
                                { item: "twang -1", weight: 1 },
                                { item: "twang 1", weight: 2 },
                                { item: "twang 2", weight: 4 },
                                { item: "twang 3", weight: 4 },
                                { item: "swell -1", weight: 4 },
                                { item: "swell 1", weight: 4 },
                                { item: "swell 2", weight: 2 },
                                { item: "swell 3", weight: 1 },
                                { item: "tremolo0", weight: 1 },
                                { item: "tremolo1", weight: 1 },
                                { item: "tremolo2", weight: 1 },
                                { item: "tremolo3", weight: 1 },
                                { item: "tremolo4", weight: 1 },
                                { item: "tremolo5", weight: 1 },
                                { item: "tremolo6", weight: 1 },
                                { item: "decay -1", weight: 1 },
                                { item: "decay 1", weight: 1 },
                                { item: "decay 2", weight: 2 },
                                { item: "decay 3", weight: 2 },
                                { item: "wibble-1", weight: 2 },
                                { item: "wibble 1", weight: 4 },
                                { item: "wibble 2", weight: 4 },
                                { item: "wibble 3", weight: 4 },
                                { item: "linear-2", weight: 1 },
                                { item: "linear-1", weight: 1 },
                                { item: "linear 1", weight: 2 },
                                { item: "linear 2", weight: 3 },
                                { item: "linear 3", weight: 2 },
                                { item: "rise -2", weight: 4 },
                                { item: "rise -1", weight: 4 },
                                { item: "rise 1", weight: 3 },
                                { item: "rise 2", weight: 2 },
                                { item: "rise 3", weight: 1 },
                            ])].index);
                        }
                    }
                    break;
                case 7:
                case 5:
                    {
                        if (type == 7) {
                            instrument.stringSustain = (Math.random() * Config.stringSustainRange) | 0;
                        }
                        const harmonicGenerators = [
                            () => {
                                const harmonics = [];
                                for (let i = 0; i < Config.harmonicsControlPoints; i++) {
                                    harmonics[i] = (Math.random() < 0.4) ? Math.random() : 0.0;
                                }
                                harmonics[(Math.random() * 8) | 0] = Math.pow(Math.random(), 0.25);
                                return harmonics;
                            },
                            () => {
                                let current = 1.0;
                                const harmonics = [current];
                                for (let i = 1; i < Config.harmonicsControlPoints; i++) {
                                    current *= Math.pow(2, Math.random() - 0.55);
                                    harmonics[i] = current;
                                }
                                return harmonics;
                            },
                            () => {
                                let current = 1.0;
                                const harmonics = [current];
                                for (let i = 1; i < Config.harmonicsControlPoints; i++) {
                                    current *= Math.pow(2, Math.random() - 0.55);
                                    harmonics[i] = current * Math.random();
                                }
                                return harmonics;
                            },
                        ];
                        const generator = harmonicGenerators[(Math.random() * harmonicGenerators.length) | 0];
                        const harmonics = generator();
                        normalize(harmonics);
                        for (let i = 0; i < Config.harmonicsControlPoints; i++) {
                            instrument.harmonicsWave.harmonics[i] = Math.round(harmonics[i]);
                        }
                        instrument.harmonicsWave.markCustomWaveDirty();
                    }
                    break;
                case 3:
                    {
                        const spectrum = [];
                        for (let i = 0; i < Config.spectrumControlPoints; i++) {
                            const isHarmonic = i == 0 || i == 7 || i == 11 || i == 14 || i == 16 || i == 18 || i == 21;
                            if (isHarmonic) {
                                spectrum[i] = Math.pow(Math.random(), 0.25);
                            }
                            else {
                                spectrum[i] = Math.pow(Math.random(), 3) * 0.5;
                            }
                        }
                        normalize(spectrum);
                        for (let i = 0; i < Config.spectrumControlPoints; i++) {
                            instrument.spectrumWave.spectrum[i] = Math.round(spectrum[i]);
                        }
                        instrument.spectrumWave.markCustomWaveDirty();
                    }
                    break;
                case 10:
                case 1:
                    {
                        if (type == 1) {
                            instrument.algorithm = (Math.random() * Config.algorithms.length) | 0;
                            instrument.feedbackType = (Math.random() * Config.feedbacks.length) | 0;
                        }
                        else {
                            instrument.algorithm6Op = (Math.random() * (Config.algorithms6Op.length - 1) + 1) | 0;
                            instrument.customAlgorithm.fromPreset(instrument.algorithm6Op);
                            instrument.feedbackType6Op = (Math.random() * (Config.feedbacks6Op.length - 1) + 1) | 0;
                            instrument.customFeedbackType.fromPreset(instrument.feedbackType6Op);
                        }
                        const algorithm = type == 1 ? Config.algorithms[instrument.algorithm] : Config.algorithms6Op[instrument.algorithm6Op];
                        for (let i = 0; i < algorithm.carrierCount; i++) {
                            instrument.operators[i].frequency = selectCurvedDistribution(0, Config.operatorFrequencies.length - 1, 0, 3);
                            instrument.operators[i].amplitude = selectCurvedDistribution(0, Config.operatorAmplitudeMax, Config.operatorAmplitudeMax - 1, 2);
                            instrument.operators[i].waveform = Config.operatorWaves.dictionary[selectWeightedRandom([
                                { item: "sine", weight: 10 },
                                { item: "triangle", weight: 6 },
                                { item: "pulse width", weight: 6 },
                                { item: "sawtooth", weight: 3 },
                                { item: "ramp", weight: 3 },
                                { item: "trapezoid", weight: 4 },
                            ])].index;
                            if (instrument.operators[i].waveform == 2) {
                                instrument.operators[i].pulseWidth = selectWeightedRandom([
                                    { item: 0, weight: 3 },
                                    { item: 1, weight: 5 },
                                    { item: 2, weight: 7 },
                                    { item: 3, weight: 10 },
                                    { item: 4, weight: 15 },
                                    { item: 5, weight: 25 },
                                    { item: 6, weight: 15 },
                                    { item: 7, weight: 10 },
                                    { item: 8, weight: 7 },
                                    { item: 9, weight: 5 },
                                    { item: 9, weight: 3 },
                                ]);
                            }
                        }
                        for (let i = algorithm.carrierCount; i < Config.operatorCount + (type == 10 ? 2 : 0); i++) {
                            instrument.operators[i].frequency = selectCurvedDistribution(3, Config.operatorFrequencies.length - 1, 0, 3);
                            instrument.operators[i].amplitude = (Math.pow(Math.random(), 2) * Config.operatorAmplitudeMax) | 0;
                            if (instrument.envelopeCount < Config.maxEnvelopeCount && Math.random() < 0.4) {
                                instrument.addEnvelope(Config.instrumentAutomationTargets.dictionary["operatorAmplitude"].index, i, Config.envelopes.dictionary[selectWeightedRandom([
                                    { item: "punch", weight: 2 },
                                    { item: "flare -1", weight: 1 },
                                    { item: "flare 1", weight: 2 },
                                    { item: "flare 2", weight: 2 },
                                    { item: "flare 3", weight: 2 },
                                    { item: "twang -1", weight: 1 },
                                    { item: "twang 1", weight: 2 },
                                    { item: "twang 2", weight: 2 },
                                    { item: "twang 3", weight: 2 },
                                    { item: "swell -1", weight: 2 },
                                    { item: "swell 1", weight: 2 },
                                    { item: "swell 2", weight: 2 },
                                    { item: "swell 3", weight: 1 },
                                    { item: "tremolo0", weight: 1 },
                                    { item: "tremolo1", weight: 1 },
                                    { item: "tremolo2", weight: 1 },
                                    { item: "tremolo3", weight: 1 },
                                    { item: "tremolo4", weight: 1 },
                                    { item: "tremolo5", weight: 1 },
                                    { item: "tremolo6", weight: 1 },
                                    { item: "decay -1", weight: 1 },
                                    { item: "decay 1", weight: 1 },
                                    { item: "decay 2", weight: 2 },
                                    { item: "decay 3", weight: 2 },
                                    { item: "wibble-1", weight: 2 },
                                    { item: "wibble 1", weight: 2 },
                                    { item: "wibble 2", weight: 2 },
                                    { item: "wibble 3", weight: 2 },
                                    { item: "linear-2", weight: 1 },
                                    { item: "linear-1", weight: 1 },
                                    { item: "linear 1", weight: 2 },
                                    { item: "linear 2", weight: 2 },
                                    { item: "linear 3", weight: 1 },
                                    { item: "rise -2", weight: 2 },
                                    { item: "rise -1", weight: 2 },
                                    { item: "rise 1", weight: 2 },
                                    { item: "rise 2", weight: 2 },
                                    { item: "rise 3", weight: 1 },
                                ])].index);
                            }
                            instrument.operators[i].waveform = Config.operatorWaves.dictionary[selectWeightedRandom([
                                { item: "sine", weight: 10 },
                                { item: "triangle", weight: 6 },
                                { item: "pulse width", weight: 6 },
                                { item: "sawtooth", weight: 3 },
                                { item: "ramp", weight: 3 },
                                { item: "trapezoid", weight: 4 },
                            ])].index;
                            if (instrument.operators[i].waveform == 2) {
                                instrument.operators[i].pulseWidth = selectWeightedRandom([
                                    { item: 0, weight: 3 },
                                    { item: 1, weight: 5 },
                                    { item: 2, weight: 7 },
                                    { item: 3, weight: 10 },
                                    { item: 4, weight: 15 },
                                    { item: 5, weight: 25 },
                                    { item: 6, weight: 15 },
                                    { item: 7, weight: 10 },
                                    { item: 8, weight: 7 },
                                    { item: 9, weight: 5 },
                                    { item: 9, weight: 3 },
                                ]);
                            }
                        }
                        instrument.feedbackAmplitude = (Math.pow(Math.random(), 3) * Config.operatorAmplitudeMax) | 0;
                        if (instrument.envelopeCount < Config.maxEnvelopeCount && Math.random() < 0.4) {
                            instrument.addEnvelope(Config.instrumentAutomationTargets.dictionary["feedbackAmplitude"].index, 0, Config.envelopes.dictionary[selectWeightedRandom([
                                { item: "steady", weight: 4 },
                                { item: "punch", weight: 2 },
                                { item: "flare -1", weight: 1 },
                                { item: "flare 1", weight: 2 },
                                { item: "flare 2", weight: 2 },
                                { item: "flare 3", weight: 2 },
                                { item: "twang -1", weight: 1 },
                                { item: "twang 1", weight: 2 },
                                { item: "twang 2", weight: 2 },
                                { item: "twang 3", weight: 2 },
                                { item: "swell -1", weight: 2 },
                                { item: "swell 1", weight: 2 },
                                { item: "swell 2", weight: 2 },
                                { item: "swell 3", weight: 1 },
                                { item: "tremolo0", weight: 1 },
                                { item: "tremolo1", weight: 1 },
                                { item: "tremolo2", weight: 1 },
                                { item: "tremolo3", weight: 1 },
                                { item: "tremolo4", weight: 1 },
                                { item: "tremolo5", weight: 1 },
                                { item: "tremolo6", weight: 1 },
                                { item: "decay -1", weight: 1 },
                                { item: "decay 1", weight: 1 },
                                { item: "decay 2", weight: 2 },
                                { item: "decay 3", weight: 2 },
                                { item: "wibble-1", weight: 2 },
                                { item: "wibble 1", weight: 2 },
                                { item: "wibble 2", weight: 2 },
                                { item: "wibble 3", weight: 2 },
                                { item: "linear-2", weight: 1 },
                                { item: "linear-1", weight: 1 },
                                { item: "linear 1", weight: 2 },
                                { item: "linear 2", weight: 2 },
                                { item: "linear 3", weight: 1 },
                                { item: "rise -2", weight: 2 },
                                { item: "rise -1", weight: 2 },
                                { item: "rise 1", weight: 2 },
                                { item: "rise 2", weight: 2 },
                                { item: "rise 3", weight: 1 },
                            ])].index);
                        }
                    }
                    break;
                default: throw new Error("Unhandled pitched instrument type in random generator.");
            }
        }
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeTransition extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.transition;
        if (oldValue != newValue) {
            this._didSomething();
            instrument.transition = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
        }
    }
}
export class ChangeToggleEffects extends Change {
    constructor(doc, toggleFlag, useInstrument) {
        super();
        let instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (useInstrument != null)
            instrument = useInstrument;
        const oldValue = instrument.effects;
        const wasSelected = ((oldValue & (1 << toggleFlag)) != 0);
        const newValue = wasSelected ? (oldValue & (~(1 << toggleFlag))) : (oldValue | (1 << toggleFlag));
        instrument.effects = newValue;
        if (toggleFlag != 2)
            instrument.preset = instrument.type;
        if (wasSelected)
            instrument.clearInvalidEnvelopeTargets();
        this._didSomething();
        doc.notifier.changed();
    }
}
export class ChangePatternNumbers extends Change {
    constructor(doc, value, startBar, startChannel, width, height) {
        super();
        if (value > doc.song.patternsPerChannel)
            throw new Error("invalid pattern");
        for (let bar = startBar; bar < startBar + width; bar++) {
            for (let channelIndex = startChannel; channelIndex < startChannel + height; channelIndex++) {
                if (doc.song.channels[channelIndex].bars[bar] != value) {
                    doc.song.channels[channelIndex].bars[bar] = value;
                    this._didSomething();
                }
            }
        }
        if (startChannel >= doc.song.pitchChannelCount + doc.song.noiseChannelCount) {
            const pattern = doc.getCurrentPattern();
            if (pattern != null) {
                doc.viewedInstrument[startChannel] = pattern.instruments[0];
            }
            else {
                doc.viewedInstrument[startChannel] = 0;
            }
        }
        doc.notifier.changed();
    }
}
export class ChangeBarCount extends Change {
    constructor(doc, newValue, atBeginning) {
        super();
        if (doc.song.barCount != newValue) {
            for (const channel of doc.song.channels) {
                if (atBeginning) {
                    while (channel.bars.length < newValue) {
                        channel.bars.unshift(0);
                    }
                    if (doc.song.barCount > newValue) {
                        channel.bars.splice(0, doc.song.barCount - newValue);
                    }
                }
                else {
                    while (channel.bars.length < newValue) {
                        channel.bars.push(0);
                    }
                    channel.bars.length = newValue;
                }
            }
            if (atBeginning) {
                const diff = newValue - doc.song.barCount;
                doc.bar = Math.max(0, doc.bar + diff);
                if (diff < 0 || doc.barScrollPos > 0) {
                    doc.barScrollPos = Math.max(0, doc.barScrollPos + diff);
                }
                doc.song.loopStart = Math.max(0, doc.song.loopStart + diff);
            }
            doc.bar = Math.min(doc.bar, newValue - 1);
            doc.song.loopLength = Math.min(newValue, doc.song.loopLength);
            doc.song.loopStart = Math.min(newValue - doc.song.loopLength, doc.song.loopStart);
            doc.song.barCount = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeInsertBars extends Change {
    constructor(doc, start, count) {
        super();
        const newLength = Math.min(Config.barCountMax, doc.song.barCount + count);
        count = newLength - doc.song.barCount;
        if (count == 0)
            return;
        for (const channel of doc.song.channels) {
            while (channel.bars.length < newLength) {
                channel.bars.splice(start, 0, 0);
            }
        }
        doc.song.barCount = newLength;
        doc.bar += count;
        doc.barScrollPos += count;
        if (doc.song.loopStart >= start) {
            doc.song.loopStart += count;
        }
        else if (doc.song.loopStart + doc.song.loopLength >= start) {
            doc.song.loopLength += count;
        }
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeDeleteBars extends Change {
    constructor(doc, start, count) {
        super();
        for (const channel of doc.song.channels) {
            channel.bars.splice(start, count);
            if (channel.bars.length == 0)
                channel.bars.push(0);
        }
        doc.song.barCount = Math.max(1, doc.song.barCount - count);
        doc.bar = Math.max(0, doc.bar - count);
        doc.barScrollPos = Math.max(0, doc.barScrollPos - count);
        if (doc.song.loopStart >= start) {
            doc.song.loopStart = Math.max(0, doc.song.loopStart - count);
        }
        else if (doc.song.loopStart + doc.song.loopLength > start) {
            doc.song.loopLength -= count;
        }
        doc.song.loopLength = Math.max(1, Math.min(doc.song.barCount - doc.song.loopStart, doc.song.loopLength));
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeLimiterSettings extends Change {
    constructor(doc, limitRatio, compressionRatio, limitThreshold, compressionThreshold, limitRise, limitDecay, masterGain) {
        super();
        doc.song.limitRatio = limitRatio;
        doc.song.compressionRatio = compressionRatio;
        doc.song.limitThreshold = limitThreshold;
        doc.song.compressionThreshold = compressionThreshold;
        doc.song.limitRise = limitRise;
        doc.song.limitDecay = limitDecay;
        doc.song.masterGain = masterGain;
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeChannelOrder extends Change {
    constructor(doc, selectionMin, selectionMax, offset) {
        super();
        doc.song.channels.splice(selectionMin + offset, 0, ...doc.song.channels.splice(selectionMin, selectionMax - selectionMin + 1));
        selectionMax = Math.max(selectionMax, selectionMin);
        for (let channelIndex = doc.song.pitchChannelCount + doc.song.noiseChannelCount; channelIndex < doc.song.getChannelCount(); channelIndex++) {
            for (let instrumentIdx = 0; instrumentIdx < doc.song.channels[channelIndex].instruments.length; instrumentIdx++) {
                let instrument = doc.song.channels[channelIndex].instruments[instrumentIdx];
                for (let i = 0; i < Config.modCount; i++) {
                    if (instrument.modChannels[i] >= selectionMin && instrument.modChannels[i] <= selectionMax) {
                        instrument.modChannels[i] += offset;
                    }
                    else if (instrument.modChannels[i] >= selectionMin + offset && instrument.modChannels[i] <= selectionMax + offset) {
                        instrument.modChannels[i] -= offset * (selectionMax - selectionMin + 1);
                    }
                }
            }
        }
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeCustomScale extends Change {
    constructor(doc, flags) {
        super();
        for (let i = 0; i < Config.pitchesPerOctave; i++) {
            doc.song.scaleCustom[i] = flags[i];
        }
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeChannelCount extends Change {
    constructor(doc, newPitchChannelCount, newNoiseChannelCount, newModChannelCount) {
        super();
        if (doc.song.pitchChannelCount != newPitchChannelCount || doc.song.noiseChannelCount != newNoiseChannelCount || doc.song.modChannelCount != newModChannelCount) {
            const newChannels = [];
            function changeGroup(newCount, oldCount, newStart, oldStart, octave, isNoise, isMod) {
                for (let i = 0; i < newCount; i++) {
                    const channelIndex = i + newStart;
                    const oldChannel = i + oldStart;
                    if (i < oldCount) {
                        newChannels[channelIndex] = doc.song.channels[oldChannel];
                    }
                    else {
                        newChannels[channelIndex] = new Channel();
                        newChannels[channelIndex].octave = octave;
                        for (let j = 0; j < Config.instrumentCountMin; j++) {
                            const instrument = new Instrument(isNoise, isMod);
                            if (!isMod) {
                                const presetValue = pickRandomPresetValue(isNoise);
                                const preset = EditorConfig.valueToPreset(presetValue);
                                instrument.fromJsonObject(preset.settings, isNoise, isMod, doc.song.rhythm == 0 || doc.song.rhythm == 2, doc.song.rhythm >= 2);
                                instrument.preset = presetValue;
                            }
                            newChannels[channelIndex].instruments[j] = instrument;
                        }
                        for (let j = 0; j < doc.song.patternsPerChannel; j++) {
                            newChannels[channelIndex].patterns[j] = new Pattern();
                        }
                        for (let j = 0; j < doc.song.barCount; j++) {
                            newChannels[channelIndex].bars[j] = 0;
                        }
                    }
                }
            }
            changeGroup(newPitchChannelCount, doc.song.pitchChannelCount, 0, 0, 3, false, false);
            changeGroup(newNoiseChannelCount, doc.song.noiseChannelCount, newPitchChannelCount, doc.song.pitchChannelCount, 0, true, false);
            changeGroup(newModChannelCount, doc.song.modChannelCount, newNoiseChannelCount + newPitchChannelCount, doc.song.pitchChannelCount + doc.song.noiseChannelCount, 0, false, true);
            let oldPitchCount = doc.song.pitchChannelCount;
            doc.song.pitchChannelCount = newPitchChannelCount;
            doc.song.noiseChannelCount = newNoiseChannelCount;
            doc.song.modChannelCount = newModChannelCount;
            for (let channelIndex = 0; channelIndex < doc.song.getChannelCount(); channelIndex++) {
                doc.song.channels[channelIndex] = newChannels[channelIndex];
            }
            doc.song.channels.length = doc.song.getChannelCount();
            doc.channel = Math.min(doc.channel, newPitchChannelCount + newNoiseChannelCount + newModChannelCount - 1);
            for (let channelIndex = doc.song.pitchChannelCount + doc.song.noiseChannelCount; channelIndex < doc.song.getChannelCount(); channelIndex++) {
                for (let instrumentIdx = 0; instrumentIdx < doc.song.channels[channelIndex].instruments.length; instrumentIdx++) {
                    for (let mod = 0; mod < Config.modCount; mod++) {
                        let instrument = doc.song.channels[channelIndex].instruments[instrumentIdx];
                        let modChannel = instrument.modChannels[mod];
                        if ((modChannel >= doc.song.pitchChannelCount && modChannel < oldPitchCount) || modChannel >= doc.song.pitchChannelCount + doc.song.noiseChannelCount) {
                            instrument.modulators[mod] = Config.modulators.dictionary["none"].index;
                        }
                        if (modChannel >= oldPitchCount && oldPitchCount < newPitchChannelCount) {
                            instrument.modChannels[mod] += newPitchChannelCount - oldPitchCount;
                        }
                    }
                }
            }
            doc.notifier.changed();
            ColorConfig.resetColors();
            this._didSomething();
        }
    }
}
export class ChangeAddChannel extends ChangeGroup {
    constructor(doc, index, isNoise, isMod) {
        super();
        const newPitchChannelCount = doc.song.pitchChannelCount + (isNoise || isMod ? 0 : 1);
        const newNoiseChannelCount = doc.song.noiseChannelCount + (!isNoise || isMod ? 0 : 1);
        const newModChannelCount = doc.song.modChannelCount + (isNoise || !isMod ? 0 : 1);
        if (newPitchChannelCount <= Config.pitchChannelCountMax && newNoiseChannelCount <= Config.noiseChannelCountMax && newModChannelCount <= Config.modChannelCountMax) {
            const addedChannelIndex = isNoise ? doc.song.pitchChannelCount + doc.song.noiseChannelCount : doc.song.pitchChannelCount;
            this.append(new ChangeChannelCount(doc, newPitchChannelCount, newNoiseChannelCount, newModChannelCount));
            if (addedChannelIndex - 1 >= index) {
                this.append(new ChangeChannelOrder(doc, index, addedChannelIndex - 1, 1));
            }
            doc.synth.computeLatestModValues();
            doc.recalcChannelNames = true;
        }
    }
}
export class ChangeRemoveChannel extends ChangeGroup {
    constructor(doc, minIndex, maxIndex) {
        super();
        const oldMax = maxIndex;
        for (let modChannel = doc.song.pitchChannelCount + doc.song.noiseChannelCount; modChannel < doc.song.channels.length; modChannel++) {
            for (let instrumentIndex = 0; instrumentIndex < doc.song.channels[modChannel].instruments.length; instrumentIndex++) {
                const modInstrument = doc.song.channels[modChannel].instruments[instrumentIndex];
                for (let mod = 0; mod < Config.modCount; mod++) {
                    if (modInstrument.modChannels[mod] >= minIndex && modInstrument.modChannels[mod] <= oldMax) {
                        this.append(new ChangeModChannel(doc, mod, 0, modInstrument));
                    }
                    else if (modInstrument.modChannels[mod] > oldMax) {
                        this.append(new ChangeModChannel(doc, mod, modInstrument.modChannels[mod] - (oldMax - minIndex + 1) + 2, modInstrument));
                    }
                }
            }
        }
        while (maxIndex >= minIndex) {
            const isNoise = doc.song.getChannelIsNoise(maxIndex);
            const isMod = doc.song.getChannelIsMod(maxIndex);
            doc.song.channels.splice(maxIndex, 1);
            if (isNoise) {
                doc.song.noiseChannelCount--;
            }
            else if (isMod) {
                doc.song.modChannelCount--;
            }
            else {
                doc.song.pitchChannelCount--;
            }
            maxIndex--;
        }
        if (doc.song.pitchChannelCount < Config.pitchChannelCountMin) {
            this.append(new ChangeChannelCount(doc, Config.pitchChannelCountMin, doc.song.noiseChannelCount, doc.song.modChannelCount));
        }
        ColorConfig.resetColors();
        doc.recalcChannelNames = true;
        this.append(new ChangeChannelBar(doc, Math.max(0, minIndex - 1), doc.bar));
        doc.synth.computeLatestModValues();
        this._didSomething();
        doc.notifier.changed();
    }
}
export class ChangeChannelBar extends Change {
    constructor(doc, newChannel, newBar, silently = false) {
        super();
        const oldChannel = doc.channel;
        const oldBar = doc.bar;
        doc.channel = newChannel;
        doc.bar = newBar;
        if (!silently) {
            doc.selection.scrollToSelectedPattern();
        }
        if (doc.song.getChannelIsMod(doc.channel)) {
            const pattern = doc.song.getPattern(doc.channel, doc.bar);
            if (pattern != null)
                doc.viewedInstrument[doc.channel] = pattern.instruments[0];
        }
        doc.notifier.changed();
        if (oldChannel != newChannel || oldBar != newBar) {
            this._didSomething();
        }
    }
}
export class ChangeUnison extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.unison;
        if (oldValue != newValue) {
            this._didSomething();
            instrument.unison = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
        }
    }
}
export class ChangeChord extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.chord;
        if (oldValue != newValue) {
            this._didSomething();
            instrument.chord = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
        }
    }
}
export class ChangeVibrato extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.vibrato;
        if (oldValue != newValue) {
            instrument.vibrato = newValue;
            instrument.vibratoDepth = Config.vibratos[instrument.vibrato].amplitude;
            instrument.vibratoDelay = Config.vibratos[instrument.vibrato].delayTicks / 2;
            instrument.vibratoSpeed = 10;
            instrument.vibratoType = Config.vibratos[instrument.vibrato].type;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeVibratoDepth extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        let prevVibrato = instrument.vibrato;
        doc.synth.unsetMod(Config.modulators.dictionary["vibrato depth"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue || prevVibrato != Config.vibratos.length) {
            instrument.vibratoDepth = newValue / 25;
            instrument.vibrato = Config.vibratos.length;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeVibratoSpeed extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        let prevVibrato = instrument.vibrato;
        doc.synth.unsetMod(Config.modulators.dictionary["vibrato speed"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue || prevVibrato != Config.vibratos.length) {
            instrument.vibratoSpeed = newValue;
            instrument.vibrato = Config.vibratos.length;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeVibratoDelay extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        let prevVibrato = instrument.vibrato;
        doc.synth.unsetMod(Config.modulators.dictionary["vibrato delay"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue || prevVibrato != Config.vibratos.length) {
            instrument.vibratoDelay = newValue;
            instrument.vibrato = Config.vibratos.length;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeVibratoType extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.vibratoType;
        let prevVibrato = instrument.vibrato;
        doc.notifier.changed();
        if (oldValue != newValue || prevVibrato != Config.vibratos.length) {
            instrument.vibratoType = newValue;
            instrument.vibrato = Config.vibratos.length;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeArpeggioSpeed extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        instrument.arpeggioSpeed = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["arp speed"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeFastTwoNoteArp extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.fastTwoNoteArp;
        doc.notifier.changed();
        if (oldValue != newValue) {
            instrument.fastTwoNoteArp = newValue;
            this._didSomething();
        }
    }
}
export class ChangeClicklessTransition extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.clicklessTransition;
        doc.notifier.changed();
        if (oldValue != newValue) {
            instrument.clicklessTransition = newValue;
            this._didSomething();
        }
    }
}
export class ChangeAliasing extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.aliases;
        doc.notifier.changed();
        if (oldValue != newValue) {
            instrument.aliases = newValue;
            this._didSomething();
        }
    }
}
export class ChangeSpectrum extends Change {
    constructor(doc, instrument, spectrumWave) {
        super();
        spectrumWave.markCustomWaveDirty();
        instrument.preset = instrument.type;
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeHarmonics extends Change {
    constructor(doc, instrument, harmonicsWave) {
        super();
        harmonicsWave.markCustomWaveDirty();
        instrument.preset = instrument.type;
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeDrumsetEnvelope extends Change {
    constructor(doc, drumIndex, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.drumsetEnvelopes[drumIndex];
        if (oldValue != newValue) {
            instrument.drumsetEnvelopes[drumIndex] = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
class ChangeInstrumentSlider extends Change {
    constructor(_doc) {
        super();
        this._doc = _doc;
        this._instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
    }
    commit() {
        if (!this.isNoop()) {
            this._instrument.preset = this._instrument.type;
            this._doc.notifier.changed();
        }
    }
}
export class ChangePulseWidth extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.pulseWidth = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["pulse width"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangePitchShift extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.pitchShift = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeDetune extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.detune = newValue + Config.detuneCenter;
        doc.notifier.changed();
        doc.synth.unsetMod(Config.modulators.dictionary["detune"].index, doc.channel, doc.getCurrentInstrument());
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeDistortion extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.distortion = newValue;
        doc.notifier.changed();
        doc.synth.unsetMod(Config.modulators.dictionary["distortion"].index, doc.channel, doc.getCurrentInstrument());
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeBitcrusherFreq extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.bitcrusherFreq = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeBitcrusherQuantization extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.bitcrusherQuantization = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeStringSustain extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.stringSustain = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["sustain"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeEQFilterType extends Change {
    constructor(doc, instrument, newValue) {
        super();
        instrument.eqFilterType = newValue;
        if (newValue == true) {
            instrument.eqFilter.reset();
            instrument.tmpEqFilterStart = instrument.eqFilter;
            instrument.tmpEqFilterEnd = null;
        }
        else {
            instrument.eqFilter.convertLegacySettings(instrument.eqFilterSimpleCut, instrument.eqFilterSimplePeak, Config.envelopes.dictionary["none"]);
            instrument.tmpEqFilterStart = instrument.eqFilter;
            instrument.tmpEqFilterEnd = null;
        }
        instrument.clearInvalidEnvelopeTargets();
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeNoteFilterType extends Change {
    constructor(doc, instrument, newValue) {
        super();
        instrument.noteFilterType = newValue;
        if (newValue == true) {
            instrument.noteFilter.reset();
            instrument.tmpNoteFilterStart = instrument.noteFilter;
            instrument.tmpNoteFilterEnd = null;
        }
        else {
            instrument.noteFilter.convertLegacySettings(instrument.noteFilterSimpleCut, instrument.noteFilterSimplePeak, Config.envelopes.dictionary["none"]);
            instrument.tmpNoteFilterStart = instrument.noteFilter;
            instrument.tmpNoteFilterEnd = null;
        }
        instrument.clearInvalidEnvelopeTargets();
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeEQFilterSimpleCut extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.eqFilterSimpleCut = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["eq filt cut"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeEQFilterSimplePeak extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.eqFilterSimplePeak = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["eq filt peak"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeNoteFilterSimpleCut extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.noteFilterSimpleCut = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["note filt cut"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeNoteFilterSimplePeak extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.noteFilterSimplePeak = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["note filt peak"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeFilterAddPoint extends UndoableChange {
    constructor(doc, filterSettings, point, index, isNoteFilter, deletion = false) {
        super(deletion);
        this._envelopeTargetsAdd = [];
        this._envelopeIndicesAdd = [];
        this._envelopeTargetsRemove = [];
        this._envelopeIndicesRemove = [];
        this._doc = doc;
        this._instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        this._instrumentNextPreset = deletion ? this._instrument.preset : this._instrument.type;
        this._instrumentPrevPreset = deletion ? this._instrument.type : this._instrument.preset;
        this._filterSettings = filterSettings;
        this._point = point;
        this._index = index;
        for (let envelopeIndex = 0; envelopeIndex < this._instrument.envelopeCount; envelopeIndex++) {
            let target = this._instrument.envelopes[envelopeIndex].target;
            let targetIndex = this._instrument.envelopes[envelopeIndex].index;
            this._envelopeTargetsAdd.push(target);
            this._envelopeIndicesAdd.push(targetIndex);
            if (deletion) {
                const automationTarget = Config.instrumentAutomationTargets[target];
                if (automationTarget.isFilter && (automationTarget.effect == 5) == isNoteFilter) {
                    if (automationTarget.maxCount == Config.filterMaxPoints) {
                        if (targetIndex == index) {
                            target = Config.instrumentAutomationTargets.dictionary["none"].index;
                            targetIndex = 0;
                        }
                        else if (targetIndex > index) {
                            targetIndex--;
                        }
                    }
                    else {
                        if (filterSettings.controlPointCount <= 1) {
                            target = Config.instrumentAutomationTargets.dictionary["none"].index;
                            targetIndex = 0;
                        }
                    }
                }
            }
            this._envelopeTargetsRemove.push(target);
            this._envelopeIndicesRemove.push(targetIndex);
        }
        this._didSomething();
        this.redo();
    }
    _doForwards() {
        this._filterSettings.controlPoints.splice(this._index, 0, this._point);
        this._filterSettings.controlPointCount++;
        this._filterSettings.controlPoints.length = this._filterSettings.controlPointCount;
        this._instrument.preset = this._instrumentNextPreset;
        for (let envelopeIndex = 0; envelopeIndex < this._instrument.envelopeCount; envelopeIndex++) {
            this._instrument.envelopes[envelopeIndex].target = this._envelopeTargetsAdd[envelopeIndex];
            this._instrument.envelopes[envelopeIndex].index = this._envelopeIndicesAdd[envelopeIndex];
        }
        this._instrument.tmpEqFilterStart = this._instrument.eqFilter;
        this._instrument.tmpEqFilterEnd = null;
        this._instrument.tmpNoteFilterStart = this._instrument.noteFilter;
        this._instrument.tmpNoteFilterEnd = null;
        this._doc.notifier.changed();
    }
    _doBackwards() {
        this._filterSettings.controlPoints.splice(this._index, 1);
        this._filterSettings.controlPointCount--;
        this._filterSettings.controlPoints.length = this._filterSettings.controlPointCount;
        this._instrument.preset = this._instrumentPrevPreset;
        for (let envelopeIndex = 0; envelopeIndex < this._instrument.envelopeCount; envelopeIndex++) {
            this._instrument.envelopes[envelopeIndex].target = this._envelopeTargetsRemove[envelopeIndex];
            this._instrument.envelopes[envelopeIndex].index = this._envelopeIndicesRemove[envelopeIndex];
        }
        this._instrument.tmpEqFilterStart = this._instrument.eqFilter;
        this._instrument.tmpEqFilterEnd = null;
        this._instrument.tmpNoteFilterStart = this._instrument.noteFilter;
        this._instrument.tmpNoteFilterEnd = null;
        this._doc.notifier.changed();
    }
}
export class ChangeFilterMovePoint extends UndoableChange {
    constructor(doc, point, oldFreq, newFreq, oldGain, newGain) {
        super(false);
        this._doc = doc;
        this._instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        this._instrumentNextPreset = this._instrument.type;
        this._instrumentPrevPreset = this._instrument.preset;
        this._point = point;
        this._oldFreq = oldFreq;
        this._newFreq = newFreq;
        this._oldGain = oldGain;
        this._newGain = newGain;
        this._didSomething();
        this.redo();
    }
    _doForwards() {
        this._point.freq = this._newFreq;
        this._point.gain = this._newGain;
        this._instrument.preset = this._instrumentNextPreset;
        this._instrument.tmpEqFilterStart = this._instrument.eqFilter;
        this._instrument.tmpEqFilterEnd = null;
        this._instrument.tmpNoteFilterStart = this._instrument.noteFilter;
        this._instrument.tmpNoteFilterEnd = null;
        this._doc.notifier.changed();
    }
    _doBackwards() {
        this._point.freq = this._oldFreq;
        this._point.gain = this._oldGain;
        this._instrument.preset = this._instrumentPrevPreset;
        this._instrument.tmpEqFilterStart = this._instrument.eqFilter;
        this._instrument.tmpEqFilterEnd = null;
        this._instrument.tmpNoteFilterStart = this._instrument.noteFilter;
        this._instrument.tmpNoteFilterEnd = null;
        this._doc.notifier.changed();
    }
}
export class ChangeFilterSettings extends UndoableChange {
    constructor(doc, settings, oldSettings, useNoteFilter, subFilters = null, oldSubFilters = null) {
        super(false);
        this._doc = doc;
        this._instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        this._instrumentNextPreset = this._instrument.type;
        this._instrumentPrevPreset = this._instrument.preset;
        this._oldSettings = oldSettings;
        this._useNoteFilter = useNoteFilter;
        this._filterSettings = settings;
        if (subFilters != null && oldSubFilters != null) {
            this._subFilters = subFilters;
            this._oldSubFilters = oldSubFilters;
        }
        this._instrument.clearInvalidEnvelopeTargets();
        this._didSomething();
        this.redo();
    }
    _doForwards() {
        if (this._useNoteFilter) {
            this._instrument.noteFilter = this._filterSettings;
            if (this._subFilters != null)
                this._instrument.noteSubFilters = this._subFilters;
            this._instrument.tmpNoteFilterStart = this._instrument.noteFilter;
            this._instrument.tmpNoteFilterEnd = null;
        }
        else {
            this._instrument.eqFilter = this._filterSettings;
            if (this._subFilters != null)
                this._instrument.eqSubFilters = this._subFilters;
            this._instrument.tmpEqFilterStart = this._instrument.eqFilter;
            this._instrument.tmpEqFilterEnd = null;
        }
        this._instrument.preset = this._instrumentNextPreset;
        this._instrument.clearInvalidEnvelopeTargets();
        this._doc.notifier.changed();
    }
    _doBackwards() {
        if (this._useNoteFilter) {
            this._instrument.noteFilter = this._oldSettings;
            if (this._oldSubFilters != null)
                this._instrument.noteSubFilters = this._oldSubFilters;
            this._instrument.tmpNoteFilterStart = this._instrument.noteFilter;
            this._instrument.tmpNoteFilterEnd = null;
        }
        else {
            this._instrument.eqFilter = this._oldSettings;
            if (this._oldSubFilters != null)
                this._instrument.eqSubFilters = this._oldSubFilters;
            this._instrument.tmpEqFilterStart = this._instrument.eqFilter;
            this._instrument.tmpEqFilterEnd = null;
        }
        this._instrument.preset = this._instrumentPrevPreset;
        this._instrument.clearInvalidEnvelopeTargets();
        this._doc.notifier.changed();
    }
}
export class ChangeFadeInOut extends UndoableChange {
    constructor(doc, fadeIn, fadeOut) {
        super(false);
        this._doc = doc;
        this._instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        this._instrumentNextPreset = this._instrument.type;
        this._instrumentPrevPreset = this._instrument.preset;
        this._oldFadeIn = this._instrument.fadeIn;
        this._oldFadeOut = this._instrument.fadeOut;
        this._newFadeIn = fadeIn;
        this._newFadeOut = fadeOut;
        this._didSomething();
        this.redo();
    }
    _doForwards() {
        this._instrument.fadeIn = this._newFadeIn;
        this._instrument.fadeOut = this._newFadeOut;
        this._instrument.preset = this._instrumentNextPreset;
        this._doc.notifier.changed();
    }
    _doBackwards() {
        this._instrument.fadeIn = this._oldFadeIn;
        this._instrument.fadeOut = this._oldFadeOut;
        this._instrument.preset = this._instrumentPrevPreset;
        this._doc.notifier.changed();
    }
}
export class ChangeAlgorithm extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.algorithm;
        if (oldValue != newValue) {
            instrument.algorithm = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeFeedbackType extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.feedbackType;
        if (oldValue != newValue) {
            instrument.feedbackType = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class Change6OpAlgorithm extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.algorithm6Op;
        if (oldValue != newValue) {
            instrument.algorithm6Op = newValue;
            if (newValue != 0) {
                instrument.customAlgorithm.fromPreset(newValue);
            }
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class Change6OpFeedbackType extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.feedbackType6Op;
        if (oldValue != newValue) {
            instrument.feedbackType6Op = newValue;
            if (newValue != 0) {
                instrument.customFeedbackType.fromPreset(newValue);
            }
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeOperatorWaveform extends Change {
    constructor(doc, operatorIndex, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.operators[operatorIndex].waveform;
        if (oldValue != newValue) {
            instrument.operators[operatorIndex].waveform = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeOperatorPulseWidth extends Change {
    constructor(doc, operatorIndex, oldValue, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        instrument.operators[operatorIndex].pulseWidth = newValue;
        instrument.preset = instrument.type;
        doc.notifier.changed();
        if (oldValue != newValue) {
            this._didSomething();
        }
    }
}
export class ChangeOperatorFrequency extends Change {
    constructor(doc, operatorIndex, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.operators[operatorIndex].frequency;
        if (oldValue != newValue) {
            instrument.operators[operatorIndex].frequency = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeOperatorAmplitude extends ChangeInstrumentSlider {
    constructor(doc, operatorIndex, oldValue, newValue) {
        super(doc);
        this._instrument.operators[operatorIndex].amplitude = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeFeedbackAmplitude extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.feedbackAmplitude = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeAddChannelInstrument extends Change {
    constructor(doc) {
        super();
        const channel = doc.song.channels[doc.channel];
        const isNoise = doc.song.getChannelIsNoise(doc.channel);
        const isMod = doc.song.getChannelIsMod(doc.channel);
        const maxInstruments = doc.song.getMaxInstrumentsPerChannel();
        if (channel.instruments.length >= maxInstruments)
            return;
        const presetValue = pickRandomPresetValue(isNoise);
        const preset = EditorConfig.valueToPreset(presetValue);
        const instrument = new Instrument(isNoise, isMod);
        instrument.fromJsonObject(preset.settings, isNoise, isMod, false, false, 1);
        instrument.preset = presetValue;
        instrument.volume = 0;
        channel.instruments.push(instrument);
        if (!isMod) {
            doc.viewedInstrument[doc.channel] = channel.instruments.length - 1;
        }
        for (let channelIndex = doc.song.pitchChannelCount + doc.song.noiseChannelCount; channelIndex < doc.song.getChannelCount(); channelIndex++) {
            for (let instrumentIndex = 0; instrumentIndex < doc.song.channels[channelIndex].instruments.length; instrumentIndex++) {
                for (let mod = 0; mod < Config.modCount; mod++) {
                    let instrument = doc.song.channels[channelIndex].instruments[instrumentIndex];
                    let modInstrument = instrument.modInstruments[mod];
                    let modChannel = instrument.modChannels[mod];
                    if (modInstrument >= doc.song.channels[channelIndex].instruments.length && modChannel == doc.channel) {
                        instrument.modInstruments[mod]++;
                    }
                }
            }
        }
        doc.synth.computeLatestModValues();
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeRemoveChannelInstrument extends Change {
    constructor(doc) {
        super();
        const channel = doc.song.channels[doc.channel];
        if (channel.instruments.length <= Config.instrumentCountMin)
            return;
        const removedIndex = doc.viewedInstrument[doc.channel];
        channel.instruments.splice(removedIndex, 1);
        if (doc.song.patternInstruments) {
            for (const pattern of channel.patterns) {
                for (let i = 0; i < pattern.instruments.length; i++) {
                    if (pattern.instruments[i] == removedIndex) {
                        pattern.instruments.splice(i, 1);
                        i--;
                    }
                    else if (pattern.instruments[i] > removedIndex) {
                        pattern.instruments[i]--;
                    }
                }
                if (pattern.instruments.length <= 0) {
                    pattern.instruments[0] = 0;
                }
            }
        }
        for (let channelIndex = doc.song.pitchChannelCount + doc.song.noiseChannelCount; channelIndex < doc.song.getChannelCount(); channelIndex++) {
            for (let instrumentIdx = 0; instrumentIdx < doc.song.channels[channelIndex].instruments.length; instrumentIdx++) {
                for (let mod = 0; mod < Config.modCount; mod++) {
                    let instrument = doc.song.channels[channelIndex].instruments[instrumentIdx];
                    let modInstrument = instrument.modInstruments[mod];
                    let modChannel = instrument.modChannels[mod];
                    if (modChannel == doc.channel) {
                        if (modInstrument > doc.song.channels[channelIndex].instruments.length) {
                            instrument.modInstruments[mod]--;
                        }
                        else if (modInstrument == doc.song.channels[channelIndex].instruments.length) {
                            instrument.modInstruments[mod] = 0;
                            instrument.modulators[mod] = 0;
                        }
                    }
                }
            }
        }
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeViewInstrument extends Change {
    constructor(doc, index) {
        super();
        if (doc.viewedInstrument[doc.channel] != index) {
            doc.viewedInstrument[doc.channel] = index;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeInstrumentsFlags extends Change {
    constructor(doc, newLayeredInstruments, newPatternInstruments) {
        super();
        const oldLayeredInstruments = doc.song.layeredInstruments;
        const oldPatternInstruments = doc.song.patternInstruments;
        if (oldLayeredInstruments == newLayeredInstruments && oldPatternInstruments == newPatternInstruments)
            return;
        doc.song.layeredInstruments = newLayeredInstruments;
        doc.song.patternInstruments = newPatternInstruments;
        for (let channelIndex = 0; channelIndex < doc.song.getChannelCount(); channelIndex++) {
            const channel = doc.song.channels[channelIndex];
            if (channel.instruments.length > doc.song.getMaxInstrumentsPerChannel()) {
                channel.instruments.length = doc.song.getMaxInstrumentsPerChannel();
            }
            for (let j = 0; j < doc.song.patternsPerChannel; j++) {
                const pattern = channel.patterns[j];
                if (!oldPatternInstruments && newPatternInstruments) {
                    for (let i = 0; i < channel.instruments.length; i++) {
                        pattern.instruments[i] = i;
                    }
                    pattern.instruments.length = channel.instruments.length;
                }
                discardInvalidPatternInstruments(pattern.instruments, doc.song, channelIndex);
            }
        }
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeKey extends Change {
    constructor(doc, newValue) {
        super();
        if (doc.song.key != newValue) {
            doc.song.key = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeLoop extends Change {
    constructor(_doc, oldStart, oldLength, newStart, newLength) {
        super();
        this._doc = _doc;
        this.oldStart = oldStart;
        this.oldLength = oldLength;
        this.newStart = newStart;
        this.newLength = newLength;
        this._doc.song.loopStart = this.newStart;
        this._doc.song.loopLength = this.newLength;
        this._doc.notifier.changed();
        if (this.oldStart != this.newStart || this.oldLength != this.newLength) {
            this._didSomething();
        }
    }
}
export class ChangePitchAdded extends UndoableChange {
    constructor(doc, note, pitch, index, deletion = false) {
        super(deletion);
        this._doc = doc;
        this._note = note;
        this._pitch = pitch;
        this._index = index;
        this._didSomething();
        this.redo();
    }
    _doForwards() {
        this._note.pitches.splice(this._index, 0, this._pitch);
        this._doc.notifier.changed();
    }
    _doBackwards() {
        this._note.pitches.splice(this._index, 1);
        this._doc.notifier.changed();
    }
}
export class ChangeOctave extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        this.oldValue = oldValue;
        doc.song.channels[doc.channel].octave = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeRhythm extends ChangeGroup {
    constructor(doc, newValue) {
        super();
        if (doc.song.rhythm != newValue) {
            doc.song.rhythm = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangePaste extends ChangeGroup {
    constructor(doc, pattern, notes, selectionStart, selectionEnd, oldPartDuration) {
        super();
        this.append(new ChangeNoteTruncate(doc, pattern, selectionStart, selectionEnd, null, true));
        let noteInsertionIndex = 0;
        if (!doc.song.getChannelIsMod(doc.channel)) {
            for (let i = 0; i < pattern.notes.length; i++) {
                if (pattern.notes[i].start < selectionStart) {
                    if (pattern.notes[i].end > selectionStart)
                        throw new Error();
                    noteInsertionIndex = i + 1;
                }
                else if (pattern.notes[i].start < selectionEnd) {
                    throw new Error();
                }
            }
        }
        else {
            noteInsertionIndex = pattern.notes.length;
        }
        while (selectionStart < selectionEnd) {
            for (const noteObject of notes) {
                const noteStart = noteObject["start"] + selectionStart;
                const noteEnd = noteObject["end"] + selectionStart;
                if (noteStart >= selectionEnd)
                    break;
                const note = new Note(noteObject["pitches"][0], noteStart, noteEnd, noteObject["pins"][0]["size"], false);
                note.pitches.length = 0;
                for (const pitch of noteObject["pitches"]) {
                    note.pitches.push(pitch);
                }
                note.pins.length = 0;
                for (const pin of noteObject["pins"]) {
                    note.pins.push(makeNotePin(pin.interval, pin.time, pin.size));
                }
                note.continuesLastPattern = (noteObject["continuesLastPattern"] === true) && (note.start == 0);
                pattern.notes.splice(noteInsertionIndex++, 0, note);
                if (note.end > selectionEnd) {
                    this.append(new ChangeNoteLength(doc, note, note.start, selectionEnd));
                }
            }
            selectionStart += oldPartDuration;
        }
        if (pattern != null && doc.song.getChannelIsMod(doc.channel))
            pattern.notes.sort(function (a, b) { return (a.start == b.start) ? a.pitches[0] - b.pitches[0] : a.start - b.start; });
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangePasteInstrument extends ChangeGroup {
    constructor(doc, instrument, instrumentCopy) {
        super();
        instrument.fromJsonObject(instrumentCopy, instrumentCopy["isDrum"], instrumentCopy["isMod"], false, false);
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeSetPatternInstruments extends Change {
    constructor(doc, channelIndex, instruments, pattern) {
        super();
        if (!patternsContainSameInstruments(instruments, pattern.instruments)) {
            pattern.instruments.length = 0;
            pattern.instruments.push(...instruments);
            discardInvalidPatternInstruments(pattern.instruments, doc.song, channelIndex);
            this._didSomething();
            doc.notifier.changed();
        }
    }
}
export class ChangeModChannel extends Change {
    constructor(doc, mod, index, useInstrument) {
        super();
        let instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (useInstrument != undefined)
            instrument = useInstrument;
        if (index == 0 || (Config.modulators[instrument.modulators[mod]].forSong && index >= 2) || (!Config.modulators[instrument.modulators[mod]].forSong && index < 2)) {
            instrument.modulators[mod] = Config.modulators.dictionary["none"].index;
        }
        instrument.modChannels[mod] = index - 2;
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeModInstrument extends Change {
    constructor(doc, mod, tgtInstrument) {
        super();
        let instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (instrument.modInstruments[mod] != tgtInstrument) {
            instrument.modInstruments[mod] = tgtInstrument;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeModSetting extends Change {
    constructor(doc, mod, text) {
        super();
        let instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        let tgtChannel = instrument.modChannels[mod];
        let usedInstruments = [];
        if (tgtChannel >= 0) {
            if (instrument.modInstruments[mod] == doc.song.channels[tgtChannel].instruments.length) {
                usedInstruments = usedInstruments.concat(doc.song.channels[tgtChannel].instruments);
            }
            else if (instrument.modInstruments[mod] > doc.song.channels[tgtChannel].instruments.length) {
                let tgtPattern = doc.song.getPattern(tgtChannel, doc.bar);
                if (tgtPattern != null) {
                    for (let i = 0; i < tgtPattern.instruments.length; i++) {
                        usedInstruments.push(doc.song.channels[tgtChannel].instruments[tgtPattern.instruments[i]]);
                    }
                }
            }
            else {
                usedInstruments.push(doc.song.channels[tgtChannel].instruments[instrument.modInstruments[mod]]);
            }
        }
        if (text.startsWith("+ ")) {
            text = text.substr(2);
            for (let i = 0; i < usedInstruments.length; i++) {
                const tgtInstrument = usedInstruments[i];
                if (!(tgtInstrument.effects & (1 << Config.modulators.dictionary[text].associatedEffect))) {
                    doc.record(new ChangeToggleEffects(doc, Config.modulators.dictionary[text].associatedEffect, tgtInstrument));
                }
            }
        }
        let setting = Config.modulators.dictionary[text].index;
        if (instrument.modulators[mod] != setting) {
            instrument.modulators[mod] = setting;
            let cap = Config.modulators[setting].maxRawVol;
            for (let i = 0; i < doc.song.patternsPerChannel; i++) {
                const pattern = doc.song.channels[doc.channel].patterns[i];
                if (pattern.instruments[0] == doc.getCurrentInstrument()) {
                    for (let j = 0; j < pattern.notes.length; j++) {
                        const note = pattern.notes[j];
                        if (note.pitches[0] == Config.modCount - mod - 1) {
                            for (let k = 0; k < note.pins.length; k++) {
                                const pin = note.pins[k];
                                if (pin.size > cap)
                                    pin.size = cap;
                            }
                        }
                    }
                }
            }
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeModFilter extends Change {
    constructor(doc, mod, type) {
        super();
        let instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (instrument.modFilterTypes[mod] != type) {
            instrument.modFilterTypes[mod] = type;
            let cap = doc.song.getVolumeCapForSetting(true, instrument.modulators[mod], instrument.modFilterTypes[mod]);
            for (let i = 0; i < doc.song.patternsPerChannel; i++) {
                const pattern = doc.song.channels[doc.channel].patterns[i];
                if (pattern.instruments[0] == doc.getCurrentInstrument()) {
                    for (let j = 0; j < pattern.notes.length; j++) {
                        const note = pattern.notes[j];
                        if (note.pitches[0] == Config.modCount - mod - 1) {
                            for (let k = 0; k < note.pins.length; k++) {
                                const pin = note.pins[k];
                                if (pin.size > cap)
                                    pin.size = cap;
                            }
                        }
                    }
                }
            }
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangePatternsPerChannel extends Change {
    constructor(doc, newValue) {
        super();
        if (doc.song.patternsPerChannel != newValue) {
            for (let i = 0; i < doc.song.getChannelCount(); i++) {
                const channelBars = doc.song.channels[i].bars;
                const channelPatterns = doc.song.channels[i].patterns;
                for (let j = 0; j < channelBars.length; j++) {
                    if (channelBars[j] > newValue)
                        channelBars[j] = 0;
                }
                for (let j = channelPatterns.length; j < newValue; j++) {
                    channelPatterns[j] = new Pattern();
                }
                channelPatterns.length = newValue;
            }
            doc.song.patternsPerChannel = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeEnsurePatternExists extends UndoableChange {
    constructor(doc, channelIndex, bar) {
        super(false);
        this._patternOldNotes = null;
        this._oldPatternInstruments = null;
        const song = doc.song;
        if (song.channels[channelIndex].bars[bar] != 0)
            return;
        this._doc = doc;
        this._bar = bar;
        this._channelIndex = channelIndex;
        this._oldPatternCount = song.patternsPerChannel;
        this._newPatternCount = song.patternsPerChannel;
        this._newPatternInstruments = doc.recentPatternInstruments[channelIndex].concat();
        let firstEmptyUnusedIndex = null;
        let firstUnusedIndex = null;
        for (let patternIndex = 1; patternIndex <= song.patternsPerChannel; patternIndex++) {
            let used = false;
            for (let barIndex = 0; barIndex < song.barCount; barIndex++) {
                if (song.channels[channelIndex].bars[barIndex] == patternIndex) {
                    used = true;
                    break;
                }
            }
            if (used)
                continue;
            if (firstUnusedIndex == null) {
                firstUnusedIndex = patternIndex;
            }
            const pattern = song.channels[channelIndex].patterns[patternIndex - 1];
            if (pattern.notes.length == 0) {
                firstEmptyUnusedIndex = patternIndex;
                break;
            }
        }
        if (firstEmptyUnusedIndex != null) {
            this._patternIndex = firstEmptyUnusedIndex;
            this._oldPatternInstruments = song.channels[channelIndex].patterns[firstEmptyUnusedIndex - 1].instruments.concat();
        }
        else if (song.patternsPerChannel < song.barCount) {
            this._newPatternCount = song.patternsPerChannel + 1;
            this._patternIndex = song.patternsPerChannel + 1;
        }
        else if (firstUnusedIndex != null) {
            this._patternIndex = firstUnusedIndex;
            this._patternOldNotes = song.channels[channelIndex].patterns[firstUnusedIndex - 1].notes;
            this._oldPatternInstruments = song.channels[channelIndex].patterns[firstUnusedIndex - 1].instruments.concat();
        }
        else {
            throw new Error();
        }
        this._didSomething();
        this._doForwards();
    }
    _doForwards() {
        const song = this._doc.song;
        for (let j = song.patternsPerChannel; j < this._newPatternCount; j++) {
            for (let i = 0; i < song.getChannelCount(); i++) {
                song.channels[i].patterns[j] = new Pattern();
            }
        }
        song.patternsPerChannel = this._newPatternCount;
        const pattern = song.channels[this._channelIndex].patterns[this._patternIndex - 1];
        pattern.notes = [];
        pattern.instruments.length = 0;
        pattern.instruments.push(...this._newPatternInstruments);
        song.channels[this._channelIndex].bars[this._bar] = this._patternIndex;
        this._doc.notifier.changed();
    }
    _doBackwards() {
        const song = this._doc.song;
        const pattern = song.channels[this._channelIndex].patterns[this._patternIndex - 1];
        if (this._patternOldNotes != null)
            pattern.notes = this._patternOldNotes;
        if (this._oldPatternInstruments != null) {
            pattern.instruments.length = 0;
            pattern.instruments.push(...this._oldPatternInstruments);
        }
        song.channels[this._channelIndex].bars[this._bar] = 0;
        for (let i = 0; i < song.getChannelCount(); i++) {
            song.channels[i].patterns.length = this._oldPatternCount;
        }
        song.patternsPerChannel = this._oldPatternCount;
        this._doc.notifier.changed();
    }
}
export class ChangePinTime extends ChangePins {
    constructor(doc, note, pinIndex, shiftedTime, continuesLastPattern) {
        super(doc, note);
        shiftedTime -= this._oldStart;
        const originalTime = this._oldPins[pinIndex].time;
        const skipStart = Math.min(originalTime, shiftedTime);
        const skipEnd = Math.max(originalTime, shiftedTime);
        let setPin = false;
        for (let i = 0; i < this._oldPins.length; i++) {
            const oldPin = note.pins[i];
            const time = oldPin.time;
            if (time < skipStart) {
                this._newPins.push(makeNotePin(oldPin.interval, time, oldPin.size));
            }
            else if (time > skipEnd) {
                if (!setPin) {
                    if (this._newPins.length > 0)
                        continuesLastPattern = note.continuesLastPattern;
                    this._newPins.push(makeNotePin(this._oldPins[pinIndex].interval, shiftedTime, this._oldPins[pinIndex].size));
                    setPin = true;
                }
                this._newPins.push(makeNotePin(oldPin.interval, time, oldPin.size));
            }
        }
        if (!setPin) {
            continuesLastPattern = note.continuesLastPattern;
            this._newPins.push(makeNotePin(this._oldPins[pinIndex].interval, shiftedTime, this._oldPins[pinIndex].size));
        }
        this._finishSetup(continuesLastPattern);
    }
}
export class ChangePitchBend extends ChangePins {
    constructor(doc, note, bendStart, bendEnd, bendTo, pitchIndex) {
        super(doc, note);
        bendStart -= this._oldStart;
        bendEnd -= this._oldStart;
        bendTo -= note.pitches[pitchIndex];
        let setStart = false;
        let setEnd = false;
        let prevInterval = 0;
        let prevSize = Config.noteSizeMax;
        let persist = true;
        let i;
        let direction;
        let stop;
        let push;
        if (bendEnd > bendStart) {
            i = 0;
            direction = 1;
            stop = note.pins.length;
            push = (item) => { this._newPins.push(item); };
        }
        else {
            i = note.pins.length - 1;
            direction = -1;
            stop = -1;
            push = (item) => { this._newPins.unshift(item); };
        }
        for (; i != stop; i += direction) {
            const oldPin = note.pins[i];
            const time = oldPin.time;
            for (;;) {
                if (!setStart) {
                    if (time * direction <= bendStart * direction) {
                        prevInterval = oldPin.interval;
                        prevSize = oldPin.size;
                    }
                    if (time * direction < bendStart * direction) {
                        push(makeNotePin(oldPin.interval, time, oldPin.size));
                        break;
                    }
                    else {
                        push(makeNotePin(prevInterval, bendStart, prevSize));
                        setStart = true;
                    }
                }
                else if (!setEnd) {
                    if (time * direction <= bendEnd * direction) {
                        prevInterval = oldPin.interval;
                        prevSize = oldPin.size;
                    }
                    if (time * direction < bendEnd * direction) {
                        break;
                    }
                    else {
                        push(makeNotePin(bendTo, bendEnd, prevSize));
                        setEnd = true;
                    }
                }
                else {
                    if (time * direction == bendEnd * direction) {
                        break;
                    }
                    else {
                        if (oldPin.interval != prevInterval)
                            persist = false;
                        push(makeNotePin(persist ? bendTo : oldPin.interval, time, oldPin.size));
                        break;
                    }
                }
            }
        }
        if (!setEnd) {
            push(makeNotePin(bendTo, bendEnd, prevSize));
        }
        this._finishSetup();
    }
}
export class ChangePatternRhythm extends ChangeSequence {
    constructor(doc, pattern) {
        super();
        const minDivision = Config.partsPerBeat / Config.rhythms[doc.song.rhythm].stepsPerBeat;
        const changeRhythm = function (oldTime) {
            let thresholds = Config.rhythms[doc.song.rhythm].roundUpThresholds;
            if (thresholds != null) {
                const beatStart = Math.floor(oldTime / Config.partsPerBeat) * Config.partsPerBeat;
                const remainder = oldTime - beatStart;
                let newTime = beatStart;
                for (const threshold of thresholds) {
                    if (remainder >= threshold) {
                        newTime += minDivision;
                    }
                    else {
                        break;
                    }
                }
                return newTime;
            }
            else {
                return Math.round(oldTime / minDivision) * minDivision;
            }
        };
        let i = 0;
        while (i < pattern.notes.length) {
            const note = pattern.notes[i];
            if (changeRhythm(note.start) >= changeRhythm(note.end)) {
                this.append(new ChangeNoteAdded(doc, pattern, note, i, true));
            }
            else {
                this.append(new ChangeRhythmNote(doc, note, changeRhythm));
                i++;
            }
        }
    }
}
class ChangeRhythmNote extends ChangePins {
    constructor(doc, note, changeRhythm) {
        super(doc, note);
        for (const oldPin of this._oldPins) {
            this._newPins.push(makeNotePin(oldPin.interval, changeRhythm(oldPin.time + this._oldStart) - this._oldStart, oldPin.size));
        }
        this._finishSetup();
    }
}
export class ChangeMoveNotesSideways extends ChangeGroup {
    constructor(doc, beatsToMove, strategy) {
        super();
        let partsToMove = Math.round((beatsToMove % doc.song.beatsPerBar) * Config.partsPerBeat);
        if (partsToMove < 0)
            partsToMove += doc.song.beatsPerBar * Config.partsPerBeat;
        if (partsToMove == 0.0)
            return;
        switch (strategy) {
            case "wrapAround":
                {
                    const partsPerBar = Config.partsPerBeat * doc.song.beatsPerBar;
                    for (const channel of doc.song.channels) {
                        for (const pattern of channel.patterns) {
                            const newNotes = [];
                            for (let bar = 1; bar >= 0; bar--) {
                                const barStartPart = bar * partsPerBar;
                                for (const oldNote of pattern.notes) {
                                    const absoluteNoteStart = oldNote.start + partsToMove;
                                    const absoluteNoteEnd = oldNote.end + partsToMove;
                                    const noteStartPart = Math.max(0, absoluteNoteStart - barStartPart);
                                    const noteEndPart = Math.min(partsPerBar, absoluteNoteEnd - barStartPart);
                                    if (noteStartPart < noteEndPart) {
                                        projectNoteIntoBar(oldNote, absoluteNoteStart - barStartPart - noteStartPart, noteStartPart, noteEndPart, newNotes);
                                    }
                                }
                            }
                            pattern.notes = newNotes;
                        }
                    }
                }
                break;
            case "overflow":
                {
                    let originalBarCount = doc.song.barCount;
                    let originalLoopStart = doc.song.loopStart;
                    let originalLoopLength = doc.song.loopLength;
                    this.append(new ChangeMoveAndOverflowNotes(doc, doc.song.beatsPerBar, partsToMove));
                    if (beatsToMove < 0) {
                        let firstBarIsEmpty = true;
                        for (const channel of doc.song.channels) {
                            if (channel.bars[0] != 0)
                                firstBarIsEmpty = false;
                        }
                        if (firstBarIsEmpty) {
                            for (const channel of doc.song.channels) {
                                channel.bars.shift();
                            }
                            doc.song.barCount--;
                        }
                        else {
                            originalBarCount++;
                            originalLoopStart++;
                            doc.bar++;
                        }
                    }
                    while (doc.song.barCount < originalBarCount) {
                        for (const channel of doc.song.channels) {
                            channel.bars.push(0);
                        }
                        doc.song.barCount++;
                    }
                    doc.song.loopStart = originalLoopStart;
                    doc.song.loopLength = originalLoopLength;
                }
                break;
            default: throw new Error("Unrecognized beats-per-bar conversion strategy.");
        }
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeBeatsPerBar extends ChangeGroup {
    constructor(doc, newValue, strategy) {
        super();
        if (doc.song.beatsPerBar != newValue) {
            switch (strategy) {
                case "splice":
                    {
                        if (doc.song.beatsPerBar > newValue) {
                            const sequence = new ChangeSequence();
                            for (let i = 0; i < doc.song.getChannelCount(); i++) {
                                for (let j = 0; j < doc.song.channels[i].patterns.length; j++) {
                                    sequence.append(new ChangeNoteTruncate(doc, doc.song.channels[i].patterns[j], newValue * Config.partsPerBeat, doc.song.beatsPerBar * Config.partsPerBeat, null, true));
                                }
                            }
                        }
                    }
                    break;
                case "stretch":
                    {
                        const changeRhythm = function (oldTime) {
                            return Math.round(oldTime * newValue / doc.song.beatsPerBar);
                        };
                        for (let channelIndex = 0; channelIndex < doc.song.getChannelCount(); channelIndex++) {
                            for (let patternIndex = 0; patternIndex < doc.song.channels[channelIndex].patterns.length; patternIndex++) {
                                const pattern = doc.song.channels[channelIndex].patterns[patternIndex];
                                let noteIndex = 0;
                                while (noteIndex < pattern.notes.length) {
                                    const note = pattern.notes[noteIndex];
                                    if (changeRhythm(note.start) >= changeRhythm(note.end)) {
                                        this.append(new ChangeNoteAdded(doc, pattern, note, noteIndex, true));
                                    }
                                    else {
                                        this.append(new ChangeRhythmNote(doc, note, changeRhythm));
                                        noteIndex++;
                                    }
                                }
                            }
                        }
                        this.append(new ChangeTempo(doc, doc.song.tempo, doc.song.tempo * newValue / doc.song.beatsPerBar));
                    }
                    break;
                case "overflow":
                    {
                        this.append(new ChangeMoveAndOverflowNotes(doc, newValue, 0));
                        doc.song.loopStart = 0;
                        doc.song.loopLength = doc.song.barCount;
                    }
                    break;
                default: throw new Error("Unrecognized beats-per-bar conversion strategy.");
            }
            doc.song.beatsPerBar = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeScale extends ChangeGroup {
    constructor(doc, newValue) {
        super();
        if (doc.song.scale != newValue) {
            doc.song.scale = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeDetectKey extends ChangeGroup {
    constructor(doc) {
        super();
        const song = doc.song;
        const basePitch = Config.keys[song.key].basePitch;
        const keyWeights = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let channelIndex = 0; channelIndex < song.pitchChannelCount; channelIndex++) {
            for (let barIndex = 0; barIndex < song.barCount; barIndex++) {
                const pattern = song.getPattern(channelIndex, barIndex);
                if (pattern != null) {
                    for (const note of pattern.notes) {
                        const prevPin = note.pins[0];
                        for (let pinIndex = 1; pinIndex < note.pins.length; pinIndex++) {
                            const nextPin = note.pins[pinIndex];
                            if (prevPin.interval == nextPin.interval) {
                                let weight = nextPin.time - prevPin.time;
                                weight += Math.max(0, Math.min(Config.partsPerBeat, nextPin.time + note.start) - (prevPin.time + note.start));
                                weight *= nextPin.size + prevPin.size;
                                for (const pitch of note.pitches) {
                                    const key = (basePitch + prevPin.interval + pitch) % 12;
                                    keyWeights[key] += weight;
                                }
                            }
                        }
                    }
                }
            }
        }
        let bestKey = 0;
        let bestKeyWeight = 0;
        for (let key = 0; key < 12; key++) {
            const keyWeight = keyWeights[key] * (3 * keyWeights[(key + 7) % 12] + keyWeights[(key + 4) % 12] + keyWeights[(key + 3) % 12]);
            if (bestKeyWeight < keyWeight) {
                bestKeyWeight = keyWeight;
                bestKey = key;
            }
        }
        if (bestKey != song.key) {
            const diff = song.key - bestKey;
            const absoluteDiff = Math.abs(diff);
            for (let channelIndex = 0; channelIndex < song.pitchChannelCount; channelIndex++) {
                for (const pattern of song.channels[channelIndex].patterns) {
                    for (let i = 0; i < absoluteDiff; i++) {
                        this.append(new ChangeTranspose(doc, channelIndex, pattern, diff > 0, true));
                    }
                }
            }
            song.key = bestKey;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export function pickRandomPresetValue(isNoise) {
    const eligiblePresetValues = [];
    for (let categoryIndex = 0; categoryIndex < EditorConfig.presetCategories.length; categoryIndex++) {
        const category = EditorConfig.presetCategories[categoryIndex];
        if (category.name == "Novelty Presets")
            continue;
        for (let presetIndex = 0; presetIndex < category.presets.length; presetIndex++) {
            const preset = category.presets[presetIndex];
            if (preset.settings != undefined && (preset.isNoise == true) == isNoise) {
                eligiblePresetValues.push((categoryIndex << 6) + presetIndex);
            }
        }
    }
    return eligiblePresetValues[(Math.random() * eligiblePresetValues.length) | 0];
}
export function setDefaultInstruments(song) {
    for (let channelIndex = 0; channelIndex < song.channels.length; channelIndex++) {
        for (const instrument of song.channels[channelIndex].instruments) {
            const isNoise = song.getChannelIsNoise(channelIndex);
            const isMod = song.getChannelIsMod(channelIndex);
            const presetValue = (channelIndex == song.pitchChannelCount) ? EditorConfig.nameToPresetValue(Math.random() > 0.5 ? "chip noise" : "standard drumset") : pickRandomPresetValue(isNoise);
            const preset = EditorConfig.valueToPreset(presetValue);
            instrument.fromJsonObject(preset.settings, isNoise, isMod, song.rhythm == 0 || song.rhythm == 2, song.rhythm >= 2, 1);
            instrument.preset = presetValue;
        }
    }
}
export class ChangeSong extends ChangeGroup {
    constructor(doc, newHash) {
        super();
        let pitchChannelCount = doc.song.pitchChannelCount;
        let noiseChannelCount = doc.song.noiseChannelCount;
        let modChannelCount = doc.song.modChannelCount;
        doc.song.fromBase64String(newHash);
        if (pitchChannelCount != doc.song.pitchChannelCount || noiseChannelCount != doc.song.noiseChannelCount || modChannelCount != doc.song.modChannelCount) {
            ColorConfig.resetColors();
        }
        if (newHash == "") {
            this.append(new ChangePatternSelection(doc, 0, 0));
            doc.selection.resetBoxSelection();
            setDefaultInstruments(doc.song);
            doc.song.scale = doc.prefs.defaultScale;
            for (let i = 0; i <= doc.song.channels.length; i++) {
                doc.viewedInstrument[i] = 0;
                doc.recentPatternInstruments[i] = [0];
            }
            doc.viewedInstrument.length = doc.song.channels.length;
        }
        else {
            this.append(new ChangeValidateTrackSelection(doc));
        }
        doc.synth.computeLatestModValues();
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeValidateTrackSelection extends Change {
    constructor(doc) {
        super();
        const channelIndex = Math.min(doc.channel, doc.song.getChannelCount() - 1);
        const bar = Math.max(0, Math.min(doc.song.barCount - 1, doc.bar));
        if (doc.channel != channelIndex || doc.bar != bar) {
            doc.bar = bar;
            doc.channel = channelIndex;
            this._didSomething();
        }
        doc.selection.scrollToSelectedPattern();
        doc.notifier.changed();
    }
}
export class ChangeReplacePatterns extends ChangeGroup {
    constructor(doc, pitchChannels, noiseChannels, modChannels) {
        super();
        const song = doc.song;
        function removeExtraSparseChannels(channels, maxLength) {
            while (channels.length > maxLength) {
                let sparsestIndex = channels.length - 1;
                let mostZeroes = 0;
                for (let channelIndex = 0; channelIndex < channels.length - 1; channelIndex++) {
                    let zeroes = 0;
                    for (const bar of channels[channelIndex].bars) {
                        if (bar == 0)
                            zeroes++;
                    }
                    if (zeroes >= mostZeroes) {
                        sparsestIndex = channelIndex;
                        mostZeroes = zeroes;
                    }
                }
                channels.splice(sparsestIndex, 1);
            }
        }
        removeExtraSparseChannels(pitchChannels, Config.pitchChannelCountMax);
        removeExtraSparseChannels(noiseChannels, Config.noiseChannelCountMax);
        removeExtraSparseChannels(modChannels, Config.modChannelCountMax);
        while (pitchChannels.length < Config.pitchChannelCountMin)
            pitchChannels.push(new Channel());
        while (noiseChannels.length < Config.noiseChannelCountMin)
            noiseChannels.push(new Channel());
        while (modChannels.length < Config.modChannelCountMin)
            modChannels.push(new Channel());
        song.barCount = 1;
        song.patternsPerChannel = 8;
        const combinedChannels = pitchChannels.concat(noiseChannels.concat(modChannels));
        for (let channelIndex = 0; channelIndex < combinedChannels.length; channelIndex++) {
            const channel = combinedChannels[channelIndex];
            song.barCount = Math.max(song.barCount, channel.bars.length);
            song.patternsPerChannel = Math.max(song.patternsPerChannel, channel.patterns.length);
            song.channels[channelIndex] = channel;
        }
        song.channels.length = combinedChannels.length;
        song.pitchChannelCount = pitchChannels.length;
        song.noiseChannelCount = noiseChannels.length;
        song.modChannelCount = modChannels.length;
        song.barCount = Math.min(Config.barCountMax, song.barCount);
        song.patternsPerChannel = Math.min(Config.barCountMax, song.patternsPerChannel);
        for (let channelIndex = 0; channelIndex < song.channels.length; channelIndex++) {
            const channel = song.channels[channelIndex];
            for (let barIndex = 0; barIndex < channel.bars.length; barIndex++) {
                if (channel.bars[barIndex] > song.patternsPerChannel || channel.bars[barIndex] < 0) {
                    channel.bars[barIndex] = 0;
                }
            }
            while (channel.bars.length < song.barCount) {
                channel.bars.push(0);
            }
            channel.bars.length = song.barCount;
            if (channel.instruments.length > song.getMaxInstrumentsPerChannel()) {
                channel.instruments.length = song.getMaxInstrumentsPerChannel();
            }
            for (const pattern of channel.patterns) {
                discardInvalidPatternInstruments(pattern.instruments, song, channelIndex);
            }
            while (channel.patterns.length < song.patternsPerChannel) {
                channel.patterns.push(new Pattern());
            }
            channel.patterns.length = song.patternsPerChannel;
        }
        song.loopStart = Math.max(0, Math.min(song.barCount - 1, song.loopStart));
        song.loopLength = Math.min(song.barCount - song.loopStart, song.loopLength);
        this.append(new ChangeValidateTrackSelection(doc));
        doc.notifier.changed();
        this._didSomething();
        ColorConfig.resetColors();
    }
}
export function comparePatternNotes(a, b) {
    if (a.length != b.length)
        return false;
    for (let noteIndex = 0; noteIndex < a.length; noteIndex++) {
        const oldNote = a[noteIndex];
        const newNote = b[noteIndex];
        if (newNote.start != oldNote.start || newNote.end != oldNote.end || newNote.pitches.length != oldNote.pitches.length || newNote.pins.length != oldNote.pins.length) {
            return false;
        }
        for (let pitchIndex = 0; pitchIndex < oldNote.pitches.length; pitchIndex++) {
            if (newNote.pitches[pitchIndex] != oldNote.pitches[pitchIndex]) {
                return false;
            }
        }
        for (let pinIndex = 0; pinIndex < oldNote.pins.length; pinIndex++) {
            if (newNote.pins[pinIndex].interval != oldNote.pins[pinIndex].interval || newNote.pins[pinIndex].time != oldNote.pins[pinIndex].time || newNote.pins[pinIndex].size != oldNote.pins[pinIndex].size) {
                return false;
            }
        }
    }
    return true;
}
export function removeDuplicatePatterns(channels) {
    for (const channel of channels) {
        const newPatterns = [];
        for (let bar = 0; bar < channel.bars.length; bar++) {
            if (channel.bars[bar] == 0)
                continue;
            const oldPattern = channel.patterns[channel.bars[bar] - 1];
            let foundMatchingPattern = false;
            for (let newPatternIndex = 0; newPatternIndex < newPatterns.length; newPatternIndex++) {
                const newPattern = newPatterns[newPatternIndex];
                if (!patternsContainSameInstruments(oldPattern.instruments, newPattern.instruments) || newPattern.notes.length != oldPattern.notes.length) {
                    continue;
                }
                if (comparePatternNotes(oldPattern.notes, newPattern.notes)) {
                    foundMatchingPattern = true;
                    channel.bars[bar] = newPatternIndex + 1;
                    break;
                }
            }
            if (!foundMatchingPattern) {
                newPatterns.push(oldPattern);
                channel.bars[bar] = newPatterns.length;
            }
        }
        for (let patternIndex = 0; patternIndex < newPatterns.length; patternIndex++) {
            channel.patterns[patternIndex] = newPatterns[patternIndex];
        }
        channel.patterns.length = newPatterns.length;
    }
}
export class ChangeTempo extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        doc.song.tempo = Math.max(Config.tempoMin, Math.min(Config.tempoMax, Math.round(newValue)));
        doc.synth.unsetMod(Config.modulators.dictionary["tempo"].index);
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeEchoDelay extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.echoDelay = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["echo delay"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeEchoSustain extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.echoSustain = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["echo"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeChorus extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.chorus = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeReverb extends ChangeInstrumentSlider {
    constructor(doc, oldValue, newValue) {
        super(doc);
        this._instrument.reverb = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["reverb"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeSongReverb extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        doc.song.reverb = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["song reverb"].index);
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeNoteAdded extends UndoableChange {
    constructor(doc, pattern, note, index, deletion = false) {
        super(deletion);
        this._doc = doc;
        this._pattern = pattern;
        this._note = note;
        this._index = index;
        this._didSomething();
        this.redo();
    }
    _doForwards() {
        this._pattern.notes.splice(this._index, 0, this._note);
        this._doc.notifier.changed();
    }
    _doBackwards() {
        this._pattern.notes.splice(this._index, 1);
        this._doc.notifier.changed();
    }
}
export class ChangeNoteLength extends ChangePins {
    constructor(doc, note, truncStart, truncEnd) {
        super(doc, note);
        const continuesLastPattern = ((this._oldStart < 0 || note.continuesLastPattern) && truncStart == 0);
        truncStart -= this._oldStart;
        truncEnd -= this._oldStart;
        let setStart = false;
        let prevSize = this._oldPins[0].size;
        let prevInterval = this._oldPins[0].interval;
        let pushLastPin = true;
        let i;
        for (i = 0; i < this._oldPins.length; i++) {
            const oldPin = this._oldPins[i];
            if (oldPin.time < truncStart) {
                prevSize = oldPin.size;
                prevInterval = oldPin.interval;
            }
            else {
                if (oldPin.time > truncStart && !setStart) {
                    this._newPins.push(makeNotePin(prevInterval, truncStart, prevSize));
                    setStart = true;
                }
                if (oldPin.time <= truncEnd) {
                    this._newPins.push(makeNotePin(oldPin.interval, oldPin.time, oldPin.size));
                    if (oldPin.time == truncEnd) {
                        pushLastPin = false;
                        break;
                    }
                }
                else {
                    break;
                }
            }
        }
        if (pushLastPin)
            this._newPins.push(makeNotePin(this._oldPins[i].interval, truncEnd, this._oldPins[i].size));
        this._finishSetup(continuesLastPattern);
    }
}
export class ChangeNoteTruncate extends ChangeSequence {
    constructor(doc, pattern, start, end, skipNote = null, force = false) {
        super();
        let i = 0;
        while (i < pattern.notes.length) {
            const note = pattern.notes[i];
            if (note == skipNote && skipNote != null) {
                i++;
            }
            else if (note.end <= start) {
                i++;
            }
            else if (note.start >= end) {
                if (!doc.song.getChannelIsMod(doc.channel)) {
                    break;
                }
                else {
                    i++;
                }
            }
            else if (note.start < start && note.end > end) {
                if (!doc.song.getChannelIsMod(doc.channel) || force || (skipNote != null && note.pitches[0] == skipNote.pitches[0])) {
                    const copy = note.clone();
                    this.append(new ChangeNoteLength(doc, note, note.start, start));
                    i++;
                    this.append(new ChangeNoteAdded(doc, pattern, copy, i, false));
                    this.append(new ChangeNoteLength(doc, copy, end, copy.end));
                }
                i++;
            }
            else if (note.start < start) {
                if (!doc.song.getChannelIsMod(doc.channel) || force || (skipNote != null && note.pitches[0] == skipNote.pitches[0]))
                    this.append(new ChangeNoteLength(doc, note, note.start, start));
                i++;
            }
            else if (note.end > end) {
                if (!doc.song.getChannelIsMod(doc.channel) || force || (skipNote != null && note.pitches[0] == skipNote.pitches[0]))
                    this.append(new ChangeNoteLength(doc, note, end, note.end));
                i++;
            }
            else {
                if (!doc.song.getChannelIsMod(doc.channel) || force || (skipNote != null && note.pitches[0] == skipNote.pitches[0]))
                    this.append(new ChangeNoteAdded(doc, pattern, note, i, true));
                else
                    i++;
            }
        }
    }
}
class ChangeSplitNotesAtSelection extends ChangeSequence {
    constructor(doc, pattern) {
        super();
        let i = 0;
        while (i < pattern.notes.length) {
            const note = pattern.notes[i];
            if (note.start < doc.selection.patternSelectionStart && doc.selection.patternSelectionStart < note.end) {
                const copy = note.clone();
                this.append(new ChangeNoteLength(doc, note, note.start, doc.selection.patternSelectionStart));
                i++;
                this.append(new ChangeNoteAdded(doc, pattern, copy, i, false));
                this.append(new ChangeNoteLength(doc, copy, doc.selection.patternSelectionStart, copy.end));
            }
            else if (note.start < doc.selection.patternSelectionEnd && doc.selection.patternSelectionEnd < note.end) {
                const copy = note.clone();
                this.append(new ChangeNoteLength(doc, note, note.start, doc.selection.patternSelectionEnd));
                i++;
                this.append(new ChangeNoteAdded(doc, pattern, copy, i, false));
                this.append(new ChangeNoteLength(doc, copy, doc.selection.patternSelectionEnd, copy.end));
                i++;
            }
            else {
                i++;
            }
        }
    }
}
class ChangeTransposeNote extends UndoableChange {
    constructor(doc, channelIndex, note, upward, ignoreScale = false, octave = false) {
        super(false);
        this._doc = doc;
        this._note = note;
        this._oldPins = note.pins;
        this._newPins = [];
        this._oldPitches = note.pitches;
        this._newPitches = [];
        const isNoise = doc.song.getChannelIsNoise(channelIndex);
        if (isNoise != doc.song.getChannelIsNoise(doc.channel))
            return;
        if (doc.song.getChannelIsMod(doc.channel))
            return;
        const maxPitch = (isNoise ? Config.drumCount - 1 : Config.maxPitch);
        for (let i = 0; i < this._oldPitches.length; i++) {
            let pitch = this._oldPitches[i];
            if (octave && !isNoise) {
                if (upward) {
                    pitch = Math.min(maxPitch, pitch + 12);
                }
                else {
                    pitch = Math.max(0, pitch - 12);
                }
            }
            else {
                let scale = doc.song.scale == Config.scales.dictionary["Custom"].index ? doc.song.scaleCustom : Config.scales[doc.song.scale].flags;
                if (upward) {
                    for (let j = pitch + 1; j <= maxPitch; j++) {
                        if (isNoise || ignoreScale || scale[j % 12]) {
                            pitch = j;
                            break;
                        }
                    }
                }
                else {
                    for (let j = pitch - 1; j >= 0; j--) {
                        if (isNoise || ignoreScale || scale[j % 12]) {
                            pitch = j;
                            break;
                        }
                    }
                }
            }
            let foundMatch = false;
            for (let j = 0; j < this._newPitches.length; j++) {
                if (this._newPitches[j] == pitch) {
                    foundMatch = true;
                    break;
                }
            }
            if (!foundMatch)
                this._newPitches.push(pitch);
        }
        let min = 0;
        let max = maxPitch;
        for (let i = 1; i < this._newPitches.length; i++) {
            const diff = this._newPitches[0] - this._newPitches[i];
            if (min < diff)
                min = diff;
            if (max > diff + maxPitch)
                max = diff + maxPitch;
        }
        for (const oldPin of this._oldPins) {
            let interval = oldPin.interval + this._oldPitches[0];
            if (interval < min)
                interval = min;
            if (interval > max)
                interval = max;
            if (octave && !isNoise) {
                if (upward) {
                    interval = Math.min(max, interval + 12);
                }
                else {
                    interval = Math.max(min, interval - 12);
                }
            }
            else {
                let scale = doc.song.scale == Config.scales.dictionary["Custom"].index ? doc.song.scaleCustom : Config.scales[doc.song.scale].flags;
                if (upward) {
                    for (let i = interval + 1; i <= max; i++) {
                        if (isNoise || ignoreScale || scale[i % 12]) {
                            interval = i;
                            break;
                        }
                    }
                }
                else {
                    for (let i = interval - 1; i >= min; i--) {
                        if (isNoise || ignoreScale || scale[i % 12]) {
                            interval = i;
                            break;
                        }
                    }
                }
            }
            interval -= this._newPitches[0];
            this._newPins.push(makeNotePin(interval, oldPin.time, oldPin.size));
        }
        if (this._newPins[0].interval != 0)
            throw new Error("wrong pin start interval");
        for (let i = 1; i < this._newPins.length - 1;) {
            if (this._newPins[i - 1].interval == this._newPins[i].interval &&
                this._newPins[i].interval == this._newPins[i + 1].interval &&
                this._newPins[i - 1].size == this._newPins[i].size &&
                this._newPins[i].size == this._newPins[i + 1].size) {
                this._newPins.splice(i, 1);
            }
            else {
                i++;
            }
        }
        this._doForwards();
        this._didSomething();
    }
    _doForwards() {
        this._note.pins = this._newPins;
        this._note.pitches = this._newPitches;
        this._doc.notifier.changed();
    }
    _doBackwards() {
        this._note.pins = this._oldPins;
        this._note.pitches = this._oldPitches;
        this._doc.notifier.changed();
    }
}
export class ChangeTranspose extends ChangeSequence {
    constructor(doc, channelIndex, pattern, upward, ignoreScale = false, octave = false) {
        super();
        if (doc.selection.patternSelectionActive) {
            this.append(new ChangeSplitNotesAtSelection(doc, pattern));
        }
        for (const note of pattern.notes) {
            if (doc.selection.patternSelectionActive && (note.end <= doc.selection.patternSelectionStart || note.start >= doc.selection.patternSelectionEnd)) {
                continue;
            }
            this.append(new ChangeTransposeNote(doc, channelIndex, note, upward, ignoreScale, octave));
        }
    }
}
export class ChangeTrackSelection extends Change {
    constructor(doc, newX0, newX1, newY0, newY1) {
        super();
        doc.selection.boxSelectionX0 = newX0;
        doc.selection.boxSelectionX1 = newX1;
        doc.selection.boxSelectionY0 = newY0;
        doc.selection.boxSelectionY1 = newY1;
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangePatternSelection extends UndoableChange {
    constructor(doc, newStart, newEnd) {
        super(false);
        this._doc = doc;
        this._oldStart = doc.selection.patternSelectionStart;
        this._oldEnd = doc.selection.patternSelectionEnd;
        this._oldActive = doc.selection.patternSelectionActive;
        this._newStart = newStart;
        this._newEnd = newEnd;
        this._newActive = newStart < newEnd;
        this._doForwards();
        this._didSomething();
    }
    _doForwards() {
        this._doc.selection.patternSelectionStart = this._newStart;
        this._doc.selection.patternSelectionEnd = this._newEnd;
        this._doc.selection.patternSelectionActive = this._newActive;
        this._doc.notifier.changed();
    }
    _doBackwards() {
        this._doc.selection.patternSelectionStart = this._oldStart;
        this._doc.selection.patternSelectionEnd = this._oldEnd;
        this._doc.selection.patternSelectionActive = this._oldActive;
        this._doc.notifier.changed();
    }
}
export class ChangeDragSelectedNotes extends ChangeSequence {
    constructor(doc, channelIndex, pattern, parts, transpose) {
        super();
        if (parts == 0 && transpose == 0)
            return;
        if (doc.selection.patternSelectionActive) {
            this.append(new ChangeSplitNotesAtSelection(doc, pattern));
        }
        const oldStart = doc.selection.patternSelectionStart;
        const oldEnd = doc.selection.patternSelectionEnd;
        const newStart = Math.max(0, Math.min(doc.song.beatsPerBar * Config.partsPerBeat, oldStart + parts));
        const newEnd = Math.max(0, Math.min(doc.song.beatsPerBar * Config.partsPerBeat, oldEnd + parts));
        if (newStart == newEnd) {
            this.append(new ChangeNoteTruncate(doc, pattern, oldStart, oldEnd, null, true));
        }
        else if (parts < 0) {
            this.append(new ChangeNoteTruncate(doc, pattern, newStart, Math.min(oldStart, newEnd), null, true));
        }
        else {
            this.append(new ChangeNoteTruncate(doc, pattern, Math.max(oldEnd, newStart), newEnd, null, true));
        }
        this.append(new ChangePatternSelection(doc, newStart, newEnd));
        const draggedNotes = [];
        let noteInsertionIndex = 0;
        let i = 0;
        while (i < pattern.notes.length) {
            const note = pattern.notes[i];
            if (note.end <= oldStart || note.start >= oldEnd) {
                i++;
                if (note.end <= newStart)
                    noteInsertionIndex = i;
            }
            else {
                draggedNotes.push(note.clone());
                this.append(new ChangeNoteAdded(doc, pattern, note, i, true));
            }
        }
        for (const note of draggedNotes) {
            note.start += parts;
            note.end += parts;
            if (note.end <= newStart)
                continue;
            if (note.start >= newEnd)
                continue;
            this.append(new ChangeNoteAdded(doc, pattern, note, noteInsertionIndex++, false));
            this.append(new ChangeNoteLength(doc, note, Math.max(note.start, newStart), Math.min(newEnd, note.end)));
            for (let i = 0; i < Math.abs(transpose); i++) {
                this.append(new ChangeTransposeNote(doc, channelIndex, note, transpose > 0, doc.prefs.notesOutsideScale));
            }
        }
    }
}
export class ChangeDuplicateSelectedReusedPatterns extends ChangeGroup {
    constructor(doc, barStart, barWidth, channelStart, channelHeight) {
        super();
        for (let channelIndex = channelStart; channelIndex < channelStart + channelHeight; channelIndex++) {
            const reusablePatterns = {};
            for (let bar = barStart; bar < barStart + barWidth; bar++) {
                const currentPatternIndex = doc.song.channels[channelIndex].bars[bar];
                if (currentPatternIndex == 0)
                    continue;
                if (reusablePatterns[String(currentPatternIndex)] == undefined) {
                    let isUsedElsewhere = false;
                    for (let bar2 = 0; bar2 < doc.song.barCount; bar2++) {
                        if (bar2 < barStart || bar2 >= barStart + barWidth) {
                            if (doc.song.channels[channelIndex].bars[bar2] == currentPatternIndex) {
                                isUsedElsewhere = true;
                                break;
                            }
                        }
                    }
                    if (isUsedElsewhere) {
                        const copiedPattern = doc.song.getPattern(channelIndex, bar);
                        this.append(new ChangePatternNumbers(doc, 0, bar, channelIndex, 1, 1));
                        this.append(new ChangeEnsurePatternExists(doc, channelIndex, bar));
                        const newPattern = doc.song.getPattern(channelIndex, bar);
                        if (newPattern == null)
                            throw new Error();
                        this.append(new ChangePaste(doc, newPattern, copiedPattern.notes, 0, Config.partsPerBeat * doc.song.beatsPerBar, Config.partsPerBeat * doc.song.beatsPerBar));
                        newPattern.instruments.length = 0;
                        newPattern.instruments.push(...copiedPattern.instruments);
                        reusablePatterns[String(currentPatternIndex)] = doc.song.channels[channelIndex].bars[bar];
                    }
                    else {
                        reusablePatterns[String(currentPatternIndex)] = currentPatternIndex;
                    }
                }
                this.append(new ChangePatternNumbers(doc, reusablePatterns[String(currentPatternIndex)], bar, channelIndex, 1, 1));
            }
        }
    }
}
export class ChangePatternScale extends Change {
    constructor(doc, pattern, scaleMap) {
        super();
        if (doc.selection.patternSelectionActive) {
            new ChangeSplitNotesAtSelection(doc, pattern);
        }
        const maxPitch = Config.maxPitch;
        for (const note of pattern.notes) {
            if (doc.selection.patternSelectionActive && (note.end <= doc.selection.patternSelectionStart || note.start >= doc.selection.patternSelectionEnd)) {
                continue;
            }
            const newPitches = [];
            const newPins = [];
            for (let i = 0; i < note.pitches.length; i++) {
                const pitch = note.pitches[i];
                const transformedPitch = scaleMap[pitch % 12] + (pitch - (pitch % 12));
                if (newPitches.indexOf(transformedPitch) == -1) {
                    newPitches.push(transformedPitch);
                }
            }
            let min = 0;
            let max = maxPitch;
            for (let i = 1; i < newPitches.length; i++) {
                const diff = newPitches[0] - newPitches[i];
                if (min < diff)
                    min = diff;
                if (max > diff + maxPitch)
                    max = diff + maxPitch;
            }
            for (const oldPin of note.pins) {
                let interval = oldPin.interval + note.pitches[0];
                if (interval < min)
                    interval = min;
                if (interval > max)
                    interval = max;
                const transformedInterval = scaleMap[interval % 12] + (interval - (interval % 12));
                newPins.push(makeNotePin(transformedInterval - newPitches[0], oldPin.time, oldPin.size));
            }
            if (newPins[0].interval != 0)
                throw new Error("wrong pin start interval");
            for (let i = 1; i < newPins.length - 1;) {
                if (newPins[i - 1].interval == newPins[i].interval &&
                    newPins[i].interval == newPins[i + 1].interval &&
                    newPins[i - 1].size == newPins[i].size &&
                    newPins[i].size == newPins[i + 1].size) {
                    newPins.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            note.pitches = newPitches;
            note.pins = newPins;
        }
        this._didSomething();
        doc.notifier.changed();
    }
}
export class ChangeVolume extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].volume = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeSongTitle extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        if (newValue.length > 30) {
            newValue = newValue.substring(0, 30);
        }
        doc.song.title = newValue;
        document.title = newValue + " - " + EditorConfig.versionDisplayName;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeChannelName extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        if (newValue.length > 15) {
            newValue = newValue.substring(0, 15);
        }
        doc.song.channels[doc.muteEditorChannel].name = newValue;
        doc.recalcChannelNames = true;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangePan extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].pan = newValue;
        doc.synth.unsetMod(Config.modulators.dictionary["pan"].index, doc.channel, doc.getCurrentInstrument());
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangePanDelay extends Change {
    constructor(doc, oldValue, newValue) {
        super();
        doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].panDelay = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
}
export class ChangeSizeBend extends UndoableChange {
    constructor(doc, note, bendPart, bendSize, bendInterval, uniformSize) {
        super(false);
        this._doc = doc;
        this._note = note;
        this._oldPins = note.pins;
        this._newPins = [];
        let inserted = false;
        for (const pin of note.pins) {
            if (pin.time < bendPart) {
                if (uniformSize) {
                    this._newPins.push(makeNotePin(pin.interval, pin.time, bendSize));
                }
                else {
                    this._newPins.push(pin);
                }
            }
            else if (pin.time == bendPart) {
                this._newPins.push(makeNotePin(bendInterval, bendPart, bendSize));
                inserted = true;
            }
            else {
                if (!uniformSize && !inserted) {
                    this._newPins.push(makeNotePin(bendInterval, bendPart, bendSize));
                    inserted = true;
                }
                if (uniformSize) {
                    this._newPins.push(makeNotePin(pin.interval, pin.time, bendSize));
                }
                else {
                    this._newPins.push(pin);
                }
            }
        }
        removeRedundantPins(this._newPins);
        this._doForwards();
        this._didSomething();
    }
    _doForwards() {
        this._note.pins = this._newPins;
        this._doc.notifier.changed();
    }
    _doBackwards() {
        this._note.pins = this._oldPins;
        this._doc.notifier.changed();
    }
}
export class ChangeChipWave extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (instrument.chipWave != newValue) {
            instrument.chipWave = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeNoiseWave extends Change {
    constructor(doc, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (instrument.chipNoise != newValue) {
            instrument.chipNoise = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeAddEnvelope extends Change {
    constructor(doc) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        instrument.addEnvelope(0, 0, 0);
        instrument.preset = instrument.type;
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeRemoveEnvelope extends Change {
    constructor(doc, index) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        instrument.envelopeCount--;
        for (let i = index; i < instrument.envelopeCount; i++) {
            instrument.envelopes[i].target = instrument.envelopes[i + 1].target;
            instrument.envelopes[i].index = instrument.envelopes[i + 1].index;
            instrument.envelopes[i].envelope = instrument.envelopes[i + 1].envelope;
        }
        instrument.preset = instrument.type;
        doc.notifier.changed();
        this._didSomething();
    }
}
export class ChangeSetEnvelopeTarget extends Change {
    constructor(doc, envelopeIndex, target, targetIndex) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldTarget = instrument.envelopes[envelopeIndex].target;
        const oldIndex = instrument.envelopes[envelopeIndex].index;
        if (oldTarget != target || oldIndex != targetIndex) {
            instrument.envelopes[envelopeIndex].target = target;
            instrument.envelopes[envelopeIndex].index = targetIndex;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
export class ChangeSetEnvelopeType extends Change {
    constructor(doc, envelopeIndex, newValue) {
        super();
        const instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        const oldValue = instrument.envelopes[envelopeIndex].envelope;
        if (oldValue != newValue) {
            instrument.envelopes[envelopeIndex].envelope = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
}
//# sourceMappingURL=changes.js.map