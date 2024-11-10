import { Config, effectsIncludeTransition, effectsIncludeChord, effectsIncludePitchShift, effectsIncludeDetune, effectsIncludeVibrato, effectsIncludeNoteFilter, effectsIncludeDistortion, effectsIncludeBitcrusher, effectsIncludePanning, effectsIncludeChorus, effectsIncludeEcho, effectsIncludeReverb } from "../synth/SynthConfig";
import { BarScrollBar } from "./BarScrollBar";
import { BeatsPerBarPrompt } from "./BeatsPerBarPrompt";
import { ChangeGroup } from "./Change";
import { ChannelSettingsPrompt } from "./ChannelSettingsPrompt";
import { ColorConfig } from "./ColorConfig";
import { CustomChipPrompt } from "./CustomChipPrompt";
import { CustomFilterPrompt } from "./CustomFilterPrompt";
import { EditorConfig, isMobile, prettyNumber } from "./EditorConfig";
import { ExportPrompt } from "./ExportPrompt";
import "./Layout";
import { Synth } from "../synth/synth";
import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { HarmonicsEditor } from "./HarmonicsEditor";
import { InputBox, Slider } from "./HTMLWrapper";
import { ImportPrompt } from "./ImportPrompt";
import { LayoutPrompt } from "./LayoutPrompt";
import { EnvelopeEditor } from "./EnvelopeEditor";
import { FadeInOutEditor } from "./FadeInOutEditor";
import { FilterEditor } from "./FilterEditor";
import { LimiterPrompt } from "./LimiterPrompt";
import { CustomScalePrompt } from "./CustomScalePrompt";
import { LoopEditor } from "./LoopEditor";
import { MoveNotesSidewaysPrompt } from "./MoveNotesSidewaysPrompt";
import { MuteEditor } from "./MuteEditor";
import { OctaveScrollBar } from "./OctaveScrollBar";
import { MidiInputHandler } from "./MidiInput";
import { KeyboardLayout } from "./KeyboardLayout";
import { PatternEditor } from "./PatternEditor";
import { Piano } from "./Piano";
import { SongDurationPrompt } from "./SongDurationPrompt";
import { SongRecoveryPrompt } from "./SongRecoveryPrompt";
import { RecordingSetupPrompt } from "./RecordingSetupPrompt";
import { SpectrumEditor } from "./SpectrumEditor";
import { ThemePrompt } from "./ThemePrompt";
import { TipPrompt } from "./TipPrompt";
import { ChangeTempo, ChangeChorus, ChangeEchoDelay, ChangeEchoSustain, ChangeReverb, ChangeVolume, ChangePan, ChangePatternSelection, ChangePatternsPerChannel, ChangePatternNumbers, ChangePulseWidth, ChangeFeedbackAmplitude, ChangeOperatorAmplitude, ChangeOperatorFrequency, ChangeDrumsetEnvelope, ChangePasteInstrument, ChangePreset, pickRandomPresetValue, ChangeRandomGeneratedInstrument, ChangeEQFilterType, ChangeNoteFilterType, ChangeEQFilterSimpleCut, ChangeEQFilterSimplePeak, ChangeNoteFilterSimpleCut, ChangeNoteFilterSimplePeak, ChangeScale, ChangeDetectKey, ChangeKey, ChangeRhythm, ChangeFeedbackType, ChangeAlgorithm, ChangeChipWave, ChangeNoiseWave, ChangeTransition, ChangeToggleEffects, ChangeVibrato, ChangeUnison, ChangeChord, ChangeSong, ChangePitchShift, ChangeDetune, ChangeDistortion, ChangeStringSustain, ChangeBitcrusherFreq, ChangeBitcrusherQuantization, ChangeAddEnvelope, ChangeAddChannelInstrument, ChangeRemoveChannelInstrument, ChangeCustomWave, ChangeOperatorWaveform, ChangeOperatorPulseWidth, ChangeSongTitle, ChangeVibratoDepth, ChangeVibratoSpeed, ChangeVibratoDelay, ChangeVibratoType, ChangePanDelay, ChangeArpeggioSpeed, ChangeFastTwoNoteArp, ChangeClicklessTransition, ChangeAliasing } from "./changes";
import { Change6OpFeedbackType, Change6OpAlgorithm, ChangeCustomAlgorythmorFeedback } from "./changes";
import { TrackEditor } from "./TrackEditor";
import { oscilascopeCanvas } from "../global/Oscilascope";
const { button, div, input, select, span, optgroup, option, canvas } = HTML;
function buildOptions(menu, items) {
    for (let index = 0; index < items.length; index++) {
        menu.appendChild(option({ value: index }, items[index]));
    }
    return menu;
}
function buildHeaderedOptions(header, menu, items) {
    menu.appendChild(option({ selected: true, disabled: true, value: header }, header));
    for (const item of items) {
        menu.appendChild(option({ value: item }, item));
    }
    return menu;
}
function buildPresetOptions(isNoise, idSet) {
    const menu = select({ id: idSet });
    if (isNoise) {
        menu.appendChild(option({ value: 2 }, EditorConfig.valueToPreset(2).name));
        menu.appendChild(option({ value: 3 }, EditorConfig.valueToPreset(3).name));
        menu.appendChild(option({ value: 4 }, EditorConfig.valueToPreset(4).name));
    }
    else {
        menu.appendChild(option({ value: 0 }, EditorConfig.valueToPreset(0).name));
        menu.appendChild(option({ value: 6 }, EditorConfig.valueToPreset(6).name));
        menu.appendChild(option({ value: 5 }, EditorConfig.valueToPreset(5).name));
        menu.appendChild(option({ value: 7 }, EditorConfig.valueToPreset(7).name));
        menu.appendChild(option({ value: 3 }, EditorConfig.valueToPreset(3).name));
        menu.appendChild(option({ value: 1 }, EditorConfig.valueToPreset(1).name));
        menu.appendChild(option({ value: 8 }, EditorConfig.valueToPreset(8).name));
        menu.appendChild(option({ value: 10 }, EditorConfig.instrumentToPreset(10).name));
    }
    const randomGroup = optgroup({ label: "Randomize ▾" });
    randomGroup.appendChild(option({ value: "randomPreset" }, "Random Preset"));
    randomGroup.appendChild(option({ value: "randomGenerated" }, "Random Generated"));
    menu.appendChild(randomGroup);
    for (let categoryIndex = 1; categoryIndex < EditorConfig.presetCategories.length; categoryIndex++) {
        const category = EditorConfig.presetCategories[categoryIndex];
        const group = optgroup({ label: category.name + " ▾" });
        let foundAny = false;
        for (let presetIndex = 0; presetIndex < category.presets.length; presetIndex++) {
            const preset = category.presets[presetIndex];
            if ((preset.isNoise == true) == isNoise) {
                group.appendChild(option({ value: (categoryIndex << 6) + presetIndex }, preset.name));
                foundAny = true;
            }
        }
        if (category.name == "String Presets" && foundAny) {
            let moveViolin2 = group.removeChild(group.children[11]);
            group.insertBefore(moveViolin2, group.children[1]);
        }
        if (category.name == "Flute Presets" && foundAny) {
            let moveFlute2 = group.removeChild(group.children[11]);
            group.insertBefore(moveFlute2, group.children[1]);
        }
        if (category.name == "Keyboard Presets" && foundAny) {
            let moveGrandPiano2 = group.removeChild(group.children[9]);
            group.insertBefore(moveGrandPiano2, group.children[1]);
        }
        if (foundAny)
            menu.appendChild(group);
    }
    return menu;
}
function setSelectedValue(menu, value) {
    const stringValue = value.toString();
    if (menu.value != stringValue)
        menu.value = stringValue;
    if ($(menu).data('select2')) {
        $(menu).val(value).trigger('change.select2');
    }
}
class CustomChipCanvas {
    constructor(canvas, _doc, _getChange) {
        this.canvas = canvas;
        this._doc = _doc;
        this._getChange = _getChange;
        this._change = null;
        this._onMouseMove = (event) => {
            if (this.mouseDown) {
                var x = (event.clientX || event.pageX) - this.canvas.getBoundingClientRect().left;
                var y = Math.floor((event.clientY || event.pageY) - this.canvas.getBoundingClientRect().top);
                if (y < 2)
                    y = 2;
                if (y > 50)
                    y = 50;
                var ctx = this.canvas.getContext("2d");
                if (this.continuousEdit == true && Math.abs(this.lastX - x) < 40) {
                    var lowerBound = (x < this.lastX) ? x : this.lastX;
                    var upperBound = (x < this.lastX) ? this.lastX : x;
                    for (let i = lowerBound; i <= upperBound; i += 2) {
                        var progress = (Math.abs(x - this.lastX) > 2.0) ? ((x > this.lastX) ?
                            1.0 - ((i - lowerBound) / (upperBound - lowerBound))
                            : ((i - lowerBound) / (upperBound - lowerBound))) : 0.0;
                        var j = Math.round(y + (this.lastY - y) * progress);
                        ctx.fillStyle = ColorConfig.getComputed("--editor-background");
                        ctx.fillRect(Math.floor(i / 2) * 2, 0, 2, 53);
                        ctx.fillStyle = ColorConfig.getComputed("--ui-widget-background");
                        ctx.fillRect(Math.floor(i / 2) * 2, 25, 2, 2);
                        ctx.fillStyle = ColorConfig.getComputed("--track-editor-bg-pitch-dim");
                        ctx.fillRect(Math.floor(i / 2) * 2, 13, 2, 1);
                        ctx.fillRect(Math.floor(i / 2) * 2, 39, 2, 1);
                        ctx.fillStyle = ColorConfig.getComputedChannelColor(this._doc.song, this._doc.channel).primaryNote;
                        ctx.fillRect(Math.floor(i / 2) * 2, j - 2, 2, 4);
                        this.newArray[Math.floor(i / 2)] = (j - 26);
                    }
                }
                else {
                    ctx.fillStyle = ColorConfig.getComputed("--editor-background");
                    ctx.fillRect(Math.floor(x / 2) * 2, 0, 2, 52);
                    ctx.fillStyle = ColorConfig.getComputed("--ui-widget-background");
                    ctx.fillRect(Math.floor(x / 2) * 2, 25, 2, 2);
                    ctx.fillStyle = ColorConfig.getComputed("--track-editor-bg-pitch-dim");
                    ctx.fillRect(Math.floor(x / 2) * 2, 13, 2, 1);
                    ctx.fillRect(Math.floor(x / 2) * 2, 39, 2, 1);
                    ctx.fillStyle = ColorConfig.getComputedChannelColor(this._doc.song, this._doc.channel).primaryNote;
                    ctx.fillRect(Math.floor(x / 2) * 2, y - 2, 2, 4);
                    this.newArray[Math.floor(x / 2)] = (y - 26);
                }
                this.continuousEdit = true;
                this.lastX = x;
                this.lastY = y;
                let instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
                let sum = 0.0;
                for (let i = 0; i < this.newArray.length; i++) {
                    sum += this.newArray[i];
                }
                const average = sum / this.newArray.length;
                let cumulative = 0;
                let wavePrev = 0;
                for (let i = 0; i < this.newArray.length; i++) {
                    cumulative += wavePrev;
                    wavePrev = this.newArray[i] - average;
                    instrument.customChipWaveIntegral[i] = cumulative;
                }
                instrument.customChipWaveIntegral[64] = 0.0;
            }
        };
        this._onMouseDown = (event) => {
            this.mouseDown = true;
            this._onMouseMove(event);
        };
        this._onMouseUp = () => {
            this.mouseDown = false;
            this.continuousEdit = false;
            this._whenChange();
        };
        this._whenChange = () => {
            this._change = this._getChange(this.newArray);
            this._doc.record(this._change);
            this._change = null;
        };
        canvas.addEventListener("mousemove", this._onMouseMove);
        canvas.addEventListener("mousedown", this._onMouseDown);
        canvas.addEventListener("mouseup", this._onMouseUp);
        canvas.addEventListener("mouseleave", this._onMouseUp);
        this.mouseDown = false;
        this.continuousEdit = false;
        this.lastX = 0;
        this.lastY = 0;
        this.newArray = new Float32Array(64);
        this.redrawCanvas();
    }
    redrawCanvas() {
        var ctx = this.canvas.getContext("2d");
        ctx.fillStyle = ColorConfig.getComputed("--editor-background");
        ctx.fillRect(0, 0, 128, 52);
        ctx.fillStyle = ColorConfig.getComputed("--ui-widget-background");
        ctx.fillRect(0, 25, 128, 2);
        ctx.fillStyle = ColorConfig.getComputed("--track-editor-bg-pitch-dim");
        ctx.fillRect(0, 13, 128, 1);
        ctx.fillRect(0, 39, 128, 1);
        ctx.fillStyle = ColorConfig.getComputedChannelColor(this._doc.song, this._doc.channel).primaryNote;
        for (let x = 0; x < 64; x++) {
            var y = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()].customChipWave[x] + 26;
            ctx.fillRect(x * 2, y - 2, 2, 4);
            this.newArray[x] = y - 26;
        }
    }
}
class CustomAlgorythmCanvas {
    constructor(canvas, _doc, _getChange) {
        this.canvas = canvas;
        this._doc = _doc;
        this._getChange = _getChange;
        this._change = null;
        this._onMouseMove = (event) => {
            var _a, _b, _c, _d;
            if (this.mouseDown) {
                var x = (event.clientX || event.pageX) - this.canvas.getBoundingClientRect().left;
                var y = Math.floor((event.clientY || event.pageY) - this.canvas.getBoundingClientRect().top);
                var ctx = this.canvas.getContext("2d");
                ctx.fillStyle = ColorConfig.getComputedChannelColor(this._doc.song, this._doc.channel).primaryNote;
                var yindex = Math.ceil(y / 12);
                var xindex = Math.ceil(x / 12);
                yindex = (yindex / 2) - Math.floor(yindex / 2) >= 0.5 ? Math.floor(yindex / 2) : -1;
                xindex = (xindex / 2) + 0.5 - Math.floor(xindex / 2) <= 0.5 ? Math.floor(xindex / 2) - 1 : -1;
                yindex = yindex >= 0 && yindex <= 5 ? yindex : -1;
                xindex = xindex >= 0 && xindex <= 5 ? xindex : -1;
                ctx.fillRect(xindex * 24 + 12, yindex * 24, 2, 2);
                if (this.selected == -1) {
                    if (((_b = (_a = this.drawArray) === null || _a === void 0 ? void 0 : _a[yindex]) === null || _b === void 0 ? void 0 : _b[xindex]) != undefined) {
                        this.selected = this.drawArray[yindex][xindex];
                        ctx.fillRect(xindex * 24 + 12, yindex * 24, 12, 12);
                        ctx.fillStyle = ColorConfig.getComputed("--editor-background");
                        ctx.fillText(this.drawArray[yindex][xindex] + "", xindex * 24 + 14, yindex * 24 + 10);
                        this.mouseDown = false;
                    }
                }
                else {
                    if (((_d = (_c = this.drawArray) === null || _c === void 0 ? void 0 : _c[yindex]) === null || _d === void 0 ? void 0 : _d[xindex]) != undefined) {
                        if (this.mode == "feedback") {
                            const newmod = this.drawArray[yindex][xindex];
                            let check = this.feedback[newmod - 1].indexOf(this.selected);
                            if (check != -1) {
                                this.feedback[newmod - 1].splice(check, 1);
                            }
                            else {
                                this.feedback[newmod - 1].push(this.selected);
                            }
                        }
                        else {
                            if (this.drawArray[yindex][xindex] == this.selected) {
                                if (this.selected == this.carriers) {
                                    if (this.selected > 1) {
                                        this.carriers--;
                                    }
                                }
                                else if (this.selected - 1 == this.carriers) {
                                    this.carriers++;
                                }
                            }
                            else {
                                const newmod = this.drawArray[yindex][xindex];
                                if (this.selected > newmod) {
                                    let check = this.newMods[newmod - 1].indexOf(this.selected);
                                    if (check != -1) {
                                        this.newMods[newmod - 1].splice(check, 1);
                                    }
                                    else {
                                        this.newMods[newmod - 1].push(this.selected);
                                    }
                                }
                                else {
                                    let check = this.newMods[this.selected - 1].indexOf(newmod);
                                    if (check != -1) {
                                        this.newMods[this.selected - 1].splice(check, 1);
                                    }
                                    else {
                                        this.newMods[this.selected - 1].push(newmod);
                                    }
                                }
                            }
                        }
                        this.selected = -1;
                        this.redrawCanvas(true);
                        this.mouseDown = false;
                    }
                    else {
                        this.selected = -1;
                        this.redrawCanvas(true);
                        this.mouseDown = false;
                    }
                }
            }
        };
        this._onMouseDown = (event) => {
            this.mouseDown = true;
            this._onMouseMove(event);
        };
        this._onMouseUp = () => {
            this.mouseDown = false;
            this._whenChange();
        };
        this._whenChange = () => {
            this._change = this._getChange(this.mode == "algorithm" ? this.newMods : this.feedback, this.carriers, this.mode);
            this._doc.record(this._change);
            this._change = null;
        };
        canvas.addEventListener("mousemove", this._onMouseMove);
        canvas.addEventListener("mousedown", this._onMouseDown);
        canvas.addEventListener("mouseup", this._onMouseUp);
        canvas.addEventListener("mouseleave", this._onMouseUp);
        this.mouseDown = false;
        this.drawArray = [[], [], [], [], [], []];
        this.lookUpArray = [[], [], [], [], [], []];
        this.carriers = 1;
        this.selected = -1;
        this.newMods = [[], [], [], [], [], []];
        this.inverseModulation = [[], [], [], [], [], []];
        this.feedback = [[], [], [], [], [], []];
        this.inverseFeedback = [[], [], [], [], [], []];
        this.mode = "algorithm";
        this.redrawCanvas();
    }
    reset() {
        this.redrawCanvas(false);
        this.selected = -1;
    }
    fillDrawArray(noReset = false) {
        if (noReset) {
            this.drawArray = [];
            this.drawArray = [[], [], [], [], [], []];
            this.inverseModulation = [[], [], [], [], [], []];
            this.lookUpArray = [[], [], [], [], [], []];
            for (let i = 0; i < this.newMods.length; i++) {
                for (let o = 0; o < this.newMods[i].length; o++) {
                    this.inverseModulation[this.newMods[i][o] - 1].push(i + 1);
                }
            }
            if (this.mode == "feedback") {
                this.inverseFeedback = [[], [], [], [], [], []];
                for (let i = 0; i < this.feedback.length; i++) {
                    for (let o = 0; o < this.feedback[i].length; o++) {
                        this.inverseFeedback[this.feedback[i][o] - 1].push(i + 1);
                    }
                }
            }
        }
        else {
            this.drawArray = [];
            this.drawArray = [[], [], [], [], [], []];
            this.carriers = 1;
            this.newMods = [[], [], [], [], [], []];
            this.inverseModulation = [[], [], [], [], [], []];
            this.lookUpArray = [[], [], [], [], [], []];
            var oldMods = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()].customAlgorithm;
            this.carriers = oldMods.carrierCount;
            for (let i = 0; i < oldMods.modulatedBy.length; i++) {
                for (let o = 0; o < oldMods.modulatedBy[i].length; o++) {
                    this.inverseModulation[oldMods.modulatedBy[i][o] - 1].push(i + 1);
                    this.newMods[i][o] = oldMods.modulatedBy[i][o];
                }
            }
            if (this.mode == "feedback") {
                this.feedback = [[], [], [], [], [], []];
                this.inverseFeedback = [[], [], [], [], [], []];
                var oldfeed = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()].customFeedbackType.indices;
                for (let i = 0; i < oldfeed.length; i++) {
                    for (let o = 0; o < oldfeed[i].length; o++) {
                        this.inverseFeedback[oldfeed[i][o] - 1].push(i + 1);
                        this.feedback[i][o] = oldfeed[i][o];
                    }
                }
            }
        }
        for (let i = 0; i < this.inverseModulation.length; i++) {
            if (i < this.carriers) {
                this.drawArray[this.drawArray.length - 1][i] = i + 1;
                this.lookUpArray[i] = [0, i];
            }
            else {
                if (this.inverseModulation[i][0] != undefined) {
                    let testPos = [this.drawArray.length - (this.lookUpArray[this.inverseModulation[i][this.inverseModulation[i].length - 1] - 1][0] + 2), this.lookUpArray[this.inverseModulation[i][this.inverseModulation[i].length - 1] - 1][1]];
                    if (this.drawArray[testPos[0]][testPos[1]] != undefined) {
                        while (this.drawArray[testPos[0]][testPos[1]] != undefined && testPos[1] < 6) {
                            testPos[1]++;
                            if (this.drawArray[testPos[0]][testPos[1]] == undefined) {
                                this.drawArray[testPos[0]][testPos[1]] = i + 1;
                                this.lookUpArray[i] = [this.drawArray.length - (testPos[0] + 1), testPos[1]];
                                break;
                            }
                            console.log(testPos[1]);
                        }
                    }
                    else {
                        this.drawArray[testPos[0]][testPos[1]] = i + 1;
                        this.lookUpArray[i] = [this.drawArray.length - (testPos[0] + 1), testPos[1]];
                    }
                }
                else {
                    let testPos = [5, 0];
                    while (this.drawArray[testPos[0]][testPos[1]] != undefined && testPos[1] < 6) {
                        testPos[1]++;
                        if (this.drawArray[testPos[0]][testPos[1]] == undefined) {
                            this.drawArray[testPos[0]][testPos[1]] = i + 1;
                            this.lookUpArray[i] = [this.drawArray.length - (testPos[0] + 1), testPos[1]];
                            break;
                        }
                    }
                }
            }
        }
    }
    drawLines(ctx) {
        if (this.mode == "feedback") {
            for (let off = 0; off < 6; off++) {
                ctx.strokeStyle = ColorConfig.getArbitaryChannelColor("pitch", off).primaryChannel;
                const set = off * 2 + 0.5;
                for (let i = 0; i < this.inverseFeedback[off].length; i++) {
                    let tar = this.inverseFeedback[off][i] - 1;
                    let srtpos = this.lookUpArray[off];
                    let tarpos = this.lookUpArray[tar];
                    ctx.beginPath();
                    ctx.moveTo(srtpos[1] * 24 + 12 + set, (6 - srtpos[0] - 1) * 24 + 12);
                    ctx.lineTo(srtpos[1] * 24 + 12 + set, (6 - srtpos[0] - 1) * 24 + 12 + set);
                    if (tarpos[1] != srtpos[1]) {
                        let side = 0;
                        if (tarpos[0] >= srtpos[0]) {
                            side = 24;
                        }
                        ctx.lineTo(srtpos[1] * 24 + side + set, (6 - srtpos[0] - 1) * 24 + 12 + set);
                        if ((tarpos[1] == (srtpos[1] - 1)) && (tarpos[0] <= (srtpos[0] - 1))) {
                        }
                        else {
                            if (tarpos[0] >= srtpos[0]) {
                                ctx.lineTo((tarpos[1] + 1) * 24 + set, (6 - srtpos[0] - 1) * 24 + 12 + set);
                                ctx.lineTo((tarpos[1] + 1) * 24 + set, (6 - tarpos[0] - 1) * 24 + 12 + set);
                            }
                            else {
                                ctx.lineTo(srtpos[1] * 24 + set, (6 - tarpos[0] - 1) * 24 + 12 + set);
                                ctx.lineTo((tarpos[1] + 1) * 24 + set, (6 - tarpos[0] - 1) * 24 + 12 + set);
                            }
                        }
                        ctx.lineTo((tarpos[1] + 1) * 24 + set, (6 - tarpos[0] - 1) * 24 + set - 12);
                        ctx.lineTo((tarpos[1]) * 24 + 12 + set, (6 - tarpos[0] - 1) * 24 + set - 12);
                        ctx.lineTo((tarpos[1]) * 24 + 12 + set, (6 - tarpos[0] - 1) * 24);
                    }
                    else {
                        if (srtpos[0] - tarpos[0] == 1) {
                            ctx.lineTo((tarpos[1]) * 24 + 12 + set, (6 - tarpos[0] - 1) * 24);
                        }
                        else {
                            if (tarpos[0] >= srtpos[0]) {
                                ctx.lineTo(srtpos[1] * 24 + 24 + set, (6 - srtpos[0] - 1) * 24 + 12 + set);
                                ctx.lineTo(srtpos[1] * 24 + 24 + set, (6 - tarpos[0] - 1) * 24 + set - 12);
                                ctx.lineTo(tarpos[1] * 24 + set + 12, (6 - tarpos[0] - 1) * 24 + set - 12);
                                ctx.lineTo(tarpos[1] * 24 + set + 12, (6 - tarpos[0] - 1) * 24);
                            }
                            else {
                                ctx.lineTo(srtpos[1] * 24 + set, (6 - srtpos[0] - 1) * 24 + 12 + set);
                                ctx.lineTo(srtpos[1] * 24 + set, (6 - tarpos[0] - 1) * 24 + set - 12);
                                ctx.lineTo(tarpos[1] * 24 + 12 + set, (6 - tarpos[0] - 1) * 24 + set - 12);
                                ctx.lineTo(tarpos[1] * 24 + 12 + set, (6 - tarpos[0] - 1) * 24);
                            }
                        }
                    }
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
            return;
        }
        ;
        for (let off = 0; off < 6; off++) {
            ctx.strokeStyle = ColorConfig.getArbitaryChannelColor("pitch", off).primaryChannel;
            const set = off * 2 - 1 + 0.5;
            for (let i = 0; i < this.inverseModulation[off].length; i++) {
                let tar = this.inverseModulation[off][i] - 1;
                let srtpos = this.lookUpArray[off];
                let tarpos = this.lookUpArray[tar];
                ctx.beginPath();
                ctx.moveTo(srtpos[1] * 24 + 12 + set, (6 - srtpos[0] - 1) * 24 + 12);
                ctx.lineTo(srtpos[1] * 24 + 12 + set, (6 - srtpos[0] - 1) * 24 + 12 + set);
                if ((tarpos[1]) != srtpos[1]) {
                    ctx.lineTo(srtpos[1] * 24 + set, (6 - srtpos[0] - 1) * 24 + 12 + set);
                    if ((tarpos[1] == (srtpos[1] - 1)) && (tarpos[0] <= (srtpos[0] - 1))) {
                    }
                    else {
                        ctx.lineTo(srtpos[1] * 24 + set, (6 - tarpos[0] - 1) * 24 + 12 + set);
                        ctx.lineTo((tarpos[1] + 1) * 24 + set, (6 - tarpos[0] - 1) * 24 + 12 + set);
                    }
                    ctx.lineTo((tarpos[1] + 1) * 24 + set, (6 - tarpos[0] - 1) * 24 + set - 12);
                    ctx.lineTo((tarpos[1]) * 24 + 12 + set, (6 - tarpos[0] - 1) * 24 + set - 12);
                    ctx.lineTo((tarpos[1]) * 24 + 12 + set, (6 - tarpos[0] - 1) * 24);
                }
                else {
                    if (Math.abs(tarpos[0] - srtpos[0]) == 1) {
                        ctx.lineTo((tarpos[1]) * 24 + 12 + set, (6 - tarpos[0] - 1) * 24);
                    }
                    else {
                        ctx.lineTo(srtpos[1] * 24 + set, (6 - srtpos[0] - 1) * 24 + 12 + set);
                        ctx.lineTo(srtpos[1] * 24 + set, (6 - tarpos[0] - 1) * 24 + set - 12);
                        ctx.lineTo(srtpos[1] * 24 + 12 + set, (6 - tarpos[0] - 1) * 24 + set - 12);
                        ctx.lineTo(srtpos[1] * 24 + 12 + set, (6 - tarpos[0] - 1) * 24);
                    }
                }
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    redrawCanvas(noReset = false) {
        this.fillDrawArray(noReset);
        var ctx = this.canvas.getContext("2d");
        ctx.fillStyle = ColorConfig.getComputed("--editor-background");
        ctx.fillRect(0, 0, 144, 144);
        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 6; y++) {
                ctx.fillStyle = ColorConfig.getComputed("--track-editor-bg-pitch-dim");
                ctx.fillRect(x * 24 + 12, ((y) * 24), 12, 12);
                ctx.fillStyle = ColorConfig.getComputed("--editor-background");
                ctx.fillRect(x * 24 + 13, ((y) * 24) + 1, 10, 10);
                if (this.drawArray[y][x] != undefined) {
                    if (this.drawArray[y][x] <= this.carriers) {
                        ctx.fillStyle = ColorConfig.getComputed("--primary-text");
                        ctx.fillRect(x * 24 + 12, ((y) * 24), 12, 12);
                        ctx.fillStyle = ColorConfig.getComputed("--editor-background");
                        ctx.fillRect(x * 24 + 13, ((y) * 24) + 1, 10, 10);
                        ctx.fillStyle = ColorConfig.getComputedChannelColor(this._doc.song, this._doc.channel).primaryNote;
                        ctx.fillText(this.drawArray[y][x] + "", x * 24 + 14, y * 24 + 10);
                    }
                    else {
                        ctx.fillStyle = ColorConfig.getComputedChannelColor(this._doc.song, this._doc.channel).primaryNote;
                        ctx.fillRect(x * 24 + 12, (y * 24), 12, 12);
                        ctx.fillStyle = ColorConfig.getComputed("--editor-background");
                        ctx.fillRect(x * 24 + 13, ((y) * 24) + 1, 10, 10);
                        ctx.fillStyle = ColorConfig.getComputed("--primary-text");
                        ctx.fillText(this.drawArray[y][x] + "", x * 24 + 14, y * 24 + 10);
                    }
                }
            }
        }
        this.drawLines(ctx);
    }
}
export class SongEditor {
    constructor(_doc) {
        this._doc = _doc;
        this.prompt = null;
        this._keyboardLayout = new KeyboardLayout(this._doc);
        this._patternEditorPrev = new PatternEditor(this._doc, false, -1);
        this._patternEditor = new PatternEditor(this._doc, true, 0);
        this._patternEditorNext = new PatternEditor(this._doc, false, 1);
        this._trackEditor = new TrackEditor(this._doc, this);
        this._muteEditor = new MuteEditor(this._doc, this);
        this._loopEditor = new LoopEditor(this._doc);
        this._piano = new Piano(this._doc);
        this._octaveScrollBar = new OctaveScrollBar(this._doc, this._piano);
        this._playButton = button({ class: "playButton", type: "button", title: "Play (Space)" }, span("Play"));
        this._pauseButton = button({ class: "pauseButton", style: "display: none;", type: "button", title: "Pause (Space)" }, "Pause");
        this._recordButton = button({ class: "recordButton", style: "display: none;", type: "button", title: "Record (Ctrl+Space)" }, span("Record"));
        this._stopButton = button({ class: "stopButton", style: "display: none;", type: "button", title: "Stop Recording (Space)" }, "Stop Recording");
        this._prevBarButton = button({ class: "prevBarButton", type: "button", title: "Previous Bar (left bracket)" });
        this._nextBarButton = button({ class: "nextBarButton", type: "button", title: "Next Bar (right bracket)" });
        this._volumeSlider = new Slider(input({ title: "main volume", style: "width: 5em; flex-grow: 1; margin: 0;", type: "range", min: "0", max: "75", value: "50", step: "1" }), this._doc, null, false);
        this._outVolumeBarBg = SVG.rect({ "pointer-events": "none", width: "90%", height: "50%", x: "5%", y: "25%", fill: ColorConfig.uiWidgetBackground });
        this._outVolumeBar = SVG.rect({ "pointer-events": "none", height: "50%", width: "0%", x: "5%", y: "25%", fill: "url('#volumeGrad2')" });
        this._outVolumeCap = SVG.rect({ "pointer-events": "none", width: "2px", height: "50%", x: "5%", y: "25%", fill: ColorConfig.uiWidgetFocus });
        this._stop1 = SVG.stop({ "stop-color": "lime", offset: "60%" });
        this._stop2 = SVG.stop({ "stop-color": "orange", offset: "90%" });
        this._stop3 = SVG.stop({ "stop-color": "red", offset: "100%" });
        this._gradient = SVG.linearGradient({ id: "volumeGrad2", gradientUnits: "userSpaceOnUse" }, this._stop1, this._stop2, this._stop3);
        this._defs = SVG.defs({}, this._gradient);
        this._volumeBarContainer = SVG.svg({ style: `touch-action: none; overflow: visible; margin: auto; max-width: 20vw;`, width: "160px", height: "100%", preserveAspectRatio: "none", viewBox: "0 0 160 12" }, this._defs, this._outVolumeBarBg, this._outVolumeBar, this._outVolumeCap);
        this._volumeBarBox = div({ class: "playback-volume-bar", style: "height: 12px; align-self: center;" }, this._volumeBarContainer);
        this._fileMenu = select({ style: "width: 100%;" }, option({ selected: true, disabled: true, hidden: false }, "File"), option({ value: "new" }, "+ New Blank Song"), option({ value: "import" }, "↑ Import Song... (" + EditorConfig.ctrlSymbol + "O)"), option({ value: "export" }, "↓ Export Song... (" + EditorConfig.ctrlSymbol + "S)"), option({ value: "copyUrl" }, "⎘ Copy Song URL"), option({ value: "shareUrl" }, "⤳ Share Song URL"), option({ value: "shortenUrl" }, "… Shorten Song URL"), option({ value: "viewPlayer" }, "▶ View in Song Player"), option({ value: "copyEmbed" }, "⎘ Copy HTML Embed Code"), option({ value: "songRecovery" }, "⚠ Recover Recent Song..."));
        this._editMenu = select({ style: "width: 100%;" }, option({ selected: true, disabled: true, hidden: false }, "Edit"), option({ value: "undo" }, "Undo (Z)"), option({ value: "redo" }, "Redo (Y)"), option({ value: "copy" }, "Copy Pattern (C)"), option({ value: "pasteNotes" }, "Paste Pattern Notes (V)"), option({ value: "pasteNumbers" }, "Paste Pattern Numbers (" + EditorConfig.ctrlSymbol + "⇧V)"), option({ value: "insertBars" }, "Insert Bar (⏎)"), option({ value: "deleteBars" }, "Delete Selected Bars (⌫)"), option({ value: "insertChannel" }, "Insert Channel (" + EditorConfig.ctrlSymbol + "⏎)"), option({ value: "deleteChannel" }, "Delete Selected Channels (" + EditorConfig.ctrlSymbol + "⌫)"), option({ value: "selectChannel" }, "Select Channel (⇧A)"), option({ value: "selectAll" }, "Select All (A)"), option({ value: "duplicatePatterns" }, "Duplicate Reused Patterns (D)"), option({ value: "transposeUp" }, "Move Notes Up (+ or ⇧+)"), option({ value: "transposeDown" }, "Move Notes Down (- or ⇧-)"), option({ value: "moveNotesSideways" }, "Move All Notes Sideways... (W)"), option({ value: "beatsPerBar" }, "Change Beats Per Bar..."), option({ value: "barCount" }, "Change Song Length... (L)"), option({ value: "channelSettings" }, "Channel Settings... (Q)"), option({ value: "limiterSettings" }, "Limiter Settings... (⇧L)"));
        this._optionsMenu = select({ style: "width: 100%;" }, option({ selected: true, disabled: true, hidden: false }, "Preferences"), option({ value: "autoPlay" }, "Auto Play on Load"), option({ value: "autoFollow" }, "Keep Current Pattern Selected"), option({ value: "enableNotePreview" }, "Hear Preview of Added Notes"), option({ value: "showLetters" }, "Show Piano Keys"), option({ value: "showFifth" }, 'Highlight "Fifth" of Song Key'), option({ value: "notesOutsideScale" }, "Allow Adding Notes Not in Scale"), option({ value: "setDefaultScale" }, "Use Current Scale as Default"), option({ value: "showChannels" }, "Show Notes From All Channels"), option({ value: "showScrollBar" }, "Show Octave Scroll Bar"), option({ value: "alwaysFineNoteVol" }, "Always Fine Note Volume"), option({ value: "enableChannelMuting" }, "Enable Channel Muting"), option({ value: "displayBrowserUrl" }, "Display Song Data in URL"), option({ value: "displayVolumeBar" }, "Show Playback Volume"), option({ value: "layout" }, "Set Layout..."), option({ value: "colorTheme" }, "Set Theme..."), option({ value: "recordingSetup" }, "Set Up Note Recording..."));
        this._scaleSelect = buildOptions(select(), Config.scales.map(scale => scale.name));
        this._keySelect = buildOptions(select(), Config.keys.map(key => key.name).reverse());
        this._tempoSlider = new Slider(input({ style: "margin: 0; vertical-align: middle;", type: "range", min: "30", max: "320", value: "160", step: "1" }), this._doc, (oldValue, newValue) => new ChangeTempo(this._doc, oldValue, newValue), false);
        this._tempoStepper = input({ style: "width: 4em; font-size: 80%; margin-left: 0.4em; vertical-align: middle;", type: "number", step: "1" });
        this._chorusSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.chorusRange - 1, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeChorus(this._doc, oldValue, newValue), false);
        this._chorusRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("chorus") }, "Chorus:"), this._chorusSlider.container);
        this._reverbSlider = new Slider(input({ style: "margin: 0; position: sticky,", type: "range", min: "0", max: Config.reverbRange - 1, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeReverb(this._doc, oldValue, newValue), false);
        this._reverbRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("reverb") }, "Reverb:"), this._reverbSlider.container);
        this._echoSustainSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.echoSustainRange - 1, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeEchoSustain(this._doc, oldValue, newValue), false);
        this._echoSustainRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("echoSustain") }, "Echo:"), this._echoSustainSlider.container);
        this._echoDelaySlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.echoDelayRange - 1, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeEchoDelay(this._doc, oldValue, newValue), false);
        this._echoDelayRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("echoDelay") }, "Echo Delay:"), this._echoDelaySlider.container);
        this._rhythmSelect = buildOptions(select(), Config.rhythms.map(rhythm => rhythm.name));
        this._pitchedPresetSelect = buildPresetOptions(false, "pitchPresetSelect");
        this._drumPresetSelect = buildPresetOptions(true, "drumPresetSelect");
        this._algorithmSelect = buildOptions(select(), Config.algorithms.map(algorithm => algorithm.name));
        this._algorithmSelectRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("algorithm") }, "Algorithm: "), div({ class: "selectContainer" }, this._algorithmSelect));
        this._instrumentButtons = [];
        this._instrumentAddButton = button({ type: "button", class: "add-instrument last-button" });
        this._instrumentRemoveButton = button({ type: "button", class: "remove-instrument" });
        this._instrumentsButtonBar = div({ class: "instrument-bar" }, this._instrumentRemoveButton, this._instrumentAddButton);
        this._instrumentsButtonRow = div({ class: "selectRow", style: "display: none;" }, span({ class: "tip", onclick: () => this._openPrompt("instrumentIndex") }, "Instrument:"), this._instrumentsButtonBar);
        this._instrumentVolumeSlider = new Slider(input({ style: "margin: 0; position: sticky;", type: "range", min: Math.floor(-Config.volumeRange / 2), max: Math.floor(Config.volumeRange / 2), value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeVolume(this._doc, oldValue, newValue), true);
        this._instrumentVolumeSliderInputBox = input({ style: "width: 4em; font-size: 80%", id: "volumeSliderInputBox", type: "number", step: "1", min: Math.floor(-Config.volumeRange / 2), max: Math.floor(Config.volumeRange / 2), value: "0" });
        this._instrumentVolumeSliderTip = div({ class: "selectRow", style: "height: 1em" }, span({ class: "tip", style: "font-size: smaller;", onclick: () => this._openPrompt("instrumentVolume") }, "Volume: "));
        this._instrumentVolumeSliderRow = div({ class: "selectRow" }, div({}, div({ style: "color: " + ColorConfig.secondaryText + ";" }, span({ class: "tip" }, this._instrumentVolumeSliderTip)), div({ style: "color: " + ColorConfig.secondaryText + "; margin-top: -3px;" }, this._instrumentVolumeSliderInputBox)), this._instrumentVolumeSlider.container);
        this._panSlider = new Slider(input({ style: "margin: 0; position: sticky;", type: "range", min: "0", max: Config.panMax, value: Config.panCenter, step: "1" }), this._doc, (oldValue, newValue) => new ChangePan(this._doc, oldValue, newValue), true);
        this._panDropdown = button({ style: "margin-left:0em; height:1.5em; width: 10px; padding: 0px; font-size: 8px;", onclick: () => this._toggleDropdownMenu(1) }, "▼");
        this._panSliderInputBox = input({ style: "width: 4em; font-size: 80%; ", id: "panSliderInputBox", type: "number", step: "1", min: "0", max: "100", value: "0" });
        this._panSliderRow = div({ class: "selectRow" }, div({}, span({ class: "tip", tabindex: "0", style: "height:1em; font-size: smaller;", onclick: () => this._openPrompt("pan") }, "Pan: "), div({ style: "color: " + ColorConfig.secondaryText + "; margin-top: -3px;" }, this._panSliderInputBox)), this._panDropdown, this._panSlider.container);
        this._panDelaySlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.modulators.dictionary["pan delay"].maxRawVol, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangePanDelay(this._doc, oldValue, newValue), false);
        this._panDelayRow = div({ class: "selectRow" }, span({ class: "tip", style: "margin-left:10px;", onclick: () => this._openPrompt("panDelay") }, "Delay:"), this._panDelaySlider.container);
        this._panDropdownGroup = div({ class: "editor-controls", style: "display: none;" }, this._panDelayRow);
        this._chipWaveSelect = buildOptions(select(), Config.chipWaves.map(wave => wave.name));
        this._chipNoiseSelect = buildOptions(select(), Config.chipNoises.map(wave => wave.name));
        this._chipWaveSelectRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("chipWave") }, "Wave: "), div({ class: "selectContainer" }, this._chipWaveSelect));
        this._chipNoiseSelectRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("chipNoise") }, "Noise: "), div({ class: "selectContainer" }, this._chipNoiseSelect));
        this._fadeInOutEditor = new FadeInOutEditor(this._doc);
        this._fadeInOutRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("fadeInOut") }, "Fade:"), this._fadeInOutEditor.container);
        this._transitionSelect = buildOptions(select(), Config.transitions.map(transition => transition.name));
        this._transitionDropdown = button({ style: "margin-left:0em; height:1.5em; width: 10px; padding: 0px; font-size: 8px;", onclick: () => this._toggleDropdownMenu(3) }, "▼");
        this._transitionRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("transition") }, "Transition:"), this._transitionDropdown, div({ class: "selectContainer", style: "width: 52.5%;" }, this._transitionSelect));
        this._clicklessTransitionBox = input({ type: "checkbox", style: "width: 1em; padding: 0; margin-right: 4em;" });
        this._clicklessTransitionRow = div({ class: "selectRow" }, span({ class: "tip", style: "margin-left:10px;", onclick: () => this._openPrompt("clicklessTransition") }, "Clickless:"), this._clicklessTransitionBox);
        this._transitionDropdownGroup = div({ class: "editor-controls", style: "display: none;" }, this._clicklessTransitionRow);
        this._effectsSelect = select(option({ selected: true, disabled: true, hidden: false }));
        this._eqFilterSimpleButton = button({ style: "font-size: x-small; width: 50%; height: 40%", class: "no-underline", onclick: () => this._switchEQFilterType(true) }, "simple");
        this._eqFilterAdvancedButton = button({ style: "font-size: x-small; width: 50%; height: 40%", class: "last-button no-underline", onclick: () => this._switchEQFilterType(false) }, "advanced");
        this._eqFilterTypeRow = div({ class: "selectRow", style: "padding-top: 4px; margin-bottom: 0px;" }, span({ style: "font-size: x-small;", class: "tip", onclick: () => this._openPrompt("filterType") }, "EQ Filt.Type:"), div({ class: "instrument-bar" }, this._eqFilterSimpleButton, this._eqFilterAdvancedButton));
        this._eqFilterEditor = new FilterEditor(this._doc);
        this._eqFilterZoom = button({ style: "margin-left:0em; padding-left:0.2em; height:1.5em; max-width: 12px;", onclick: () => this._openPrompt("customEQFilterSettings") }, "+");
        this._eqFilterRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("eqFilter") }, "EQ Filt:"), this._eqFilterZoom, this._eqFilterEditor.container);
        this._eqFilterSimpleCutSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.filterSimpleCutRange - 1, value: "6", step: "1" }), this._doc, (oldValue, newValue) => new ChangeEQFilterSimpleCut(this._doc, oldValue, newValue), false);
        this._eqFilterSimpleCutRow = div({ class: "selectRow", title: "Low-pass Filter Cutoff Frequency" }, span({ class: "tip", onclick: () => this._openPrompt("filterCutoff") }, "Filter Cut:"), this._eqFilterSimpleCutSlider.container);
        this._eqFilterSimplePeakSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.filterSimplePeakRange - 1, value: "6", step: "1" }), this._doc, (oldValue, newValue) => new ChangeEQFilterSimplePeak(this._doc, oldValue, newValue), false);
        this._eqFilterSimplePeakRow = div({ class: "selectRow", title: "Low-pass Filter Peak Resonance" }, span({ class: "tip", onclick: () => this._openPrompt("filterResonance") }, "Filter Peak:"), this._eqFilterSimplePeakSlider.container);
        this._noteFilterSimpleButton = button({ style: "font-size: x-small; width: 50%; height: 40%", class: "no-underline", onclick: () => this._switchNoteFilterType(true) }, "simple");
        this._noteFilterAdvancedButton = button({ style: "font-size: x-small; width: 50%; height: 40%", class: "last-button no-underline", onclick: () => this._switchNoteFilterType(false) }, "advanced");
        this._noteFilterTypeRow = div({ class: "selectRow", style: "padding-top: 4px; margin-bottom: 0px;" }, span({ style: "font-size: x-small;", class: "tip", onclick: () => this._openPrompt("filterType") }, "Note Filt.Type:"), div({ class: "instrument-bar" }, this._noteFilterSimpleButton, this._noteFilterAdvancedButton));
        this._noteFilterEditor = new FilterEditor(this._doc, true);
        this._noteFilterZoom = button({ style: "margin-left:0em; padding-left:0.2em; height:1.5em; max-width: 12px;", onclick: () => this._openPrompt("customNoteFilterSettings") }, "+");
        this._noteFilterRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("noteFilter") }, "Note Filt:"), this._noteFilterZoom, this._noteFilterEditor.container);
        this._noteFilterSimpleCutSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.filterSimpleCutRange - 1, value: "6", step: "1" }), this._doc, (oldValue, newValue) => new ChangeNoteFilterSimpleCut(this._doc, oldValue, newValue), false);
        this._noteFilterSimpleCutRow = div({ class: "selectRow", title: "Low-pass Filter Cutoff Frequency" }, span({ class: "tip", onclick: () => this._openPrompt("filterCutoff") }, "Filter Cut:"), this._noteFilterSimpleCutSlider.container);
        this._noteFilterSimplePeakSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.filterSimplePeakRange - 1, value: "6", step: "1" }), this._doc, (oldValue, newValue) => new ChangeNoteFilterSimplePeak(this._doc, oldValue, newValue), false);
        this._noteFilterSimplePeakRow = div({ class: "selectRow", title: "Low-pass Filter Peak Resonance" }, span({ class: "tip", onclick: () => this._openPrompt("filterResonance") }, "Filter Peak:"), this._noteFilterSimplePeakSlider.container);
        this._pulseWidthSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "1", max: Config.pulseWidthRange, value: "1", step: "1" }), this._doc, (oldValue, newValue) => new ChangePulseWidth(this._doc, oldValue, newValue), false);
        this._pulseWidthRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("pulseWidth") }, "Pulse Width:"), this._pulseWidthSlider.container);
        this._pitchShiftSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.pitchShiftRange - 1, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangePitchShift(this._doc, oldValue, newValue), true);
        this._pitchShiftTonicMarkers = [div({ class: "pitchShiftMarker", style: { color: ColorConfig.tonic } }), div({ class: "pitchShiftMarker", style: { color: ColorConfig.tonic, left: "50%" } }), div({ class: "pitchShiftMarker", style: { color: ColorConfig.tonic, left: "100%" } })];
        this._pitchShiftFifthMarkers = [div({ class: "pitchShiftMarker", style: { color: ColorConfig.fifthNote, left: (100 * 7 / 24) + "%" } }), div({ class: "pitchShiftMarker", style: { color: ColorConfig.fifthNote, left: (100 * 19 / 24) + "%" } })];
        this._pitchShiftMarkerContainer = div({ style: "display: flex; position: relative;" }, this._pitchShiftSlider.container, div({ class: "pitchShiftMarkerContainer" }, this._pitchShiftTonicMarkers, this._pitchShiftFifthMarkers));
        this._pitchShiftRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("pitchShift") }, "Pitch Shift:"), this._pitchShiftMarkerContainer);
        this._detuneSlider = new Slider(input({ style: "margin: 0;", type: "range", min: Config.detuneMin - Config.detuneCenter, max: Config.detuneMax - Config.detuneCenter, value: 0, step: "4" }), this._doc, (oldValue, newValue) => new ChangeDetune(this._doc, oldValue, newValue), true);
        this._detuneSliderInputBox = input({ style: "width: 4em; font-size: 80%; ", id: "detuneSliderInputBox", type: "number", step: "1", min: Config.detuneMin - Config.detuneCenter, max: Config.detuneMax - Config.detuneCenter, value: 0 });
        this._detuneSliderRow = div({ class: "selectRow" }, div({}, span({ class: "tip", style: "height:1em; font-size: smaller;", onclick: () => this._openPrompt("detune") }, "Detune: "), div({ style: "color: " + ColorConfig.secondaryText + "; margin-top: -3px;" }, this._detuneSliderInputBox)), this._detuneSlider.container);
        this._distortionSlider = new Slider(input({ style: "margin: 0; position: sticky;", type: "range", min: "0", max: Config.distortionRange - 1, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeDistortion(this._doc, oldValue, newValue), false);
        this._distortionRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("distortion") }, "Distortion:"), this._distortionSlider.container);
        this._aliasingBox = input({ type: "checkbox", style: "width: 1em; padding: 0; margin-right: 4em;" });
        this._aliasingRow = div({ class: "selectRow" }, span({ class: "tip", style: "margin-left:10px;", onclick: () => this._openPrompt("aliases") }, "Aliasing:"), this._aliasingBox);
        this._bitcrusherQuantizationSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.bitcrusherQuantizationRange - 1, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeBitcrusherQuantization(this._doc, oldValue, newValue), false);
        this._bitcrusherQuantizationRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("bitcrusherQuantization") }, "Bit Crush:"), this._bitcrusherQuantizationSlider.container);
        this._bitcrusherFreqSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.bitcrusherFreqRange - 1, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeBitcrusherFreq(this._doc, oldValue, newValue), false);
        this._bitcrusherFreqRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("bitcrusherFreq") }, "Freq Crush:"), this._bitcrusherFreqSlider.container);
        this._stringSustainSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.stringSustainRange - 1, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeStringSustain(this._doc, oldValue, newValue), false);
        this._stringSustainRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("stringSustain") }, "Sustain:"), this._stringSustainSlider.container);
        this._unisonSelect = buildOptions(select(), Config.unisons.map(unison => unison.name));
        this._unisonSelectRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("unison") }, "Unison:"), div({ class: "selectContainer" }, this._unisonSelect));
        this._chordSelect = buildOptions(select(), Config.chords.map(chord => chord.name));
        this._chordDropdown = button({ style: "margin-left:0em; height:1.5em; width: 10px; padding: 0px; font-size: 8px;", onclick: () => this._toggleDropdownMenu(2) }, "▼");
        this._chordSelectRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("chords") }, "Chords:"), this._chordDropdown, div({ class: "selectContainer" }, this._chordSelect));
        this._arpeggioSpeedSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.modulators.dictionary["arp speed"].maxRawVol, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeArpeggioSpeed(this._doc, oldValue, newValue), false);
        this._arpeggioSpeedRow = div({ class: "selectRow" }, span({ class: "tip", style: "margin-left:10px;", onclick: () => this._openPrompt("arpeggioSpeed") }, "Speed:"), this._arpeggioSpeedSlider.container);
        this._twoNoteArpBox = input({ type: "checkbox", style: "width: 1em; padding: 0; margin-right: 4em;" });
        this._twoNoteArpRow = div({ class: "selectRow" }, span({ class: "tip", style: "margin-left:10px;", onclick: () => this._openPrompt("twoNoteArpeggio") }, "Fast Two-Note:"), this._twoNoteArpBox);
        this._chordDropdownGroup = div({ class: "editor-controls", style: "display: none;" }, this._arpeggioSpeedRow, this._twoNoteArpRow);
        this._vibratoSelect = buildOptions(select(), Config.vibratos.map(vibrato => vibrato.name));
        this._vibratoDropdown = button({ style: "margin-left:0em; height:1.5em; width: 10px; padding: 0px; font-size: 8px;", onclick: () => this._toggleDropdownMenu(0) }, "▼");
        this._vibratoSelectRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("vibrato") }, "Vibrato:"), this._vibratoDropdown, div({ class: "selectContainer", style: "width: 61.5%;" }, this._vibratoSelect));
        this._vibratoDepthSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.modulators.dictionary["vibrato depth"].maxRawVol, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeVibratoDepth(this._doc, oldValue, newValue), false);
        this._vibratoDepthRow = div({ class: "selectRow" }, span({ class: "tip", style: "margin-left:10px;", onclick: () => this._openPrompt("vibratoDepth") }, "Depth:"), this._vibratoDepthSlider.container);
        this._vibratoSpeedSlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.modulators.dictionary["vibrato speed"].maxRawVol, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeVibratoSpeed(this._doc, oldValue, newValue), false);
        this._vibratoSpeedRow = div({ class: "selectRow" }, span({ class: "tip", style: "margin-left:10px;", onclick: () => this._openPrompt("vibratoSpeed") }, "Speed:"), this._vibratoSpeedSlider.container);
        this._vibratoDelaySlider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: Config.modulators.dictionary["vibrato delay"].maxRawVol, value: "0", step: "1" }), this._doc, (oldValue, newValue) => new ChangeVibratoDelay(this._doc, oldValue, newValue), false);
        this._vibratoDelayRow = div({ class: "selectRow" }, span({ class: "tip", style: "margin-left:10px;", onclick: () => this._openPrompt("vibratoDelay") }, "Delay:"), this._vibratoDelaySlider.container);
        this._vibratoTypeSelect = buildOptions(select(), Config.vibratoTypes.map(vibrato => vibrato.name));
        this._vibratoTypeSelectRow = div({ class: "selectRow" }, span({ class: "tip", style: "margin-left:10px;", onclick: () => this._openPrompt("vibratoType") }, "Type:"), div({ class: "selectContainer", style: "width: 61.5%;" }, this._vibratoTypeSelect));
        this._vibratoDropdownGroup = div({ class: "editor-controls", style: "display: none;" }, this._vibratoDepthRow, this._vibratoSpeedRow, this._vibratoDelayRow, this._vibratoTypeSelectRow);
        this._phaseModGroup = div({ class: "editor-controls" });
        this._feedbackTypeSelect = buildOptions(select(), Config.feedbacks.map(feedback => feedback.name));
        this._feedbackRow1 = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("feedbackType") }, "Feedback:"), div({ class: "selectContainer" }, this._feedbackTypeSelect));
        this._spectrumEditor = new SpectrumEditor(this._doc, null);
        this._spectrumRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("spectrum") }, "Spectrum:"), this._spectrumEditor.container);
        this._harmonicsEditor = new HarmonicsEditor(this._doc);
        this._harmonicsRow = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("harmonics") }, "Harmonics:"), this._harmonicsEditor.container);
        this._envelopeEditor = new EnvelopeEditor(this._doc);
        this._drumsetGroup = div({ class: "editor-controls" });
        this._modulatorGroup = div({ class: "editor-controls" });
        this._feedback6OpTypeSelect = buildOptions(select(), Config.feedbacks6Op.map(feedback => feedback.name));
        this._feedback6OpRow1 = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("feedbackType") }, "Feedback:"), div({ class: "selectContainer" }, this._feedback6OpTypeSelect));
        this._algorithmCanvasSwitch = button({ style: "margin-left:0em; height:1.5em; width: 10px; padding: 0px; font-size: 8px;", onclick: (e) => this._toggleAlgorithmCanvas(e) }, "F");
        this._customAlgorithmCanvas = new CustomAlgorythmCanvas(canvas({ width: 144, height: 144, style: "border:2px solid " + ColorConfig.uiWidgetBackground, id: "customAlgorithmCanvas" }), this._doc, (newArray, carry, mode) => new ChangeCustomAlgorythmorFeedback(this._doc, newArray, carry, mode));
        this._algorithm6OpSelect = buildOptions(select(), Config.algorithms6Op.map(algorithm => algorithm.name));
        this._algorithm6OpSelectRow = div(div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("algorithm") }, "Algorithm: "), div({ class: "selectContainer" }, this._algorithm6OpSelect)), div({ style: "height:144px; display:flex; flex-direction: row; align-items:center; justify-content:center;" }, div({ style: "display:block; width:10px; margin-right: 0.2em" }, this._algorithmCanvasSwitch), div({ style: "width:144px; height:144px;" }, this._customAlgorithmCanvas.canvas)));
        this._instrumentCopyButton = button({ style: "max-width:86px; width: 86px;", class: "copyButton" }, [
            "Copy",
            SVG.svg({ style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "-5 -21 26 26" }, [
                SVG.path({ d: "M 0 -15 L 1 -15 L 1 0 L 13 0 L 13 1 L 0 1 L 0 -15 z M 2 -1 L 2 -17 L 10 -17 L 14 -13 L 14 -1 z M 3 -2 L 13 -2 L 13 -12 L 9 -12 L 9 -16 L 3 -16 z", fill: "currentColor" }),
            ]),
        ]);
        this._instrumentPasteButton = button({ style: "max-width:86px;", class: "pasteButton" }, [
            "Paste",
            SVG.svg({ style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "0 0 26 26" }, [
                SVG.path({ d: "M 8 18 L 6 18 L 6 5 L 17 5 L 17 7 M 9 8 L 16 8 L 20 12 L 20 22 L 9 22 z", stroke: "currentColor", fill: "none" }),
                SVG.path({ d: "M 9 3 L 14 3 L 14 6 L 9 6 L 9 3 z M 16 8 L 20 12 L 16 12 L 16 8 z", fill: "currentColor", }),
            ]),
        ]);
        this._globalOscscope = new oscilascopeCanvas(canvas({ width: 144, height: 32, style: "border:2px solid " + ColorConfig.uiWidgetBackground, id: "oscilascopeAll" }), 1);
        this._customWaveDrawCanvas = new CustomChipCanvas(canvas({ width: 128, height: 52, style: "border:2px solid " + ColorConfig.uiWidgetBackground, id: "customWaveDrawCanvas" }), this._doc, (newArray) => new ChangeCustomWave(this._doc, newArray));
        this._customWavePresetDrop = buildHeaderedOptions("Load Preset", select({ style: "width: 50%; height:1.5em; text-align: center; text-align-last: center;" }), Config.chipWaves.map(wave => wave.name));
        this._customWaveZoom = button({ style: "margin-left:0.5em; height:1.5em; max-width: 20px;", onclick: () => this._openPrompt("customChipSettings") }, "+");
        this._customWaveDraw = div({ style: "height:80px; margin-top:10px; margin-bottom:5px" }, [
            div({ style: "height:54px; display:flex; justify-content:center;" }, [this._customWaveDrawCanvas.canvas]),
            div({ style: "margin-top:5px; display:flex; justify-content:center;" }, [this._customWavePresetDrop, this._customWaveZoom]),
        ]);
        this._songTitleInputBox = new InputBox(input({ style: "font-weight:bold; border:none; width: 100%; background-color:${ColorConfig.editorBackground}; color:${ColorConfig.primaryText}; text-align:center", maxlength: "30", type: "text", value: EditorConfig.versionDisplayName }), this._doc, (oldValue, newValue) => new ChangeSongTitle(this._doc, oldValue, newValue));
        this._feedbackAmplitudeSlider = new Slider(input({ type: "range", min: "0", max: Config.operatorAmplitudeMax, value: "0", step: "1", title: "Feedback Amplitude" }), this._doc, (oldValue, newValue) => new ChangeFeedbackAmplitude(this._doc, oldValue, newValue), false);
        this._feedbackRow2 = div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("feedbackVolume") }, "Fdback Vol:"), this._feedbackAmplitudeSlider.container);
        this._addEnvelopeButton = button({ type: "button", class: "add-envelope" });
        this._customInstrumentSettingsGroup = div({ class: "editor-controls" }, this._panSliderRow, this._panDropdownGroup, this._chipWaveSelectRow, this._chipNoiseSelectRow, this._customWaveDraw, this._eqFilterTypeRow, this._eqFilterRow, this._eqFilterSimpleCutRow, this._eqFilterSimplePeakRow, this._fadeInOutRow, this._algorithmSelectRow, this._algorithm6OpSelectRow, this._phaseModGroup, this._feedbackRow1, this._feedback6OpRow1, this._feedbackRow2, this._spectrumRow, this._harmonicsRow, this._drumsetGroup, this._pulseWidthRow, this._stringSustainRow, this._unisonSelectRow, div({ style: `padding: 2px 0; margin-left: 2em; display: flex; align-items: center;` }, span({ style: `flex-grow: 1; text-align: center;` }, span({ class: "tip", onclick: () => this._openPrompt("effects") }, "Effects")), div({ class: "effects-menu" }, this._effectsSelect)), this._transitionRow, this._transitionDropdownGroup, this._chordSelectRow, this._chordDropdownGroup, this._pitchShiftRow, this._detuneSliderRow, this._vibratoSelectRow, this._vibratoDropdownGroup, this._noteFilterTypeRow, this._noteFilterRow, this._noteFilterSimpleCutRow, this._noteFilterSimplePeakRow, this._distortionRow, this._aliasingRow, this._bitcrusherQuantizationRow, this._bitcrusherFreqRow, this._chorusRow, this._echoSustainRow, this._echoDelayRow, this._reverbRow, div({ style: `padding: 2px 0; margin-left: 2em; display: flex; align-items: center;` }, span({ style: `flex-grow: 1; text-align: center;` }, span({ class: "tip", onclick: () => this._openPrompt("envelopes") }, "Envelopes")), this._addEnvelopeButton), this._envelopeEditor.container);
        this._instrumentCopyGroup = div({ class: "editor-controls" }, div({ class: "selectRow" }, this._instrumentCopyButton, this._instrumentPasteButton));
        this._instrumentSettingsTextRow = div({ id: "instrumentSettingsText", style: `padding: 3px 0; max-width: 15em; text-align: center; color: ${ColorConfig.secondaryText};` }, "Instrument Settings");
        this._instrumentTypeSelectRow = div({ class: "selectRow", id: "typeSelectRow" }, span({ class: "tip", onclick: () => this._openPrompt("instrumentType") }, "Type:"), div(div({ class: "pitchSelect" }, this._pitchedPresetSelect), div({ class: "drumSelect" }, this._drumPresetSelect)));
        this._instrumentSettingsGroup = div({ class: "editor-controls" }, this._instrumentSettingsTextRow, this._instrumentsButtonRow, this._instrumentTypeSelectRow, this._instrumentVolumeSliderRow, this._customInstrumentSettingsGroup);
        this._usedPatternIndicator = SVG.path({ d: "M -6 -6 H 6 V 6 H -6 V -6 M -2 -3 L -2 -3 L -1 -4 H 1 V 4 H -1 V -1.2 L -1.2 -1 H -2 V -3 z", fill: ColorConfig.indicatorSecondary, "fill-rule": "evenodd" });
        this._usedInstrumentIndicator = SVG.path({ d: "M -6 -0.8 H -3.8 V -6 H 0.8 V 4.4 H 2.2 V -0.8 H 6 V 0.8 H 3.8 V 6 H -0.8 V -4.4 H -2.2 V 0.8 H -6 z", fill: ColorConfig.indicatorSecondary });
        this._jumpToModIndicator = SVG.svg({ style: "width: 92%; height: 1.3em; flex-shrink: 0; position: absolute;", viewBox: "0 0 200 200" }, [
            SVG.path({ d: "M90 155 l0 -45 -45 0 c-25 0 -45 -4 -45 -10 0 -5 20 -10 45 -10 l45 0 0 -45 c0 -25 5 -45 10 -45 6 0 10 20 10 45 l0 45 45 0 c25 0 45 5 45 10 0 6 -20 10 -45 10 l -45 0 0 45 c0 25 -4 45 -10 45 -5 0 -10 -20 -10 -45z" }),
            SVG.path({ d: "M42 158 c-15 -15 -16 -38 -2 -38 6 0 10 7 10 15 0 8 7 15 15 15 8 0 15 5 15 10 0 14 -23 13 -38 -2z" }),
            SVG.path({ d: "M120 160 c0 -5 7 -10 15 -10 8 0 15 -7 15 -15 0 -8 5 -15 10 -15 14 0 13 23 -2 38 -15 15 -38 16 -38 2z" }),
            SVG.path({ d: "M32 58 c3 -23 48 -40 48 -19 0 6 -7 11 -15 11 -8 0 -15 7 -15 15 0 8 -5 15 -11 15 -6 0 -9 -10 -7 -22z" }),
            SVG.path({ d: "M150 65 c0 -8 -7 -15 -15 -15 -8 0 -15 -4 -15 -10 0 -14 23 -13 38 2 15 15 16 38 2 38 -5 0 -10 -7 -10 -15z" })
        ]);
        this._promptContainer = div({ class: "promptContainer", style: "display: none;" });
        this._zoomInButton = button({ class: "zoomInButton", type: "button", title: "Zoom In" });
        this._zoomOutButton = button({ class: "zoomOutButton", type: "button", title: "Zoom Out" });
        this._patternEditorRow = div({ style: "flex: 1; height: 100%; display: flex; overflow: hidden; justify-content: center;" }, this._patternEditorPrev.container, this._patternEditor.container, this._patternEditorNext.container);
        this._patternArea = div({ class: "pattern-area" }, this._piano.container, this._patternEditorRow, this._octaveScrollBar.container, this._zoomInButton, this._zoomOutButton);
        this._trackContainer = div({ class: "trackContainer" }, this._trackEditor.container, this._loopEditor.container);
        this._trackVisibleArea = div({ style: "position: absolute; width: 100%; height: 100%; pointer-events: none;" });
        this._trackAndMuteContainer = div({ class: "trackAndMuteContainer" }, this._muteEditor.container, this._trackContainer, this._trackVisibleArea);
        this._barScrollBar = new BarScrollBar(this._doc, this._trackAndMuteContainer);
        this._trackArea = div({ class: "track-area" }, this._trackAndMuteContainer, this._barScrollBar.container);
        this._menuArea = div({ class: "menu-area" }, div({ class: "selectContainer menu file" }, this._fileMenu), div({ class: "selectContainer menu edit" }, this._editMenu), div({ class: "selectContainer menu preferences" }, this._optionsMenu));
        this._songSettingsArea = div({ class: "song-settings-area" }, div({ class: "editor-controls" }, div({ class: "editor-song-settings" }, div({ style: "margin: 3px 0; position: relative; text-align: center; color: ${ColorConfig.secondaryText};" }, div({ class: "tip", style: "flex-shrink: 0; position:absolute; left: 0; top: 0; width: 12px; height: 12px", onclick: () => this._openPrompt("usedPattern") }, SVG.svg({ style: "flex-shrink: 0; position: absolute; left: 0; top: 0; pointer-events: none;", width: "12px", height: "12px", "margin-right": "0.5em", viewBox: "-6 -6 12 12" }, this._usedPatternIndicator)), div({ class: "tip", style: "flex-shrink: 0; position: absolute; left: 14px; top: 0; width: 12px; height: 12px", onclick: () => this._openPrompt("usedInstrument") }, SVG.svg({ style: "flex-shrink: 0; position: absolute; left: 0; top: 0; pointer-events: none;", width: "12px", height: "12px", "margin-right": "1em", viewBox: "-6 -6 12 12" }, this._usedInstrumentIndicator)), "Song Settings", div({ style: "width: 100%; left: 0; top: -1px; position:absolute; overflow-x:clip;" }, this._jumpToModIndicator))), div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("scale") }, "Scale: "), div({ class: "selectContainer" }, this._scaleSelect)), div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("key") }, "Key: "), div({ class: "selectContainer" }, this._keySelect)), div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("tempo") }, "Tempo: "), span({ style: "display: flex;" }, this._tempoSlider.container, this._tempoStepper)), div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("rhythm") }, "Rhythm: "), div({ class: "selectContainer" }, this._rhythmSelect))));
        this._instrumentSettingsArea = div({ class: "instrument-settings-area" }, this._instrumentSettingsGroup, this._modulatorGroup);
        this._settingsArea = div({ class: "settings-area noSelection" }, div({ class: "version-area" }, div({ style: `text-align: center; margin: 3px 0; color: ${ColorConfig.secondaryText};` }, this._songTitleInputBox.input)), div({ class: "play-pause-area" }, this._volumeBarBox, div({ class: "playback-bar-controls" }, this._playButton, this._pauseButton, this._recordButton, this._stopButton, this._prevBarButton, this._nextBarButton), div({ class: "playback-volume-controls" }, span({ class: "volume-speaker" }), this._volumeSlider.container), div({ style: "height: 38px" }, this._globalOscscope.canvas)), this._menuArea, this._songSettingsArea, this._instrumentSettingsArea);
        this.mainLayer = div({ class: "beepboxEditor", tabIndex: "0" }, this._patternArea, this._trackArea, this._settingsArea, this._promptContainer);
        this._wasPlaying = false;
        this._currentPromptName = null;
        this._highlightedInstrumentIndex = -1;
        this._renderedInstrumentCount = 0;
        this._renderedIsPlaying = false;
        this._renderedIsRecording = false;
        this._renderedShowRecordButton = false;
        this._renderedCtrlHeld = false;
        this._ctrlHeld = false;
        this._deactivatedInstruments = false;
        this._operatorRows = [];
        this._operatorAmplitudeSliders = [];
        this._operatorFrequencySelects = [];
        this._operatorDropdowns = [];
        this._operatorWaveformSelects = [];
        this._operatorWaveformHints = [];
        this._operatorWaveformPulsewidthSliders = [];
        this._operatorDropdownRows = [];
        this._operatorDropdownGroups = [];
        this._drumsetSpectrumEditors = [];
        this._drumsetEnvelopeSelects = [];
        this._showModSliders = [];
        this._newShowModSliders = [];
        this._modSliderValues = [];
        this._hasActiveModSliders = false;
        this._openPanDropdown = false;
        this._openVibratoDropdown = false;
        this._openChordDropdown = false;
        this._openTransitionDropdown = false;
        this._openOperatorDropdowns = [];
        this.outVolumeHistoricTimer = 0;
        this.outVolumeHistoricCap = 0;
        this.lastOutVolumeCap = 0;
        this.refocusStage = () => {
            this.mainLayer.focus({ preventScroll: true });
        };
        this._onFocusIn = (event) => {
            if (this._doc.synth.recording && event.target != this.mainLayer && event.target != this._stopButton && event.target != this._volumeSlider.input) {
                this.refocusStage();
            }
        };
        this._refocusStageNotEditing = () => {
            if (!this._patternEditor.editingModLabel)
                this.mainLayer.focus({ preventScroll: true });
        };
        this.whenUpdated = () => {
            const prefs = this._doc.prefs;
            this._muteEditor.container.style.display = prefs.enableChannelMuting ? "" : "none";
            const trackBounds = this._trackVisibleArea.getBoundingClientRect();
            this._doc.trackVisibleBars = Math.floor((trackBounds.right - trackBounds.left - (prefs.enableChannelMuting ? 32 : 0)) / this._doc.getBarWidth());
            this._doc.trackVisibleChannels = Math.floor((trackBounds.bottom - trackBounds.top - 30) / this._doc.getChannelHeight());
            for (let i = this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount; i < this._doc.song.channels.length; i++) {
                const channel = this._doc.song.channels[i];
                for (let j = 0; j < channel.instruments.length; j++) {
                    this._doc.synth.determineInvalidModulators(channel.instruments[j]);
                }
            }
            this._barScrollBar.render();
            this._muteEditor.render();
            this._trackEditor.render();
            if (document.activeElement != this._patternEditor.modDragValueLabel && this._patternEditor.editingModLabel) {
                this._patternEditor.stopEditingModLabel(false);
            }
            this._piano.container.style.display = prefs.showLetters ? "" : "none";
            this._octaveScrollBar.container.style.display = prefs.showScrollBar ? "" : "none";
            this._barScrollBar.container.style.display = this._doc.song.barCount > this._doc.trackVisibleBars ? "" : "none";
            this._volumeBarBox.style.display = this._doc.prefs.displayVolumeBar ? "" : "none";
            if (this._doc.getFullScreen()) {
                const semitoneHeight = this._patternEditorRow.clientHeight / this._doc.getVisiblePitchCount();
                const targetBeatWidth = semitoneHeight * 5;
                const minBeatWidth = this._patternEditorRow.clientWidth / (this._doc.song.beatsPerBar * 3);
                const maxBeatWidth = this._patternEditorRow.clientWidth / (this._doc.song.beatsPerBar + 2);
                const beatWidth = Math.max(minBeatWidth, Math.min(maxBeatWidth, targetBeatWidth));
                const patternEditorWidth = beatWidth * this._doc.song.beatsPerBar;
                this._patternEditorPrev.container.style.width = patternEditorWidth + "px";
                this._patternEditor.container.style.width = patternEditorWidth + "px";
                this._patternEditorNext.container.style.width = patternEditorWidth + "px";
                this._patternEditorPrev.container.style.flexShrink = "0";
                this._patternEditor.container.style.flexShrink = "0";
                this._patternEditorNext.container.style.flexShrink = "0";
                this._patternEditorPrev.container.style.display = "";
                this._patternEditorNext.container.style.display = "";
                this._patternEditorPrev.render();
                this._patternEditorNext.render();
                this._zoomInButton.style.display = (this._doc.channel < this._doc.song.pitchChannelCount) ? "" : "none";
                this._zoomOutButton.style.display = (this._doc.channel < this._doc.song.pitchChannelCount) ? "" : "none";
                this._zoomInButton.style.right = prefs.showScrollBar ? "24px" : "4px";
                this._zoomOutButton.style.right = prefs.showScrollBar ? "24px" : "4px";
            }
            else {
                this._patternEditor.container.style.width = "";
                this._patternEditor.container.style.flexShrink = "";
                this._patternEditorPrev.container.style.display = "none";
                this._patternEditorNext.container.style.display = "none";
                this._zoomInButton.style.display = "none";
                this._zoomOutButton.style.display = "none";
            }
            this._patternEditor.render();
            const optionCommands = [
                (prefs.autoPlay ? "✓ " : "　") + "Auto Play on Load",
                (prefs.autoFollow ? "✓ " : "　") + "Keep Current Pattern Selected",
                (prefs.enableNotePreview ? "✓ " : "　") + "Hear Preview of Added Notes",
                (prefs.showLetters ? "✓ " : "　") + "Show Piano Keys",
                (prefs.showFifth ? "✓ " : "　") + 'Highlight "Fifth" of Song Key',
                (prefs.notesOutsideScale ? "✓ " : "　") + "Allow Adding Notes Not in Scale",
                (prefs.defaultScale == this._doc.song.scale ? "✓ " : "　") + "Use Current Scale as Default",
                (prefs.showChannels ? "✓ " : "　") + "Show Notes From All Channels",
                (prefs.showScrollBar ? "✓ " : "　") + "Show Octave Scroll Bar",
                (prefs.alwaysFineNoteVol ? "✓ " : "") + "Always Fine Note Volume",
                (prefs.enableChannelMuting ? "✓ " : "　") + "Enable Channel Muting",
                (prefs.displayBrowserUrl ? "✓ " : "　") + "Display Song Data in URL",
                (prefs.displayVolumeBar ? "✓ " : "　") + "Show Playback Volume",
                "　Set Layout...",
                "　Set Theme...",
                "　Set Up Note Recording...",
            ];
            for (let i = 0; i < optionCommands.length; i++) {
                const option = this._optionsMenu.children[i + 1];
                if (option.textContent != optionCommands[i])
                    option.textContent = optionCommands[i];
            }
            const channel = this._doc.song.channels[this._doc.channel];
            const instrumentIndex = this._doc.getCurrentInstrument();
            const instrument = channel.instruments[instrumentIndex];
            const wasActive = this.mainLayer.contains(document.activeElement);
            const activeElement = document.activeElement;
            const colors = ColorConfig.getChannelColor(this._doc.song, this._doc.channel);
            for (let i = this._effectsSelect.childElementCount - 1; i < Config.effectOrder.length; i++) {
                this._effectsSelect.appendChild(option({ value: i }));
            }
            this._effectsSelect.selectedIndex = -1;
            for (let i = 0; i < Config.effectOrder.length; i++) {
                let effectFlag = Config.effectOrder[i];
                const selected = ((instrument.effects & (1 << effectFlag)) != 0);
                const label = (selected ? "✓ " : "　") + Config.effectNames[effectFlag];
                const option = this._effectsSelect.children[i + 1];
                if (option.textContent != label)
                    option.textContent = label;
            }
            setSelectedValue(this._scaleSelect, this._doc.song.scale);
            this._scaleSelect.title = Config.scales[this._doc.song.scale].realName;
            setSelectedValue(this._keySelect, Config.keys.length - 1 - this._doc.song.key);
            this._tempoSlider.updateValue(Math.max(0, Math.round(this._doc.song.tempo)));
            this._tempoStepper.value = Math.round(this._doc.song.tempo).toString();
            this._songTitleInputBox.updateValue(this._doc.song.title);
            this._eqFilterTypeRow.style.setProperty("--text-color-lit", colors.primaryNote);
            this._eqFilterTypeRow.style.setProperty("--text-color-dim", colors.secondaryNote);
            this._eqFilterTypeRow.style.setProperty("--background-color-lit", colors.primaryChannel);
            this._eqFilterTypeRow.style.setProperty("--background-color-dim", colors.secondaryChannel);
            if (instrument.eqFilterType) {
                this._eqFilterSimpleButton.classList.remove("deactivated");
                this._eqFilterAdvancedButton.classList.add("deactivated");
                this._eqFilterRow.style.display = "none";
                this._eqFilterSimpleCutRow.style.display = "";
                this._eqFilterSimplePeakRow.style.display = "";
            }
            else {
                this._eqFilterSimpleButton.classList.add("deactivated");
                this._eqFilterAdvancedButton.classList.remove("deactivated");
                this._eqFilterRow.style.display = "";
                this._eqFilterSimpleCutRow.style.display = "none";
                this._eqFilterSimplePeakRow.style.display = "none";
            }
            setSelectedValue(this._rhythmSelect, this._doc.song.rhythm);
            if (!this._doc.song.getChannelIsMod(this._doc.channel)) {
                this._customInstrumentSettingsGroup.style.display = "";
                this._panSliderRow.style.display = "";
                this._panDropdownGroup.style.display = (this._openPanDropdown ? "" : "none");
                this._detuneSliderRow.style.display = "";
                this._instrumentVolumeSliderRow.style.display = "";
                this._instrumentTypeSelectRow.style.setProperty("display", "");
                this._instrumentSettingsGroup.appendChild(this._instrumentCopyGroup);
                this._instrumentSettingsGroup.insertBefore(this._instrumentsButtonRow, this._instrumentSettingsGroup.firstChild);
                this._instrumentSettingsGroup.insertBefore(this._instrumentSettingsTextRow, this._instrumentSettingsGroup.firstChild);
                if (this._doc.song.channels[this._doc.channel].name == "") {
                    this._instrumentSettingsTextRow.textContent = "Instrument Settings";
                }
                else {
                    this._instrumentSettingsTextRow.textContent = this._doc.song.channels[this._doc.channel].name;
                }
                this._modulatorGroup.style.display = "none";
                this._usageCheck(this._doc.channel, instrumentIndex);
                if (this._doc.song.getChannelIsNoise(this._doc.channel)) {
                    this._pitchedPresetSelect.style.display = "none";
                    this._drumPresetSelect.style.display = "";
                    $("#pitchPresetSelect").parent().hide();
                    $("#drumPresetSelect").parent().show();
                    setSelectedValue(this._drumPresetSelect, instrument.preset);
                }
                else {
                    this._pitchedPresetSelect.style.display = "";
                    this._drumPresetSelect.style.display = "none";
                    $("#pitchPresetSelect").parent().show();
                    $("#drumPresetSelect").parent().hide();
                    setSelectedValue(this._pitchedPresetSelect, instrument.preset);
                }
                if (instrument.type == 2) {
                    this._chipWaveSelectRow.style.display = "none";
                    this._chipNoiseSelectRow.style.display = "";
                    setSelectedValue(this._chipNoiseSelect, instrument.chipNoise);
                }
                else {
                    this._chipNoiseSelectRow.style.display = "none";
                }
                if (instrument.type == 3) {
                    this._chipWaveSelectRow.style.display = "none";
                    this._spectrumRow.style.display = "";
                    this._spectrumEditor.render();
                }
                else {
                    this._spectrumRow.style.display = "none";
                }
                if (instrument.type == 5 || instrument.type == 7) {
                    this._chipWaveSelectRow.style.display = "none";
                    this._harmonicsRow.style.display = "";
                    this._harmonicsEditor.render();
                }
                else {
                    this._harmonicsRow.style.display = "none";
                }
                if (instrument.type == 7) {
                    this._chipWaveSelectRow.style.display = "none";
                    this._stringSustainRow.style.display = "";
                    this._stringSustainSlider.updateValue(instrument.stringSustain);
                }
                else {
                    this._stringSustainRow.style.display = "none";
                }
                if (instrument.type == 4) {
                    this._drumsetGroup.style.display = "";
                    this._chipWaveSelectRow.style.display = "none";
                    this._fadeInOutRow.style.display = "none";
                    for (let i = 0; i < Config.drumCount; i++) {
                        setSelectedValue(this._drumsetEnvelopeSelects[i], instrument.drumsetEnvelopes[i]);
                        this._drumsetSpectrumEditors[i].render();
                    }
                }
                else {
                    this._drumsetGroup.style.display = "none";
                    this._fadeInOutRow.style.display = "";
                    this._fadeInOutEditor.render();
                }
                if (instrument.type == 0) {
                    this._chipWaveSelectRow.style.display = "";
                    setSelectedValue(this._chipWaveSelect, instrument.chipWave);
                }
                if (instrument.type == 8) {
                    this._customWaveDraw.style.display = "";
                    this._chipWaveSelectRow.style.display = "none";
                }
                else {
                    this._customWaveDraw.style.display = "none";
                }
                if (instrument.type == 6) {
                    this._chipWaveSelectRow.style.display = "none";
                    this._pulseWidthRow.style.display = "";
                    this._pulseWidthSlider.input.title = prettyNumber(instrument.pulseWidth) + "%";
                    this._pulseWidthSlider.updateValue(instrument.pulseWidth);
                }
                else {
                    this._pulseWidthRow.style.display = "none";
                }
                if (instrument.type == 1 || instrument.type == 10) {
                    this._phaseModGroup.style.display = "";
                    this._feedbackRow2.style.display = "";
                    this._chipWaveSelectRow.style.display = "none";
                    setSelectedValue(this._algorithmSelect, instrument.algorithm);
                    setSelectedValue(this._feedbackTypeSelect, instrument.feedbackType);
                    this._feedbackAmplitudeSlider.updateValue(instrument.feedbackAmplitude);
                    for (let i = 0; i < Config.operatorCount + (instrument.type == 10 ? 2 : 0); i++) {
                        const isCarrier = instrument.type == 1 ? (i < Config.algorithms[instrument.algorithm].carrierCount) : (i < instrument.customAlgorithm.carrierCount);
                        this._operatorRows[i].style.color = isCarrier ? ColorConfig.primaryText : "";
                        setSelectedValue(this._operatorFrequencySelects[i], instrument.operators[i].frequency);
                        this._operatorAmplitudeSliders[i].updateValue(instrument.operators[i].amplitude);
                        setSelectedValue(this._operatorWaveformSelects[i], instrument.operators[i].waveform);
                        this._operatorWaveformPulsewidthSliders[i].updateValue(instrument.operators[i].pulseWidth);
                        this._operatorWaveformPulsewidthSliders[i].input.title = "" + Config.pwmOperatorWaves[instrument.operators[i].pulseWidth].name;
                        this._operatorDropdownGroups[i].style.color = isCarrier ? ColorConfig.primaryText : "";
                        const operatorName = (isCarrier ? "Voice " : "Modulator ") + (i + 1);
                        this._operatorFrequencySelects[i].title = operatorName + " Frequency";
                        this._operatorAmplitudeSliders[i].input.title = operatorName + (isCarrier ? " Volume" : " Amplitude");
                        this._operatorDropdownGroups[i].style.display = (this._openOperatorDropdowns[i] ? "" : "none");
                        if (instrument.operators[i].waveform == 2) {
                            this._operatorWaveformPulsewidthSliders[i].container.style.display = "";
                            this._operatorWaveformHints[i].style.display = "none";
                        }
                        else {
                            this._operatorWaveformPulsewidthSliders[i].container.style.display = "none";
                            this._operatorWaveformHints[i].style.display = "";
                        }
                    }
                    if (instrument.type == 10) {
                        setSelectedValue(this._algorithm6OpSelect, instrument.algorithm6Op);
                        setSelectedValue(this._feedback6OpTypeSelect, instrument.feedbackType6Op);
                        this._customAlgorithmCanvas.redrawCanvas();
                        this._algorithm6OpSelectRow.style.display = "";
                        this._feedback6OpRow1.style.display = "";
                        this._operatorRows[4].style.display = "";
                        this._operatorRows[5].style.display = "";
                        this._operatorDropdownGroups[4].style.display = (this._openOperatorDropdowns[4] ? "" : "none");
                        this._operatorDropdownGroups[5].style.display = (this._openOperatorDropdowns[5] ? "" : "none");
                        this._algorithmSelectRow.style.display = "none";
                        this._feedbackRow1.style.display = "none";
                    }
                    else {
                        this._algorithm6OpSelectRow.style.display = "none";
                        this._feedback6OpRow1.style.display = "none";
                        this._operatorRows[4].style.display = "none";
                        this._operatorRows[5].style.display = "none";
                        this._operatorDropdownGroups[4].style.display = "none";
                        this._operatorDropdownGroups[5].style.display = "none";
                        this._feedbackRow1.style.display = "";
                        this._algorithmSelectRow.style.display = "";
                    }
                }
                else {
                    this._algorithm6OpSelectRow.style.display = "none";
                    this._feedback6OpRow1.style.display = "none";
                    this._algorithmSelectRow.style.display = "none";
                    this._phaseModGroup.style.display = "none";
                    this._feedbackRow1.style.display = "none";
                    this._feedbackRow2.style.display = "none";
                }
                this._pulseWidthSlider.input.title = prettyNumber(instrument.pulseWidth) + "%";
                if (effectsIncludeTransition(instrument.effects)) {
                    this._transitionRow.style.display = "";
                    if (this._openTransitionDropdown)
                        this._transitionDropdownGroup.style.display = "";
                    setSelectedValue(this._transitionSelect, instrument.transition);
                }
                else {
                    this._transitionDropdownGroup.style.display = "none";
                    this._transitionRow.style.display = "none";
                }
                if (effectsIncludeChord(instrument.effects)) {
                    this._chordSelectRow.style.display = "";
                    this._chordDropdown.style.display = (instrument.chord == Config.chords.dictionary["arpeggio"].index) ? "" : "none";
                    this._chordDropdownGroup.style.display = (instrument.chord == Config.chords.dictionary["arpeggio"].index && this._openChordDropdown) ? "" : "none";
                    setSelectedValue(this._chordSelect, instrument.chord);
                }
                else {
                    this._chordSelectRow.style.display = "none";
                    this._chordDropdown.style.display = "none";
                    this._chordDropdownGroup.style.display = "none";
                }
                if (effectsIncludePitchShift(instrument.effects)) {
                    this._pitchShiftRow.style.display = "";
                    this._pitchShiftSlider.updateValue(instrument.pitchShift);
                    this._pitchShiftSlider.input.title = (instrument.pitchShift - Config.pitchShiftCenter) + " semitone(s)";
                    for (const marker of this._pitchShiftFifthMarkers) {
                        marker.style.display = prefs.showFifth ? "" : "none";
                    }
                }
                else {
                    this._pitchShiftRow.style.display = "none";
                }
                if (effectsIncludeDetune(instrument.effects)) {
                    this._detuneSliderRow.style.display = "";
                    this._detuneSlider.updateValue(instrument.detune - Config.detuneCenter);
                    this._detuneSlider.input.title = (Synth.detuneToCents(instrument.detune)) + " cent(s)";
                }
                else {
                    this._detuneSliderRow.style.display = "none";
                }
                if (effectsIncludeVibrato(instrument.effects)) {
                    this._vibratoSelectRow.style.display = "";
                    if (this._openVibratoDropdown)
                        this._vibratoDropdownGroup.style.display = "";
                    setSelectedValue(this._vibratoSelect, instrument.vibrato);
                }
                else {
                    this._vibratoDropdownGroup.style.display = "none";
                    this._vibratoSelectRow.style.display = "none";
                }
                if (effectsIncludeNoteFilter(instrument.effects)) {
                    this._noteFilterTypeRow.style.setProperty("--text-color-lit", colors.primaryNote);
                    this._noteFilterTypeRow.style.setProperty("--text-color-dim", colors.secondaryNote);
                    this._noteFilterTypeRow.style.setProperty("--background-color-lit", colors.primaryChannel);
                    this._noteFilterTypeRow.style.setProperty("--background-color-dim", colors.secondaryChannel);
                    this._noteFilterTypeRow.style.display = "";
                    this._noteFilterEditor.render();
                    if (instrument.noteFilterType) {
                        this._noteFilterSimpleButton.classList.remove("deactivated");
                        this._noteFilterAdvancedButton.classList.add("deactivated");
                        this._noteFilterRow.style.display = "none";
                        this._noteFilterSimpleCutRow.style.display = "";
                        this._noteFilterSimplePeakRow.style.display = "";
                    }
                    else {
                        this._noteFilterSimpleButton.classList.add("deactivated");
                        this._noteFilterAdvancedButton.classList.remove("deactivated");
                        this._noteFilterRow.style.display = "";
                        this._noteFilterSimpleCutRow.style.display = "none";
                        this._noteFilterSimplePeakRow.style.display = "none";
                    }
                }
                else {
                    this._noteFilterRow.style.display = "none";
                    this._noteFilterSimpleCutRow.style.display = "none";
                    this._noteFilterSimplePeakRow.style.display = "none";
                    this._noteFilterTypeRow.style.display = "none";
                }
                if (effectsIncludeDistortion(instrument.effects)) {
                    this._distortionRow.style.display = "";
                    if (instrument.type == 0 || instrument.type == 8 || instrument.type == 6)
                        this._aliasingRow.style.display = "";
                    else
                        this._aliasingRow.style.display = "none";
                    this._distortionSlider.updateValue(instrument.distortion);
                }
                else {
                    this._distortionRow.style.display = "none";
                    this._aliasingRow.style.display = "none";
                }
                if (effectsIncludeBitcrusher(instrument.effects)) {
                    this._bitcrusherQuantizationRow.style.display = "";
                    this._bitcrusherFreqRow.style.display = "";
                    this._bitcrusherQuantizationSlider.updateValue(instrument.bitcrusherQuantization);
                    this._bitcrusherFreqSlider.updateValue(instrument.bitcrusherFreq);
                }
                else {
                    this._bitcrusherQuantizationRow.style.display = "none";
                    this._bitcrusherFreqRow.style.display = "none";
                }
                if (effectsIncludePanning(instrument.effects)) {
                    this._panSliderRow.style.display = "";
                    if (this._openPanDropdown)
                        this._panDropdownGroup.style.display = "";
                    this._panSlider.updateValue(instrument.pan);
                }
                else {
                    this._panSliderRow.style.display = "none";
                    this._panDropdownGroup.style.display = "none";
                }
                if (effectsIncludeChorus(instrument.effects)) {
                    this._chorusRow.style.display = "";
                    this._chorusSlider.updateValue(instrument.chorus);
                }
                else {
                    this._chorusRow.style.display = "none";
                }
                if (effectsIncludeEcho(instrument.effects)) {
                    this._echoSustainRow.style.display = "";
                    this._echoSustainSlider.updateValue(instrument.echoSustain);
                    this._echoDelayRow.style.display = "";
                    this._echoDelaySlider.updateValue(instrument.echoDelay);
                    this._echoDelaySlider.input.title = (Math.round((instrument.echoDelay + 1) * Config.echoDelayStepTicks / (Config.ticksPerPart * Config.partsPerBeat) * 1000) / 1000) + " beat(s)";
                }
                else {
                    this._echoSustainRow.style.display = "none";
                    this._echoDelayRow.style.display = "none";
                }
                if (effectsIncludeReverb(instrument.effects)) {
                    this._reverbRow.style.display = "";
                    this._reverbSlider.updateValue(instrument.reverb);
                }
                else {
                    this._reverbRow.style.display = "none";
                }
                if (instrument.type == 0 || instrument.type == 8 || instrument.type == 5 || instrument.type == 7) {
                    this._unisonSelectRow.style.display = "";
                    setSelectedValue(this._unisonSelect, instrument.unison);
                }
                else {
                    this._unisonSelectRow.style.display = "none";
                }
                this._envelopeEditor.render();
                for (let chordIndex = 0; chordIndex < Config.chords.length; chordIndex++) {
                    let hidden = (!Config.instrumentTypeHasSpecialInterval[instrument.type] && Config.chords[chordIndex].customInterval);
                    const option = this._chordSelect.children[chordIndex];
                    if (hidden) {
                        if (!option.hasAttribute("hidden")) {
                            option.setAttribute("hidden", "");
                        }
                    }
                    else {
                        option.removeAttribute("hidden");
                    }
                }
                this._instrumentSettingsGroup.style.color = ColorConfig.getChannelColor(this._doc.song, this._doc.channel).primaryNote;
                setSelectedValue(this._transitionSelect, instrument.transition);
                setSelectedValue(this._vibratoSelect, instrument.vibrato);
                setSelectedValue(this._vibratoTypeSelect, instrument.vibratoType);
                setSelectedValue(this._chordSelect, instrument.chord);
                this._panSliderInputBox.value = instrument.pan + "";
                this._detuneSliderInputBox.value = (instrument.detune - Config.detuneCenter) + "";
                this._instrumentVolumeSlider.updateValue(instrument.volume);
                this._instrumentVolumeSliderInputBox.value = "" + (instrument.volume);
                this._vibratoDepthSlider.updateValue(Math.round(instrument.vibratoDepth * 25));
                this._vibratoDelaySlider.updateValue(Math.round(instrument.vibratoDelay));
                this._vibratoSpeedSlider.updateValue(instrument.vibratoSpeed);
                setSelectedValue(this._vibratoTypeSelect, instrument.vibratoType);
                this._arpeggioSpeedSlider.updateValue(instrument.arpeggioSpeed);
                this._panDelaySlider.updateValue(instrument.panDelay);
                this._vibratoDelaySlider.input.title = "" + Math.round(instrument.vibratoDelay);
                this._vibratoDepthSlider.input.title = "" + instrument.vibratoDepth;
                this._vibratoSpeedSlider.input.title = "" + instrument.vibratoSpeed;
                this._panDelaySlider.input.title = "" + instrument.panDelay;
                this._arpeggioSpeedSlider.input.title = "x" + prettyNumber(Config.arpSpeedScale[instrument.arpeggioSpeed]);
                this._eqFilterSimpleCutSlider.updateValue(instrument.eqFilterSimpleCut);
                this._eqFilterSimplePeakSlider.updateValue(instrument.eqFilterSimplePeak);
                this._noteFilterSimpleCutSlider.updateValue(instrument.noteFilterSimpleCut);
                this._noteFilterSimplePeakSlider.updateValue(instrument.noteFilterSimplePeak);
                if (instrument.type == 8) {
                    this._customWaveDrawCanvas.redrawCanvas();
                    if (this.prompt instanceof CustomChipPrompt) {
                        this.prompt.customChipCanvas.render();
                    }
                }
                this._renderInstrumentBar(channel, instrumentIndex, colors);
            }
            else {
                this._usageCheck(this._doc.channel, instrumentIndex);
                this._pitchedPresetSelect.style.display = "none";
                this._drumPresetSelect.style.display = "none";
                $("#pitchPresetSelect").parent().hide();
                $("#drumPresetSelect").parent().hide();
                this._modulatorGroup.appendChild(this._instrumentCopyGroup);
                this._modulatorGroup.insertBefore(this._instrumentsButtonRow, this._modulatorGroup.firstChild);
                this._modulatorGroup.insertBefore(this._instrumentSettingsTextRow, this._modulatorGroup.firstChild);
                if (this._doc.song.channels[this._doc.channel].name == "") {
                    this._instrumentSettingsTextRow.textContent = "Modulator Settings";
                }
                else {
                    this._instrumentSettingsTextRow.textContent = this._doc.song.channels[this._doc.channel].name;
                }
                this._chipNoiseSelectRow.style.display = "none";
                this._chipWaveSelectRow.style.display = "none";
                this._spectrumRow.style.display = "none";
                this._harmonicsRow.style.display = "none";
                this._transitionRow.style.display = "none";
                this._chordSelectRow.style.display = "none";
                this._chordDropdownGroup.style.display = "none";
                this._drumsetGroup.style.display = "none";
                this._customWaveDraw.style.display = "none";
                this._algorithmSelectRow.style.display = "none";
                this._phaseModGroup.style.display = "none";
                this._feedbackRow1.style.display = "none";
                this._feedbackRow2.style.display = "none";
                this._pulseWidthRow.style.display = "none";
                this._vibratoSelectRow.style.display = "none";
                this._vibratoDropdownGroup.style.display = "none";
                this._detuneSliderRow.style.display = "none";
                this._panSliderRow.style.display = "none";
                this._panDropdownGroup.style.display = "none";
                this._modulatorGroup.style.display = "";
                this._modulatorGroup.style.color = ColorConfig.getChannelColor(this._doc.song, this._doc.channel).primaryNote;
                for (let mod = 0; mod < Config.modCount; mod++) {
                    let instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
                    let modChannel = Math.max(0, instrument.modChannels[mod]);
                    let modInstrument = instrument.modInstruments[mod];
                    if (modInstrument >= this._doc.song.channels[modChannel].instruments.length + 2 || (modInstrument > 0 && this._doc.song.channels[modChannel].instruments.length <= 1)) {
                        modInstrument = 0;
                        instrument.modInstruments[mod] = 0;
                        instrument.modulators[mod] = 0;
                    }
                    if (modChannel >= this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
                        instrument.modInstruments[mod] = 0;
                        instrument.modulators[mod] = 0;
                    }
                    if (this._doc.recalcChannelNames || (this._modChannelBoxes[mod].children.length != 2 + this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount)) {
                        while (this._modChannelBoxes[mod].firstChild)
                            this._modChannelBoxes[mod].remove(0);
                        const channelList = [];
                        channelList.push("none");
                        channelList.push("song");
                        for (let i = 0; i < this._doc.song.pitchChannelCount; i++) {
                            if (this._doc.song.channels[i].name == "") {
                                channelList.push("pitch " + (i + 1));
                            }
                            else {
                                channelList.push(this._doc.song.channels[i].name);
                            }
                        }
                        for (let i = 0; i < this._doc.song.noiseChannelCount; i++) {
                            if (this._doc.song.channels[i + this._doc.song.pitchChannelCount].name == "") {
                                channelList.push("noise " + (i + 1));
                            }
                            else {
                                channelList.push(this._doc.song.channels[i + this._doc.song.pitchChannelCount].name);
                            }
                        }
                        buildOptions(this._modChannelBoxes[mod], channelList);
                    }
                    this._modChannelBoxes[mod].selectedIndex = instrument.modChannels[mod] + 2;
                    let channel = this._doc.song.channels[modChannel];
                    if (this._modInstrumentBoxes[mod].children.length != channel.instruments.length + 2) {
                        while (this._modInstrumentBoxes[mod].firstChild)
                            this._modInstrumentBoxes[mod].remove(0);
                        const instrumentList = [];
                        for (let i = 0; i < channel.instruments.length; i++) {
                            instrumentList.push("" + i + 1);
                        }
                        instrumentList.push("all");
                        instrumentList.push("active");
                        buildOptions(this._modInstrumentBoxes[mod], instrumentList);
                    }
                    if (channel.bars[this._doc.bar] > 0) {
                        let usedInstruments = channel.patterns[channel.bars[this._doc.bar] - 1].instruments;
                        for (let i = 0; i < channel.instruments.length; i++) {
                            if (usedInstruments.includes(i)) {
                                this._modInstrumentBoxes[mod].options[i].label = "🢒" + (i + 1);
                            }
                            else {
                                this._modInstrumentBoxes[mod].options[i].label = "" + (i + 1);
                            }
                        }
                    }
                    else {
                        for (let i = 0; i < channel.instruments.length; i++) {
                            this._modInstrumentBoxes[mod].options[i].label = "" + (i + 1);
                        }
                    }
                    this._modInstrumentBoxes[mod].selectedIndex = instrument.modInstruments[mod];
                    if (instrument.modChannels[mod] != -2) {
                        while (this._modSetBoxes[mod].firstChild)
                            this._modSetBoxes[mod].remove(0);
                        const settingList = [];
                        const unusedSettingList = [];
                        settingList.push("none");
                        if (instrument.modChannels[mod] == -1) {
                            settingList.push("song volume");
                            settingList.push("tempo");
                            settingList.push("song reverb");
                            settingList.push("next bar");
                            settingList.push("song detune");
                        }
                        else {
                            settingList.push("note volume");
                            settingList.push("mix volume");
                            let tgtInstrumentTypes = [];
                            let anyInstrumentAdvancedEQ = false, anyInstrumentSimpleEQ = false, anyInstrumentAdvancedNote = false, anyInstrumentSimpleNote = false, anyInstrumentArps = false, anyInstrumentPitchShifts = false, anyInstrumentDetunes = false, anyInstrumentVibratos = false, anyInstrumentNoteFilters = false, anyInstrumentDistorts = false, anyInstrumentBitcrushes = false, anyInstrumentPans = false, anyInstrumentChorus = false, anyInstrumentEchoes = false, anyInstrumentReverbs = false;
                            let allInstrumentPitchShifts = true, allInstrumentNoteFilters = true, allInstrumentDetunes = true, allInstrumentVibratos = true, allInstrumentDistorts = true, allInstrumentBitcrushes = true, allInstrumentPans = true, allInstrumentChorus = true, allInstrumentEchoes = true, allInstrumentReverbs = true;
                            let instrumentCandidates = [];
                            if (modInstrument >= channel.instruments.length) {
                                for (let i = 0; i < channel.instruments.length; i++) {
                                    instrumentCandidates.push(i);
                                }
                            }
                            else {
                                instrumentCandidates.push(modInstrument);
                            }
                            for (let i = 0; i < instrumentCandidates.length; i++) {
                                let instrumentIndex = instrumentCandidates[i];
                                if (!tgtInstrumentTypes.includes(channel.instruments[instrumentIndex].type))
                                    tgtInstrumentTypes.push(channel.instruments[instrumentIndex].type);
                                if (channel.instruments[instrumentIndex].eqFilterType)
                                    anyInstrumentSimpleEQ = true;
                                else
                                    anyInstrumentAdvancedEQ = true;
                                if (effectsIncludeChord(channel.instruments[instrumentIndex].effects) && channel.instruments[instrumentIndex].getChord().arpeggiates) {
                                    anyInstrumentArps = true;
                                }
                                if (effectsIncludePitchShift(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentPitchShifts = true;
                                }
                                if (effectsIncludeDetune(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentDetunes = true;
                                }
                                else {
                                    allInstrumentDetunes = false;
                                }
                                if (effectsIncludeVibrato(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentVibratos = true;
                                }
                                else {
                                    allInstrumentVibratos = false;
                                }
                                if (effectsIncludeNoteFilter(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentNoteFilters = true;
                                    if (channel.instruments[instrumentIndex].noteFilterType)
                                        anyInstrumentSimpleNote = true;
                                    else
                                        anyInstrumentAdvancedNote = true;
                                }
                                else {
                                    allInstrumentNoteFilters = false;
                                }
                                if (effectsIncludeDistortion(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentDistorts = true;
                                }
                                else {
                                    allInstrumentDistorts = false;
                                }
                                if (effectsIncludeBitcrusher(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentBitcrushes = true;
                                }
                                else {
                                    allInstrumentBitcrushes = false;
                                }
                                if (effectsIncludePanning(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentPans = true;
                                }
                                else {
                                    allInstrumentPans = false;
                                }
                                if (effectsIncludeChorus(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentChorus = true;
                                }
                                else {
                                    allInstrumentChorus = false;
                                }
                                if (effectsIncludeEcho(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentEchoes = true;
                                }
                                else {
                                    allInstrumentEchoes = false;
                                }
                                if (effectsIncludeReverb(channel.instruments[instrumentIndex].effects)) {
                                    anyInstrumentReverbs = true;
                                }
                                else {
                                    allInstrumentReverbs = false;
                                }
                            }
                            if (anyInstrumentAdvancedEQ) {
                                settingList.push("eq filter");
                            }
                            if (anyInstrumentSimpleEQ) {
                                settingList.push("eq filt cut");
                                settingList.push("eq filt peak");
                            }
                            if (tgtInstrumentTypes.includes(1)) {
                                settingList.push("fm slider 1");
                                settingList.push("fm slider 2");
                                settingList.push("fm slider 3");
                                settingList.push("fm slider 4");
                                settingList.push("fm feedback");
                            }
                            if (tgtInstrumentTypes.includes(10)) {
                                settingList.push("fm slider 1");
                                settingList.push("fm slider 2");
                                settingList.push("fm slider 3");
                                settingList.push("fm slider 4");
                                settingList.push("fm slider 5");
                                settingList.push("fm slider 6");
                                settingList.push("fm feedback");
                            }
                            if (tgtInstrumentTypes.includes(6)) {
                                settingList.push("pulse width");
                            }
                            if (tgtInstrumentTypes.includes(7)) {
                                settingList.push("sustain");
                            }
                            if (anyInstrumentArps) {
                                settingList.push("arp speed");
                                settingList.push("reset arp");
                            }
                            if (anyInstrumentPitchShifts) {
                                settingList.push("pitch shift");
                            }
                            if (!allInstrumentPitchShifts) {
                                unusedSettingList.push("+ pitch shift");
                            }
                            if (anyInstrumentDetunes) {
                                settingList.push("detune");
                            }
                            if (!allInstrumentDetunes) {
                                unusedSettingList.push("+ detune");
                            }
                            if (anyInstrumentVibratos) {
                                settingList.push("vibrato depth");
                                settingList.push("vibrato speed");
                                settingList.push("vibrato delay");
                            }
                            if (!allInstrumentVibratos) {
                                unusedSettingList.push("+ vibrato depth");
                                unusedSettingList.push("+ vibrato speed");
                                unusedSettingList.push("+ vibrato delay");
                            }
                            if (anyInstrumentNoteFilters) {
                                if (anyInstrumentAdvancedNote) {
                                    settingList.push("note filter");
                                }
                                if (anyInstrumentSimpleNote) {
                                    settingList.push("note filt cut");
                                    settingList.push("note filt peak");
                                }
                            }
                            if (!allInstrumentNoteFilters) {
                                unusedSettingList.push("+ note filter");
                            }
                            if (anyInstrumentDistorts) {
                                settingList.push("distortion");
                            }
                            if (!allInstrumentDistorts) {
                                unusedSettingList.push("+ distortion");
                            }
                            if (anyInstrumentBitcrushes) {
                                settingList.push("bit crush");
                                settingList.push("freq crush");
                            }
                            if (!allInstrumentBitcrushes) {
                                unusedSettingList.push("+ bit crush");
                                unusedSettingList.push("+ freq crush");
                            }
                            if (anyInstrumentPans) {
                                settingList.push("pan");
                                settingList.push("pan delay");
                            }
                            if (!allInstrumentPans) {
                                unusedSettingList.push("+ pan");
                                unusedSettingList.push("+ pan delay");
                            }
                            if (anyInstrumentChorus) {
                                settingList.push("chorus");
                            }
                            if (!allInstrumentChorus) {
                                unusedSettingList.push("+ chorus");
                            }
                            if (anyInstrumentEchoes) {
                                settingList.push("echo");
                            }
                            if (!allInstrumentEchoes) {
                                unusedSettingList.push("+ echo");
                            }
                            if (anyInstrumentReverbs) {
                                settingList.push("reverb");
                            }
                            if (!allInstrumentReverbs) {
                                unusedSettingList.push("+ reverb");
                            }
                        }
                        buildOptions(this._modSetBoxes[mod], settingList);
                        if (unusedSettingList.length > 0) {
                            this._modSetBoxes[mod].appendChild(option({ selected: false, disabled: true, value: "Add Effect" }, "Add Effect"));
                            buildOptions(this._modSetBoxes[mod], unusedSettingList);
                        }
                        let setIndex = settingList.indexOf(Config.modulators[instrument.modulators[mod]].name);
                        if (setIndex == -1) {
                            this._modSetBoxes[mod].insertBefore(option({ value: Config.modulators[instrument.modulators[mod]].name, style: "color: red;" }, Config.modulators[instrument.modulators[mod]].name), this._modSetBoxes[mod].children[0]);
                            this._modSetBoxes[mod].selectedIndex = 0;
                            this._whenSetModSetting(mod, true);
                        }
                        else {
                            this._modSetBoxes[mod].selectedIndex = setIndex;
                            this._modSetBoxes[mod].classList.remove("invalidSetting");
                            instrument.invalidModulators[mod] = false;
                        }
                    }
                    else if (this._modSetBoxes[mod].selectedIndex > 0) {
                        this._modSetBoxes[mod].selectedIndex = 0;
                        this._whenSetModSetting(mod);
                    }
                    if (instrument.modChannels[mod] < 0) {
                        (this._modInstrumentBoxes[mod].parentElement).style.display = "none";
                        $("#modInstrumentText" + mod).get(0).style.display = "none";
                        $("#modChannelText" + mod).get(0).innerText = "Channel:";
                        if (instrument.modChannels[mod] == -2) {
                            $("#modSettingText" + mod).get(0).style.display = "none";
                            (this._modSetBoxes[mod].parentElement).style.display = "none";
                        }
                        else {
                            $("#modSettingText" + mod).get(0).style.display = "";
                            (this._modSetBoxes[mod].parentElement).style.display = "";
                        }
                        this._modTargetIndicators[mod].style.setProperty("fill", ColorConfig.uiWidgetFocus);
                        this._modTargetIndicators[mod].classList.remove("modTarget");
                    }
                    else {
                        (this._modInstrumentBoxes[mod].parentElement).style.display = (channel.instruments.length > 1) ? "" : "none";
                        $("#modInstrumentText" + mod).get(0).style.display = (channel.instruments.length > 1) ? "" : "none";
                        $("#modChannelText" + mod).get(0).innerText = (channel.instruments.length > 1) ? "Ch:" : "Channel:";
                        $("#modSettingText" + mod).get(0).style.display = "";
                        (this._modSetBoxes[mod].parentElement).style.display = "";
                        this._modTargetIndicators[mod].style.setProperty("fill", ColorConfig.indicatorPrimary);
                        this._modTargetIndicators[mod].classList.add("modTarget");
                    }
                    let filterType = Config.modulators[instrument.modulators[mod]].name;
                    if (filterType == "eq filter" || filterType == "note filter") {
                        $("#modFilterText" + mod).get(0).style.display = "";
                        $("#modSettingText" + mod).get(0).style.setProperty("margin-bottom", "2px");
                        let useInstrument = instrument.modInstruments[mod];
                        let modChannel = this._doc.song.channels[Math.max(0, instrument.modChannels[mod])];
                        let tmpCount = -1;
                        if (useInstrument >= modChannel.instruments.length) {
                            for (let i = 0; i < modChannel.instruments.length; i++) {
                                if (filterType == "eq filter") {
                                    if (modChannel.instruments[i].eqFilter.controlPointCount > tmpCount) {
                                        tmpCount = modChannel.instruments[i].eqFilter.controlPointCount;
                                        useInstrument = i;
                                    }
                                }
                                else {
                                    if (modChannel.instruments[i].noteFilter.controlPointCount > tmpCount) {
                                        tmpCount = modChannel.instruments[i].noteFilter.controlPointCount;
                                        useInstrument = i;
                                    }
                                }
                            }
                        }
                        let dotCount = (filterType == "eq filter")
                            ? channel.instruments[useInstrument].eqFilter.controlPointCount
                            : channel.instruments[useInstrument].noteFilter.controlPointCount;
                        const isSimple = (filterType == "eq filter" ? channel.instruments[useInstrument].eqFilterType : channel.instruments[useInstrument].noteFilterType);
                        if (isSimple)
                            dotCount = 0;
                        if (isSimple || this._modFilterBoxes[mod].children.length != 1 + dotCount * 2) {
                            while (this._modFilterBoxes[mod].firstChild)
                                this._modFilterBoxes[mod].remove(0);
                            const dotList = [];
                            if (!isSimple)
                                dotList.push("morph");
                            for (let i = 0; i < dotCount; i++) {
                                dotList.push("dot " + (i + 1) + " x");
                                dotList.push("dot " + (i + 1) + " y");
                            }
                            buildOptions(this._modFilterBoxes[mod], dotList);
                        }
                        if (isSimple || instrument.modFilterTypes[mod] >= this._modFilterBoxes[mod].length) {
                            this._modFilterBoxes[mod].classList.add("invalidSetting");
                            instrument.invalidModulators[mod] = true;
                            let useName = ((instrument.modFilterTypes[mod] - 1) % 2 == 1) ?
                                "dot " + (Math.floor((instrument.modFilterTypes[mod] - 1) / 2) + 1) + " y"
                                : "dot " + (Math.floor((instrument.modFilterTypes[mod] - 1) / 2) + 1) + " x";
                            if (instrument.modFilterTypes[mod] == 0)
                                useName = "morph";
                            this._modFilterBoxes[mod].insertBefore(option({ value: useName, style: "color: red;" }, useName), this._modFilterBoxes[mod].children[0]);
                            this._modFilterBoxes[mod].selectedIndex = 0;
                        }
                        else {
                            this._modFilterBoxes[mod].classList.remove("invalidSetting");
                            instrument.invalidModulators[mod] = false;
                            this._modFilterBoxes[mod].selectedIndex = instrument.modFilterTypes[mod];
                        }
                    }
                    else {
                        $("#modFilterText" + mod).get(0).style.display = "none";
                        $("#modSettingText" + mod).get(0).style.setProperty("margin-bottom", "0.9em");
                    }
                }
                this._doc.recalcChannelNames = false;
                for (let chordIndex = 0; chordIndex < Config.chords.length; chordIndex++) {
                    const option = this._chordSelect.children[chordIndex];
                    if (!option.hasAttribute("hidden")) {
                        option.setAttribute("hidden", "");
                    }
                }
                this._customInstrumentSettingsGroup.style.display = "none";
                this._panSliderRow.style.display = "none";
                this._panDropdownGroup.style.display = "none";
                this._instrumentVolumeSliderRow.style.display = "none";
                this._instrumentTypeSelectRow.style.setProperty("display", "none");
                this._instrumentSettingsGroup.style.color = ColorConfig.getChannelColor(this._doc.song, this._doc.channel).primaryNote;
                if (this._doc.channel >= this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
                    this._piano.forceRender();
                }
                this._renderInstrumentBar(channel, instrumentIndex, colors);
            }
            this._instrumentSettingsGroup.style.color = colors.primaryNote;
            this._eqFilterEditor.render();
            this._instrumentVolumeSlider.updateValue(instrument.volume);
            this._detuneSlider.updateValue(instrument.detune - Config.detuneCenter);
            this._twoNoteArpBox.checked = instrument.fastTwoNoteArp ? true : false;
            this._clicklessTransitionBox.checked = instrument.clicklessTransition ? true : false;
            this._aliasingBox.checked = instrument.aliases ? true : false;
            this._addEnvelopeButton.disabled = (instrument.envelopeCount >= Config.maxEnvelopeCount);
            this._volumeSlider.updateValue(prefs.volume);
            if (wasActive && activeElement != null && activeElement.clientWidth == 0) {
                this.refocusStage();
            }
            this._setPrompt(this._doc.prompt);
            if (prefs.autoFollow && !this._doc.synth.playing) {
                this._doc.synth.goToBar(this._doc.bar);
            }
            if (this._doc.addedEffect) {
                const envButtonRect = this._addEnvelopeButton.getBoundingClientRect();
                const instSettingsRect = this._instrumentSettingsArea.getBoundingClientRect();
                const settingsRect = this._settingsArea.getBoundingClientRect();
                this._instrumentSettingsArea.scrollTop += Math.max(0, envButtonRect.top - (instSettingsRect.top + instSettingsRect.height));
                this._settingsArea.scrollTop += Math.max(0, envButtonRect.top - (settingsRect.top + settingsRect.height));
                this._doc.addedEffect = false;
            }
            if (this._doc.addedEnvelope) {
                this._instrumentSettingsArea.scrollTop = this._instrumentSettingsArea.scrollHeight;
                this._settingsArea.scrollTop = this._settingsArea.scrollHeight;
                this._doc.addedEnvelope = false;
            }
        };
        this.updatePlayButton = () => {
            if (this._renderedIsPlaying != this._doc.synth.playing || this._renderedIsRecording != this._doc.synth.recording || this._renderedShowRecordButton != this._doc.prefs.showRecordButton || this._renderedCtrlHeld != this._ctrlHeld) {
                this._renderedIsPlaying = this._doc.synth.playing;
                this._renderedIsRecording = this._doc.synth.recording;
                this._renderedShowRecordButton = this._doc.prefs.showRecordButton;
                this._renderedCtrlHeld = this._ctrlHeld;
                if (document.activeElement == this._playButton || document.activeElement == this._pauseButton || document.activeElement == this._recordButton || document.activeElement == this._stopButton) {
                    this.refocusStage();
                }
                this._playButton.style.display = "none";
                this._pauseButton.style.display = "none";
                this._recordButton.style.display = "none";
                this._stopButton.style.display = "none";
                this._prevBarButton.style.display = "";
                this._nextBarButton.style.display = "";
                this._playButton.classList.remove("shrunk");
                this._recordButton.classList.remove("shrunk");
                this._patternEditorRow.style.pointerEvents = "";
                this._octaveScrollBar.container.style.pointerEvents = "";
                this._octaveScrollBar.container.style.opacity = "";
                this._trackContainer.style.pointerEvents = "";
                this._loopEditor.container.style.opacity = "";
                this._instrumentSettingsArea.style.pointerEvents = "";
                this._instrumentSettingsArea.style.opacity = "";
                this._menuArea.style.pointerEvents = "";
                this._menuArea.style.opacity = "";
                this._songSettingsArea.style.pointerEvents = "";
                this._songSettingsArea.style.opacity = "";
                if (this._doc.synth.recording) {
                    this._stopButton.style.display = "";
                    this._prevBarButton.style.display = "none";
                    this._nextBarButton.style.display = "none";
                    this._patternEditorRow.style.pointerEvents = "none";
                    this._octaveScrollBar.container.style.pointerEvents = "none";
                    this._octaveScrollBar.container.style.opacity = "0.5";
                    this._trackContainer.style.pointerEvents = "none";
                    this._loopEditor.container.style.opacity = "0.5";
                    this._instrumentSettingsArea.style.pointerEvents = "none";
                    this._instrumentSettingsArea.style.opacity = "0.5";
                    this._menuArea.style.pointerEvents = "none";
                    this._menuArea.style.opacity = "0.5";
                    this._songSettingsArea.style.pointerEvents = "none";
                    this._songSettingsArea.style.opacity = "0.5";
                }
                else if (this._doc.synth.playing) {
                    this._pauseButton.style.display = "";
                }
                else if (this._doc.prefs.showRecordButton) {
                    this._playButton.style.display = "";
                    this._recordButton.style.display = "";
                    this._playButton.classList.add("shrunk");
                    this._recordButton.classList.add("shrunk");
                }
                else if (this._ctrlHeld) {
                    this._recordButton.style.display = "";
                }
                else {
                    this._playButton.style.display = "";
                }
            }
            window.requestAnimationFrame(this.updatePlayButton);
        };
        this._disableCtrlContextMenu = (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
                return false;
            }
            return true;
        };
        this._tempoStepperCaptureNumberKeys = (event) => {
            switch (event.keyCode) {
                case 8:
                case 13:
                case 38:
                case 40:
                case 37:
                case 39:
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                    event.stopPropagation();
                    break;
            }
        };
        this._whenKeyPressed = (event) => {
            this._ctrlHeld = event.ctrlKey;
            if (this.prompt) {
                if (this.prompt instanceof CustomChipPrompt || this.prompt instanceof LimiterPrompt || this.prompt instanceof CustomScalePrompt || this.prompt instanceof CustomFilterPrompt) {
                    this.prompt.whenKeyPressed(event);
                }
                if (event.keyCode == 27) {
                    this._doc.undo();
                }
                return;
            }
            if (document.activeElement == this._songTitleInputBox.input || this._patternEditor.editingModLabel || document.activeElement == this._muteEditor._channelNameInput.input) {
                if (event.keyCode == 13 || event.keyCode == 27) {
                    this.mainLayer.focus();
                    this._patternEditor.stopEditingModLabel(event.keyCode == 27);
                }
                return;
            }
            if (document.activeElement == this._panSliderInputBox || document.activeElement == this._detuneSliderInputBox || document.activeElement == this._instrumentVolumeSliderInputBox) {
                if (event.keyCode == 13 || event.keyCode == 27) {
                    this.mainLayer.focus();
                }
                return;
            }
            if (this._doc.synth.recording) {
                if (!event.ctrlKey && !event.metaKey) {
                    this._keyboardLayout.handleKeyEvent(event, true);
                }
                if (event.keyCode == 32) {
                    this._toggleRecord();
                    event.preventDefault();
                    this.refocusStage();
                }
                else if (event.keyCode == 80 && (event.ctrlKey || event.metaKey)) {
                    this._toggleRecord();
                    event.preventDefault();
                    this.refocusStage();
                }
                return;
            }
            const needControlForShortcuts = (this._doc.prefs.pressControlForShortcuts != event.getModifierState("CapsLock"));
            const canPlayNotes = (!event.ctrlKey && !event.metaKey && needControlForShortcuts);
            if (canPlayNotes)
                this._keyboardLayout.handleKeyEvent(event, true);
            switch (event.keyCode) {
                case 27:
                    if (!event.ctrlKey && !event.metaKey) {
                        new ChangePatternSelection(this._doc, 0, 0);
                        this._doc.selection.resetBoxSelection();
                    }
                    break;
                case 16:
                    this._patternEditor.shiftMode = true;
                    break;
                case 17:
                    this._patternEditor.controlMode = true;
                    break;
                case 32:
                    if (event.ctrlKey) {
                        this._toggleRecord();
                    }
                    else if (event.shiftKey) {
                        if (this._trackEditor.movePlayheadToMouse() || this._patternEditor.movePlayheadToMouse()) {
                            if (!this._doc.synth.playing)
                                this._doc.performance.play();
                        }
                    }
                    else {
                        this.togglePlay();
                    }
                    event.preventDefault();
                    this.refocusStage();
                    break;
                case 80:
                    if (canPlayNotes)
                        break;
                    if (event.ctrlKey || event.metaKey) {
                        this._toggleRecord();
                        event.preventDefault();
                        this.refocusStage();
                    }
                    break;
                case 90:
                    if (canPlayNotes)
                        break;
                    if (event.shiftKey) {
                        this._doc.redo();
                    }
                    else {
                        this._doc.undo();
                    }
                    event.preventDefault();
                    break;
                case 89:
                    if (canPlayNotes)
                        break;
                    this._doc.redo();
                    event.preventDefault();
                    break;
                case 67:
                    if (canPlayNotes)
                        break;
                    if (event.shiftKey) {
                        this._copyInstrument();
                    }
                    else {
                        this._doc.selection.copy();
                    }
                    this._doc.selection.resetBoxSelection();
                    this._doc.selection.selectionUpdated();
                    event.preventDefault();
                    break;
                case 13:
                    if (event.ctrlKey || event.metaKey) {
                        this._doc.selection.insertChannel();
                    }
                    else {
                        this._doc.selection.insertBars();
                    }
                    event.preventDefault();
                    break;
                case 8:
                    if (event.ctrlKey || event.metaKey) {
                        this._doc.selection.deleteChannel();
                    }
                    else {
                        this._doc.selection.deleteBars();
                    }
                    this._barScrollBar.animatePlayhead();
                    event.preventDefault();
                    break;
                case 65:
                    if (canPlayNotes)
                        break;
                    if (event.shiftKey) {
                        this._doc.selection.selectChannel();
                    }
                    else {
                        this._doc.selection.selectAll();
                    }
                    event.preventDefault();
                    break;
                case 68:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        this._doc.selection.duplicatePatterns();
                        event.preventDefault();
                    }
                    break;
                case 69:
                    if (event.shiftKey) {
                        const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
                        if (!instrument.eqFilterType && this._doc.channel < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount)
                            this._openPrompt("customEQFilterSettings");
                    }
                    break;
                case 70:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        this._doc.synth.snapToStart();
                        this._doc.synth.computeLatestModValues();
                        if (this._doc.prefs.autoFollow) {
                            this._doc.selection.setChannelBar(this._doc.channel, Math.floor(this._doc.synth.playhead));
                        }
                        event.preventDefault();
                    }
                    break;
                case 72:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        this._doc.synth.goToBar(this._doc.bar);
                        this._doc.synth.snapToBar();
                        this._doc.synth.computeLatestModValues();
                        if (this._doc.prefs.autoFollow) {
                            this._doc.selection.setChannelBar(this._doc.channel, Math.floor(this._doc.synth.playhead));
                        }
                        event.preventDefault();
                    }
                    break;
                case 74:
                    if (canPlayNotes)
                        break;
                    if (event.shiftKey && event.ctrlKey && event.altKey) {
                        this._doc.prefs.autoPlay = false;
                        this._doc.prefs.autoFollow = false;
                        this._doc.prefs.enableNotePreview = true;
                        this._doc.prefs.showFifth = true;
                        this._doc.prefs.notesOutsideScale = false;
                        this._doc.prefs.defaultScale = 0;
                        this._doc.prefs.showLetters = true;
                        this._doc.prefs.showChannels = true;
                        this._doc.prefs.showScrollBar = true;
                        this._doc.prefs.alwaysFineNoteVol = false;
                        this._doc.prefs.enableChannelMuting = true;
                        this._doc.prefs.displayBrowserUrl = true;
                        this._doc.prefs.displayVolumeBar = true;
                        this._doc.prefs.layout = "wide";
                        this._doc.prefs.visibleOctaves = 5;
                        this._doc.prefs.save();
                        event.preventDefault();
                        location.reload();
                    }
                    break;
                case 76:
                    if (canPlayNotes)
                        break;
                    if (event.shiftKey) {
                        this._openPrompt("limiterSettings");
                    }
                    else {
                        this._openPrompt("barCount");
                    }
                    break;
                case 77:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        if (this._doc.prefs.enableChannelMuting) {
                            this._doc.selection.muteChannels(event.shiftKey);
                            event.preventDefault();
                        }
                    }
                    break;
                case 78:
                    if (canPlayNotes)
                        break;
                    const group = new ChangeGroup();
                    if (event.shiftKey) {
                        const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
                        if (effectsIncludeNoteFilter(instrument.effects) && !instrument.noteFilterType && this._doc.channel < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount)
                            this._openPrompt("customNoteFilterSettings");
                        break;
                    }
                    else if (event.ctrlKey) {
                        let nextEmpty = 0;
                        while (nextEmpty < this._doc.song.patternsPerChannel && this._doc.song.channels[this._doc.channel].patterns[nextEmpty].notes.length > 0)
                            nextEmpty++;
                        nextEmpty++;
                        if (nextEmpty <= Config.barCountMax) {
                            if (nextEmpty > this._doc.song.patternsPerChannel) {
                                group.append(new ChangePatternsPerChannel(this._doc, nextEmpty));
                            }
                            group.append(new ChangePatternNumbers(this._doc, nextEmpty, this._doc.bar, this._doc.channel, 1, 1));
                        }
                    }
                    else {
                        let nextUnused = 1;
                        while (this._doc.song.channels[this._doc.channel].bars.indexOf(nextUnused) != -1
                            && nextUnused <= this._doc.song.patternsPerChannel)
                            nextUnused++;
                        if (nextUnused <= Config.barCountMax) {
                            if (nextUnused > this._doc.song.patternsPerChannel) {
                                group.append(new ChangePatternsPerChannel(this._doc, nextUnused));
                            }
                            group.append(new ChangePatternNumbers(this._doc, nextUnused, this._doc.bar, this._doc.channel, 1, 1));
                        }
                    }
                    this._doc.record(group);
                    event.preventDefault();
                    break;
                case 81:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        this._openPrompt("channelSettings");
                        event.preventDefault();
                    }
                    break;
                case 83:
                    if (canPlayNotes)
                        break;
                    if (event.ctrlKey || event.metaKey) {
                        this._openPrompt("export");
                        event.preventDefault();
                    }
                    else {
                        if (this._doc.prefs.enableChannelMuting) {
                            if (event.shiftKey) {
                                this._doc.selection.muteChannels(false);
                            }
                            else {
                                this._doc.selection.soloChannels(false);
                            }
                            event.preventDefault();
                        }
                    }
                    break;
                case 79:
                    if (canPlayNotes)
                        break;
                    if (event.ctrlKey || event.metaKey) {
                        this._openPrompt("import");
                        event.preventDefault();
                    }
                    break;
                case 86:
                    if (canPlayNotes)
                        break;
                    if ((event.ctrlKey || event.metaKey) && event.shiftKey && !needControlForShortcuts) {
                        this._doc.selection.pasteNumbers();
                    }
                    else if (event.shiftKey) {
                        this._pasteInstrument();
                    }
                    else {
                        this._doc.selection.pasteNotes();
                    }
                    event.preventDefault();
                    break;
                case 87:
                    if (canPlayNotes)
                        break;
                    this._openPrompt("moveNotesSideways");
                    break;
                case 73:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey) && event.shiftKey) {
                        const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
                        const instrumentObject = instrument.toJsonObject();
                        delete instrumentObject["preset"];
                        delete instrumentObject["volume"];
                        delete instrumentObject["pan"];
                        const panningEffectIndex = instrumentObject["effects"].indexOf(Config.effectNames[2]);
                        if (panningEffectIndex != -1)
                            instrumentObject["effects"].splice(panningEffectIndex, 1);
                        for (let i = 0; i < instrumentObject["envelopes"].length; i++) {
                            const envelope = instrumentObject["envelopes"][i];
                            if (envelope["target"] == "panning" || envelope["target"] == "none" || envelope["envelope"] == "none") {
                                instrumentObject["envelopes"].splice(i, 1);
                                i--;
                            }
                        }
                        this._copyTextToClipboard(JSON.stringify(instrumentObject));
                        event.preventDefault();
                    }
                    break;
                case 82:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        if (event.shiftKey) {
                            this._randomGenerated();
                        }
                        else {
                            this._randomPreset();
                        }
                        event.preventDefault();
                    }
                    break;
                case 219:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        this._doc.synth.goToPrevBar();
                        if (this._doc.prefs.autoFollow) {
                            this._doc.selection.setChannelBar(this._doc.channel, Math.floor(this._doc.synth.playhead));
                        }
                        event.preventDefault();
                    }
                    break;
                case 221:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        this._doc.synth.goToNextBar();
                        if (this._doc.prefs.autoFollow) {
                            this._doc.selection.setChannelBar(this._doc.channel, Math.floor(this._doc.synth.playhead));
                        }
                        event.preventDefault();
                    }
                    break;
                case 189:
                case 173:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        this._doc.selection.transpose(false, event.shiftKey);
                        event.preventDefault();
                    }
                    break;
                case 187:
                case 61:
                case 171:
                    if (canPlayNotes)
                        break;
                    if (needControlForShortcuts == (event.ctrlKey || event.metaKey)) {
                        this._doc.selection.transpose(true, event.shiftKey);
                        event.preventDefault();
                    }
                    break;
                case 38:
                    if (event.ctrlKey || event.metaKey) {
                        this._doc.selection.swapChannels(-1);
                    }
                    else if (event.shiftKey) {
                        this._doc.selection.boxSelectionY1 = Math.max(0, this._doc.selection.boxSelectionY1 - 1);
                        this._doc.selection.scrollToEndOfSelection();
                        this._doc.selection.selectionUpdated();
                    }
                    else {
                        this._doc.selection.setChannelBar((this._doc.channel - 1 + this._doc.song.getChannelCount()) % this._doc.song.getChannelCount(), this._doc.bar);
                        this._doc.selection.resetBoxSelection();
                    }
                    event.preventDefault();
                    break;
                case 40:
                    if (event.ctrlKey || event.metaKey) {
                        this._doc.selection.swapChannels(1);
                    }
                    else if (event.shiftKey) {
                        this._doc.selection.boxSelectionY1 = Math.min(this._doc.song.getChannelCount() - 1, this._doc.selection.boxSelectionY1 + 1);
                        this._doc.selection.scrollToEndOfSelection();
                        this._doc.selection.selectionUpdated();
                    }
                    else {
                        this._doc.selection.setChannelBar((this._doc.channel + 1) % this._doc.song.getChannelCount(), this._doc.bar);
                        this._doc.selection.resetBoxSelection();
                    }
                    event.preventDefault();
                    break;
                case 37:
                    if (event.shiftKey) {
                        this._doc.selection.boxSelectionX1 = Math.max(0, this._doc.selection.boxSelectionX1 - 1);
                        this._doc.selection.scrollToEndOfSelection();
                        this._doc.selection.selectionUpdated();
                    }
                    else {
                        this._doc.selection.setChannelBar(this._doc.channel, (this._doc.bar + this._doc.song.barCount - 1) % this._doc.song.barCount);
                        this._doc.selection.resetBoxSelection();
                    }
                    event.preventDefault();
                    break;
                case 39:
                    if (event.shiftKey) {
                        this._doc.selection.boxSelectionX1 = Math.min(this._doc.song.barCount - 1, this._doc.selection.boxSelectionX1 + 1);
                        this._doc.selection.scrollToEndOfSelection();
                        this._doc.selection.selectionUpdated();
                    }
                    else {
                        this._doc.selection.setChannelBar(this._doc.channel, (this._doc.bar + 1) % this._doc.song.barCount);
                        this._doc.selection.resetBoxSelection();
                    }
                    event.preventDefault();
                    break;
                case 46:
                    this._doc.selection.digits = "";
                    this._doc.selection.nextDigit("0", false, false);
                    break;
                case 48:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("0", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                case 49:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("1", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                case 50:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("2", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                case 51:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("3", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                case 52:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("4", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                case 53:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("5", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                case 54:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("6", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                case 55:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("7", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                case 56:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("8", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                case 57:
                    if (canPlayNotes)
                        break;
                    this._doc.selection.nextDigit("9", needControlForShortcuts != (event.shiftKey || event.ctrlKey || event.metaKey), event.altKey);
                    event.preventDefault();
                    break;
                default:
                    this._doc.selection.digits = "";
                    this._doc.selection.instrumentDigits = "";
                    break;
            }
            if (canPlayNotes) {
                this._doc.selection.digits = "";
                this._doc.selection.instrumentDigits = "";
            }
        };
        this._whenKeyReleased = (event) => {
            this._muteEditor.onKeyUp(event);
            if (!event.ctrlKey) {
                this._patternEditor.controlMode = false;
            }
            if (!event.shiftKey) {
                this._patternEditor.shiftMode = false;
            }
            this._ctrlHeld = event.ctrlKey;
            this._keyboardLayout.handleKeyEvent(event, false);
        };
        this._whenPrevBarPressed = () => {
            this._doc.synth.goToPrevBar();
            this._barScrollBar.animatePlayhead();
        };
        this._whenNextBarPressed = () => {
            this._doc.synth.goToNextBar();
            this._barScrollBar.animatePlayhead();
        };
        this.togglePlay = () => {
            if (this._doc.synth.playing) {
                this._doc.performance.pause();
                this.outVolumeHistoricCap = 0;
            }
            else {
                this._doc.synth.snapToBar();
                this._doc.performance.play();
            }
        };
        this._toggleRecord = () => {
            if (this._doc.synth.playing) {
                this._doc.performance.pause();
            }
            else {
                this._doc.performance.record();
            }
        };
        this._animate = () => {
            this._modSliderUpdate();
            if (this._doc.prefs.displayVolumeBar) {
                this._volumeUpdate();
            }
            this._barScrollBar.animatePlayhead();
            if (this._doc.synth.isFilterModActive(false, this._doc.channel, this._doc.getCurrentInstrument())) {
                this._eqFilterEditor.render(true);
            }
            if (this._doc.synth.isFilterModActive(true, this._doc.channel, this._doc.getCurrentInstrument())) {
                this._noteFilterEditor.render(true);
            }
            window.requestAnimationFrame(this._animate);
        };
        this._volumeUpdate = () => {
            this.outVolumeHistoricTimer--;
            if (this.outVolumeHistoricTimer <= 0) {
                this.outVolumeHistoricCap -= 0.03;
            }
            if (this._doc.song.outVolumeCap > this.outVolumeHistoricCap) {
                this.outVolumeHistoricCap = this._doc.song.outVolumeCap;
                this.outVolumeHistoricTimer = 50;
            }
            if (this._doc.song.outVolumeCap != this.lastOutVolumeCap) {
                this.lastOutVolumeCap = this._doc.song.outVolumeCap;
                this._animateVolume(this._doc.song.outVolumeCap, this.outVolumeHistoricCap);
            }
        };
        this._setVolumeSlider = () => {
            this._doc.setVolume(Number(this._volumeSlider.input.value));
        };
        this._copyInstrument = () => {
            const channel = this._doc.song.channels[this._doc.channel];
            const instrument = channel.instruments[this._doc.getCurrentInstrument()];
            const instrumentCopy = instrument.toJsonObject();
            instrumentCopy["isDrum"] = this._doc.song.getChannelIsNoise(this._doc.channel);
            window.localStorage.setItem("instrumentCopy", JSON.stringify(instrumentCopy));
            this.refocusStage();
        };
        this._pasteInstrument = () => {
            const channel = this._doc.song.channels[this._doc.channel];
            const instrument = channel.instruments[this._doc.getCurrentInstrument()];
            const instrumentCopy = JSON.parse(String(window.localStorage.getItem("instrumentCopy")));
            if (instrumentCopy != null && instrumentCopy["isDrum"] == this._doc.song.getChannelIsNoise(this._doc.channel)) {
                this._doc.record(new ChangePasteInstrument(this._doc, instrument, instrumentCopy));
            }
            this.refocusStage();
        };
        this._whenSetTempo = () => {
            this._doc.record(new ChangeTempo(this._doc, -1, parseInt(this._tempoStepper.value) | 0));
        };
        this._whenSetScale = () => {
            if (isNaN(this._scaleSelect.value)) {
                switch (this._scaleSelect.value) {
                    case "forceScale":
                        this._doc.selection.forceScale();
                        break;
                    case "customize":
                        this._openPrompt("customScale");
                        break;
                }
                this._doc.notifier.changed();
            }
            else {
                this._doc.record(new ChangeScale(this._doc, this._scaleSelect.selectedIndex));
            }
        };
        this._whenSetKey = () => {
            if (isNaN(this._keySelect.value)) {
                switch (this._keySelect.value) {
                    case "detectKey":
                        this._doc.record(new ChangeDetectKey(this._doc));
                        break;
                }
                this._doc.notifier.changed();
            }
            else {
                this._doc.record(new ChangeKey(this._doc, Config.keys.length - 1 - this._keySelect.selectedIndex));
            }
        };
        this._whenSetRhythm = () => {
            if (isNaN(this._rhythmSelect.value)) {
                switch (this._rhythmSelect.value) {
                    case "forceRhythm":
                        this._doc.selection.forceRhythm();
                        break;
                }
                this._doc.notifier.changed();
            }
            else {
                this._doc.record(new ChangeRhythm(this._doc, this._rhythmSelect.selectedIndex));
            }
        };
        this._refocus = () => {
            var selfRef = this;
            setTimeout(function () { selfRef.mainLayer.focus(); }, 20);
        };
        this._whenSetPitchedPreset = () => {
            this._setPreset($('#pitchPresetSelect').val() + "");
        };
        this._whenSetDrumPreset = () => {
            this._setPreset($('#drumPresetSelect').val() + "");
        };
        this._whenSetFeedbackType = () => {
            this._doc.record(new ChangeFeedbackType(this._doc, this._feedbackTypeSelect.selectedIndex));
        };
        this._whenSetAlgorithm = () => {
            this._doc.record(new ChangeAlgorithm(this._doc, this._algorithmSelect.selectedIndex));
        };
        this._whenSet6OpFeedbackType = () => {
            this._doc.record(new Change6OpFeedbackType(this._doc, this._feedback6OpTypeSelect.selectedIndex));
            this._customAlgorithmCanvas.reset();
        };
        this._whenSet6OpAlgorithm = () => {
            this._doc.record(new Change6OpAlgorithm(this._doc, this._algorithm6OpSelect.selectedIndex));
            this._customAlgorithmCanvas.reset();
        };
        this._whenSelectInstrument = (event) => {
            if (event.target == this._instrumentAddButton) {
                this._doc.record(new ChangeAddChannelInstrument(this._doc));
            }
            else if (event.target == this._instrumentRemoveButton) {
                this._doc.record(new ChangeRemoveChannelInstrument(this._doc));
            }
            else {
                const index = this._instrumentButtons.indexOf(event.target);
                if (index != -1) {
                    this._doc.selection.selectInstrument(index);
                }
                if (this._doc.channel >= this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
                    this._piano.forceRender();
                }
            }
            this.refocusStage();
        };
        this._whenSetModChannel = (mod) => {
            let instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
            let previouslyUnset = (instrument.modulators[mod] == 0 || Config.modulators[instrument.modulators[mod]].forSong);
            this._doc.selection.setModChannel(mod, this._modChannelBoxes[mod].selectedIndex);
            const modChannel = Math.max(0, instrument.modChannels[mod]);
            if (this._doc.song.channels[modChannel].instruments.length > 1 && previouslyUnset && this._modChannelBoxes[mod].selectedIndex >= 2) {
                if (this._doc.song.channels[modChannel].bars[this._doc.bar] > 0) {
                    this._doc.selection.setModInstrument(mod, this._doc.song.channels[modChannel].patterns[this._doc.song.channels[modChannel].bars[this._doc.bar] - 1].instruments[0]);
                }
            }
            this._piano.forceRender();
        };
        this._whenSetModInstrument = (mod) => {
            this._doc.selection.setModInstrument(mod, this._modInstrumentBoxes[mod].selectedIndex);
            this._piano.forceRender();
        };
        this._whenSetModSetting = (mod, invalidIndex = false) => {
            let text = "none";
            if (this._modSetBoxes[mod].selectedIndex != -1) {
                text = this._modSetBoxes[mod].children[this._modSetBoxes[mod].selectedIndex].textContent;
                if (invalidIndex) {
                    this._modSetBoxes[mod].selectedOptions.item(0).style.setProperty("color", "red");
                    this._modSetBoxes[mod].classList.add("invalidSetting");
                    this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()].invalidModulators[mod] = true;
                }
                else {
                    this._modSetBoxes[mod].classList.remove("invalidSetting");
                    this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()].invalidModulators[mod] = false;
                }
            }
            if (!invalidIndex)
                this._doc.selection.setModSetting(mod, text);
            this._piano.forceRender();
        };
        this._whenClickModTarget = (mod) => {
            if (this._modChannelBoxes[mod].selectedIndex >= 2) {
                this._doc.selection.setChannelBar(this._modChannelBoxes[mod].selectedIndex - 2, this._doc.bar);
            }
        };
        this._whenClickJumpToModTarget = () => {
            const channelIndex = this._doc.channel;
            const instrumentIndex = this._doc.getCurrentInstrument();
            if (channelIndex < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
                for (let modChannelIdx = this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount; modChannelIdx < this._doc.song.channels.length; modChannelIdx++) {
                    const modChannel = this._doc.song.channels[modChannelIdx];
                    const patternIdx = modChannel.bars[this._doc.bar];
                    if (patternIdx > 0) {
                        const modInstrumentIdx = modChannel.patterns[patternIdx - 1].instruments[0];
                        const modInstrument = modChannel.instruments[modInstrumentIdx];
                        for (let mod = 0; mod < Config.modCount; mod++) {
                            if (modInstrument.modChannels[mod] == channelIndex && (modInstrument.modInstruments[mod] == instrumentIndex || modInstrument.modInstruments[mod] >= this._doc.song.channels[channelIndex].instruments.length)) {
                                this._doc.selection.setChannelBar(modChannelIdx, this._doc.bar);
                                return;
                            }
                        }
                    }
                }
            }
        };
        this._whenSetModFilter = (mod) => {
            this._doc.selection.setModFilter(mod, this._modFilterBoxes[mod].selectedIndex);
        };
        this._whenSetChipWave = () => {
            this._doc.record(new ChangeChipWave(this._doc, this._chipWaveSelect.selectedIndex));
        };
        this._whenSetNoiseWave = () => {
            this._doc.record(new ChangeNoiseWave(this._doc, this._chipNoiseSelect.selectedIndex));
        };
        this._whenSetTransition = () => {
            this._doc.record(new ChangeTransition(this._doc, this._transitionSelect.selectedIndex));
        };
        this._whenSetEffects = () => {
            const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
            const oldValue = instrument.effects;
            const toggleFlag = Config.effectOrder[this._effectsSelect.selectedIndex - 1];
            this._doc.record(new ChangeToggleEffects(this._doc, toggleFlag, null));
            this._effectsSelect.selectedIndex = 0;
            if (instrument.effects > oldValue) {
                this._doc.addedEffect = true;
            }
            this._doc.notifier.changed();
        };
        this._whenSetVibrato = () => {
            this._doc.record(new ChangeVibrato(this._doc, this._vibratoSelect.selectedIndex));
        };
        this._whenSetVibratoType = () => {
            this._doc.record(new ChangeVibratoType(this._doc, this._vibratoTypeSelect.selectedIndex));
        };
        this._whenSetUnison = () => {
            this._doc.record(new ChangeUnison(this._doc, this._unisonSelect.selectedIndex));
        };
        this._whenSetChord = () => {
            this._doc.record(new ChangeChord(this._doc, this._chordSelect.selectedIndex));
        };
        this._addNewEnvelope = () => {
            this._doc.record(new ChangeAddEnvelope(this._doc));
            this.refocusStage();
            this._doc.addedEnvelope = true;
        };
        this._zoomIn = () => {
            this._doc.prefs.visibleOctaves = Math.max(1, this._doc.prefs.visibleOctaves - 1);
            this._doc.prefs.save();
            this._doc.notifier.changed();
            this.refocusStage();
        };
        this._zoomOut = () => {
            this._doc.prefs.visibleOctaves = Math.min(Config.pitchOctaves, this._doc.prefs.visibleOctaves + 1);
            this._doc.prefs.save();
            this._doc.notifier.changed();
            this.refocusStage();
        };
        this._fileMenuHandler = (event) => {
            switch (this._fileMenu.value) {
                case "new":
                    this._doc.goBackToStart();
                    this._doc.song.restoreLimiterDefaults();
                    for (const channel of this._doc.song.channels) {
                        channel.muted = false;
                        channel.name = "";
                    }
                    this._doc.record(new ChangeSong(this._doc, ""), false, true);
                    break;
                case "export":
                    this._openPrompt("export");
                    break;
                case "import":
                    this._openPrompt("import");
                    break;
                case "copyUrl":
                    this._copyTextToClipboard(new URL("#" + this._doc.song.toBase64String(), location.href).href);
                    break;
                case "shareUrl":
                    navigator.share({ url: new URL("#" + this._doc.song.toBase64String(), location.href).href });
                    break;
                case "shortenUrl":
                    window.open("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(new URL("#" + this._doc.song.toBase64String(), location.href).href));
                    break;
                case "viewPlayer":
                    location.href = "player/#song=" + this._doc.song.toBase64String();
                    break;
                case "copyEmbed":
                    this._copyTextToClipboard(`<iframe width="384" height="60" style="border: none;" src="${new URL("player/#song=" + this._doc.song.toBase64String(), location.href).href}"></iframe>`);
                    break;
                case "songRecovery":
                    this._openPrompt("songRecovery");
                    break;
            }
            this._fileMenu.selectedIndex = 0;
        };
        this._editMenuHandler = (event) => {
            switch (this._editMenu.value) {
                case "undo":
                    this._doc.undo();
                    break;
                case "redo":
                    this._doc.redo();
                    break;
                case "copy":
                    this._doc.selection.copy();
                    break;
                case "insertBars":
                    this._doc.selection.insertBars();
                    break;
                case "deleteBars":
                    this._doc.selection.deleteBars();
                    break;
                case "insertChannel":
                    this._doc.selection.insertChannel();
                    break;
                case "deleteChannel":
                    this._doc.selection.deleteChannel();
                    break;
                case "pasteNotes":
                    this._doc.selection.pasteNotes();
                    break;
                case "pasteNumbers":
                    this._doc.selection.pasteNumbers();
                    break;
                case "transposeUp":
                    this._doc.selection.transpose(true, false);
                    break;
                case "transposeDown":
                    this._doc.selection.transpose(false, false);
                    break;
                case "selectAll":
                    this._doc.selection.selectAll();
                    break;
                case "selectChannel":
                    this._doc.selection.selectChannel();
                    break;
                case "duplicatePatterns":
                    this._doc.selection.duplicatePatterns();
                    break;
                case "barCount":
                    this._openPrompt("barCount");
                    break;
                case "beatsPerBar":
                    this._openPrompt("beatsPerBar");
                    break;
                case "moveNotesSideways":
                    this._openPrompt("moveNotesSideways");
                    break;
                case "channelSettings":
                    this._openPrompt("channelSettings");
                    break;
                case "limiterSettings":
                    this._openPrompt("limiterSettings");
                    break;
            }
            this._editMenu.selectedIndex = 0;
        };
        this._optionsMenuHandler = (event) => {
            switch (this._optionsMenu.value) {
                case "autoPlay":
                    this._doc.prefs.autoPlay = !this._doc.prefs.autoPlay;
                    break;
                case "autoFollow":
                    this._doc.prefs.autoFollow = !this._doc.prefs.autoFollow;
                    break;
                case "enableNotePreview":
                    this._doc.prefs.enableNotePreview = !this._doc.prefs.enableNotePreview;
                    break;
                case "showLetters":
                    this._doc.prefs.showLetters = !this._doc.prefs.showLetters;
                    break;
                case "showFifth":
                    this._doc.prefs.showFifth = !this._doc.prefs.showFifth;
                    break;
                case "notesOutsideScale":
                    this._doc.prefs.notesOutsideScale = !this._doc.prefs.notesOutsideScale;
                    break;
                case "setDefaultScale":
                    this._doc.prefs.defaultScale = this._doc.song.scale;
                    break;
                case "showChannels":
                    this._doc.prefs.showChannels = !this._doc.prefs.showChannels;
                    break;
                case "showScrollBar":
                    this._doc.prefs.showScrollBar = !this._doc.prefs.showScrollBar;
                    break;
                case "alwaysFineNoteVol":
                    this._doc.prefs.alwaysFineNoteVol = !this._doc.prefs.alwaysFineNoteVol;
                    break;
                case "enableChannelMuting":
                    this._doc.prefs.enableChannelMuting = !this._doc.prefs.enableChannelMuting;
                    for (const channel of this._doc.song.channels)
                        channel.muted = false;
                    break;
                case "displayBrowserUrl":
                    this._doc.toggleDisplayBrowserUrl();
                    break;
                case "displayVolumeBar":
                    this._doc.prefs.displayVolumeBar = !this._doc.prefs.displayVolumeBar;
                    break;
                case "layout":
                    this._openPrompt("layout");
                    break;
                case "colorTheme":
                    this._openPrompt("theme");
                    break;
                case "recordingSetup":
                    this._openPrompt("recordingSetup");
                    break;
            }
            this._optionsMenu.selectedIndex = 0;
            this._doc.notifier.changed();
            this._doc.prefs.save();
        };
        this._customWavePresetHandler = (event) => {
            let customWaveArray = new Float32Array(64);
            let index = this._customWavePresetDrop.selectedIndex - 1;
            let maxValue = Number.MIN_VALUE;
            let minValue = Number.MAX_VALUE;
            let arrayPoint = 0;
            let arrayStep = (Config.chipWaves[index].samples.length - 1) / 64.0;
            for (let i = 0; i < 64; i++) {
                customWaveArray[i] = (Config.chipWaves[index].samples[Math.floor(arrayPoint)] - Config.chipWaves[index].samples[(Math.floor(arrayPoint) + 1)]) / arrayStep;
                if (customWaveArray[i] < minValue)
                    minValue = customWaveArray[i];
                if (customWaveArray[i] > maxValue)
                    maxValue = customWaveArray[i];
                arrayPoint += arrayStep;
            }
            for (let i = 0; i < 64; i++) {
                customWaveArray[i] -= minValue;
                customWaveArray[i] /= (maxValue - minValue);
                customWaveArray[i] *= 48.0;
                customWaveArray[i] -= 24.0;
                customWaveArray[i] = Math.ceil(customWaveArray[i]);
                this._customWaveDrawCanvas.newArray[i] = customWaveArray[i];
            }
            this._doc.record(new ChangeCustomWave(this._doc, customWaveArray));
            this._doc.record(new ChangeVolume(this._doc, +this._instrumentVolumeSlider.input.value, -Config.volumeRange / 2 + Math.round(Math.sqrt(Config.chipWaves[index].expression) * Config.volumeRange / 2)));
            this._customWavePresetDrop.selectedIndex = 0;
            this._doc.notifier.changed();
            this._doc.prefs.save();
        };
        this._doc.notifier.watch(this.whenUpdated);
        new MidiInputHandler(this._doc);
        window.addEventListener("resize", this.whenUpdated);
        window.requestAnimationFrame(this.updatePlayButton);
        window.requestAnimationFrame(this._animate);
        if (!("share" in navigator)) {
            this._fileMenu.removeChild(this._fileMenu.querySelector("[value='shareUrl']"));
        }
        this._scaleSelect.appendChild(optgroup({ label: "Edit" }, option({ value: "forceScale" }, "Snap Notes To Scale"), option({ value: "customize" }, "Edit Custom Scale")));
        this._keySelect.appendChild(optgroup({ label: "Edit" }, option({ value: "detectKey" }, "Detect Key")));
        this._rhythmSelect.appendChild(optgroup({ label: "Edit" }, option({ value: "forceRhythm" }, "Snap Notes To Rhythm")));
        this._vibratoSelect.appendChild(option({ hidden: true, value: 5 }, "custom"));
        this._showModSliders = new Array(Config.modulators.length);
        this._modSliderValues = new Array(Config.modulators.length);
        this._phaseModGroup.appendChild(div({ class: "selectRow", style: `color: ${ColorConfig.secondaryText}; height: 1em; margin-top: 0.5em;` }, div({ style: "margin-right: .1em; visibility: hidden;" }, 1 + "."), div({ style: "width: 3em; margin-right: .3em;", class: "tip", onclick: () => this._openPrompt("operatorFrequency") }, "Freq:"), div({ class: "tip", onclick: () => this._openPrompt("operatorVolume") }, "Volume:")));
        for (let i = 0; i < Config.operatorCount + 2; i++) {
            const operatorIndex = i;
            const operatorNumber = div({ style: "margin-right: 0px; color: " + ColorConfig.secondaryText + ";" }, i + 1 + "");
            const frequencySelect = buildOptions(select({ style: "width: 100%;", title: "Frequency" }), Config.operatorFrequencies.map(freq => freq.name));
            const amplitudeSlider = new Slider(input({ type: "range", min: "0", max: Config.operatorAmplitudeMax, value: "0", step: "1", title: "Volume" }), this._doc, (oldValue, newValue) => new ChangeOperatorAmplitude(this._doc, operatorIndex, oldValue, newValue), false);
            const waveformSelect = buildOptions(select({ style: "width: 100%;", title: "Waveform" }), Config.operatorWaves.map(wave => wave.name));
            const waveformDropdown = button({ style: "margin-left:0em; margin-right: 2px; height:1.5em; width: 8px; max-width: 10px; padding: 0px; font-size: 8px;", onclick: () => this._toggleDropdownMenu(4, i) }, "▼");
            const waveformDropdownHint = span({ class: "tip", style: "margin-left: 10px;", onclick: () => this._openPrompt("operatorWaveform") }, "Wave:");
            const waveformPulsewidthSlider = new Slider(input({ style: "margin-left: 10px; width: 85%;", type: "range", min: "0", max: Config.pwmOperatorWaves.length - 1, value: "0", step: "1", title: "Pulse Width" }), this._doc, (oldValue, newValue) => new ChangeOperatorPulseWidth(this._doc, operatorIndex, oldValue, newValue), true);
            const waveformDropdownRow = div({ class: "selectRow" }, waveformDropdownHint, waveformPulsewidthSlider.container, div({ class: "selectContainer", style: "width: 6em; margin-left: .3em;" }, waveformSelect));
            const waveformDropdownGroup = div({ class: "operatorRow" }, waveformDropdownRow);
            const row = div({ class: "selectRow" }, operatorNumber, waveformDropdown, div({ class: "selectContainer", style: "width: 3em; margin-right: .3em;" }, frequencySelect), amplitudeSlider.container);
            this._phaseModGroup.appendChild(row);
            this._operatorRows[i] = row;
            this._operatorAmplitudeSliders[i] = amplitudeSlider;
            this._operatorFrequencySelects[i] = frequencySelect;
            this._operatorDropdowns[i] = waveformDropdown;
            this._operatorWaveformHints[i] = waveformDropdownHint;
            this._operatorWaveformSelects[i] = waveformSelect;
            this._operatorWaveformPulsewidthSliders[i] = waveformPulsewidthSlider;
            this._operatorDropdownRows[i] = waveformDropdownRow;
            this._phaseModGroup.appendChild(waveformDropdownGroup);
            this._operatorDropdownGroups[i] = waveformDropdownGroup;
            this._openOperatorDropdowns[i] = false;
            waveformSelect.addEventListener("change", () => {
                this._doc.record(new ChangeOperatorWaveform(this._doc, operatorIndex, waveformSelect.selectedIndex));
            });
            frequencySelect.addEventListener("change", () => {
                this._doc.record(new ChangeOperatorFrequency(this._doc, operatorIndex, frequencySelect.selectedIndex));
            });
        }
        this._drumsetGroup.appendChild(div({ class: "selectRow" }, span({ class: "tip", onclick: () => this._openPrompt("drumsetEnvelope") }, "Envelope:"), span({ class: "tip", onclick: () => this._openPrompt("drumsetSpectrum") }, "Spectrum:")));
        for (let i = Config.drumCount - 1; i >= 0; i--) {
            const drumIndex = i;
            const spectrumEditor = new SpectrumEditor(this._doc, drumIndex);
            spectrumEditor.container.addEventListener("mousedown", this.refocusStage);
            this._drumsetSpectrumEditors[i] = spectrumEditor;
            const envelopeSelect = buildOptions(select({ style: "width: 100%;", title: "Filter Envelope" }), Config.envelopes.map(envelope => envelope.name));
            this._drumsetEnvelopeSelects[i] = envelopeSelect;
            envelopeSelect.addEventListener("change", () => {
                this._doc.record(new ChangeDrumsetEnvelope(this._doc, drumIndex, envelopeSelect.selectedIndex));
            });
            const row = div({ class: "selectRow" }, div({ class: "selectContainer", style: "width: 5em; margin-right: .3em;" }, envelopeSelect), this._drumsetSpectrumEditors[i].container);
            this._drumsetGroup.appendChild(row);
        }
        this._modNameRows = [];
        this._modChannelBoxes = [];
        this._modInstrumentBoxes = [];
        this._modSetRows = [];
        this._modSetBoxes = [];
        this._modFilterRows = [];
        this._modFilterBoxes = [];
        this._modTargetIndicators = [];
        for (let mod = 0; mod < Config.modCount; mod++) {
            let modChannelBox = select({ style: "width: 100%; color: currentColor; text-overflow:ellipsis;" });
            let modInstrumentBox = select({ style: "width: 100%; color: currentColor;" });
            let modNameRow = div({ class: "operatorRow", style: "height: 1em; margin-bottom: 0.65em;" }, div({ class: "tip", style: "width: 10%; max-width: 5.4em;", id: "modChannelText" + mod, onclick: () => this._openPrompt("modChannel") }, "Ch:"), div({ class: "selectContainer", style: 'width: 35%;' }, modChannelBox), div({ class: "tip", style: "width: 1.2em; margin-left: 0.8em;", id: "modInstrumentText" + mod, onclick: () => this._openPrompt("modInstrument") }, "Ins:"), div({ class: "selectContainer", style: "width: 10%;" }, modInstrumentBox));
            let modSetBox = select();
            let modFilterBox = select();
            let modSetRow = div({ class: "selectRow", id: "modSettingText" + mod, style: "margin-bottom: 0.9em; color: currentColor;" }, span({ class: "tip", onclick: () => this._openPrompt("modSet") }, "Setting: "), span({ class: "tip", style: "font-size:x-small;", onclick: () => this._openPrompt("modSetInfo" + mod) }, "?"), div({ class: "selectContainer" }, modSetBox));
            let modFilterRow = div({ class: "selectRow", id: "modFilterText" + mod, style: "margin-bottom: 0.9em; color: currentColor;" }, span({ class: "tip", onclick: () => this._openPrompt("modFilter" + mod) }, "Target: "), div({ class: "selectContainer" }, modFilterBox));
            let modTarget = SVG.svg({ style: "transform: translate(0px, 1px);", width: "1.5em", height: "1em", viewBox: "0 0 200 200" }, [
                SVG.path({ d: "M90 155 l0 -45 -45 0 c-25 0 -45 -4 -45 -10 0 -5 20 -10 45 -10 l45 0 0 -45 c0 -25 5 -45 10 -45 6 0 10 20 10 45 l0 45 45 0 c25 0 45 5 45 10 0 6 -20 10 -45 10 l -45 0 0 45 c0 25 -4 45 -10 45 -5 0 -10 -20 -10 -45z" }),
                SVG.path({ d: "M42 158 c-15 -15 -16 -38 -2 -38 6 0 10 7 10 15 0 8 7 15 15 15 8 0 15 5 15 10 0 14 -23 13 -38 -2z" }),
                SVG.path({ d: "M120 160 c0 -5 7 -10 15 -10 8 0 15 -7 15 -15 0 -8 5 -15 10 -15 14 0 13 23 -2 38 -15 15 -38 16 -38 2z" }),
                SVG.path({ d: "M32 58 c3 -23 48 -40 48 -19 0 6 -7 11 -15 11 -8 0 -15 7 -15 15 0 8 -5 15 -11 15 -6 0 -9 -10 -7 -22z" }),
                SVG.path({ d: "M150 65 c0 -8 -7 -15 -15 -15 -8 0 -15 -4 -15 -10 0 -14 23 -13 38 2 15 15 16 38 2 38 -5 0 -10 -7 -10 -15z" })
            ]);
            this._modNameRows.push(modNameRow);
            this._modChannelBoxes.push(modChannelBox);
            this._modInstrumentBoxes.push(modInstrumentBox);
            this._modSetRows.push(modSetRow);
            this._modSetBoxes.push(modSetBox);
            this._modFilterRows.push(modFilterRow);
            this._modFilterBoxes.push(modFilterBox);
            this._modTargetIndicators.push(modTarget);
            this._modulatorGroup.appendChild(div({ style: "margin: 3px 0; font-weight: bold; margin-bottom: 0.7em; text-align: center; color: " + ColorConfig.secondaryText + "; background: " + ColorConfig.uiWidgetBackground + ";" }, ["Modulator " + (mod + 1), modTarget]));
            this._modulatorGroup.appendChild(modNameRow);
            this._modulatorGroup.appendChild(modSetRow);
            this._modulatorGroup.appendChild(modFilterRow);
        }
        this._pitchShiftSlider.container.style.setProperty("transform", "translate(0px, 3px)");
        this._pitchShiftSlider.container.style.setProperty("width", "100%");
        this._fileMenu.addEventListener("change", this._fileMenuHandler);
        this._editMenu.addEventListener("change", this._editMenuHandler);
        this._optionsMenu.addEventListener("change", this._optionsMenuHandler);
        this._customWavePresetDrop.addEventListener("change", this._customWavePresetHandler);
        this._tempoStepper.addEventListener("change", this._whenSetTempo);
        this._scaleSelect.addEventListener("change", this._whenSetScale);
        this._keySelect.addEventListener("change", this._whenSetKey);
        this._rhythmSelect.addEventListener("change", this._whenSetRhythm);
        this._algorithmSelect.addEventListener("change", this._whenSetAlgorithm);
        this._instrumentsButtonBar.addEventListener("click", this._whenSelectInstrument);
        this._feedbackTypeSelect.addEventListener("change", this._whenSetFeedbackType);
        this._algorithm6OpSelect.addEventListener("change", this._whenSet6OpAlgorithm);
        this._feedback6OpTypeSelect.addEventListener("change", this._whenSet6OpFeedbackType);
        this._chipWaveSelect.addEventListener("change", this._whenSetChipWave);
        this._chipNoiseSelect.addEventListener("change", this._whenSetNoiseWave);
        this._transitionSelect.addEventListener("change", this._whenSetTransition);
        this._effectsSelect.addEventListener("change", this._whenSetEffects);
        this._unisonSelect.addEventListener("change", this._whenSetUnison);
        this._chordSelect.addEventListener("change", this._whenSetChord);
        this._vibratoSelect.addEventListener("change", this._whenSetVibrato);
        this._vibratoTypeSelect.addEventListener("change", this._whenSetVibratoType);
        this._playButton.addEventListener("click", this.togglePlay);
        this._pauseButton.addEventListener("click", this.togglePlay);
        this._recordButton.addEventListener("click", this._toggleRecord);
        this._stopButton.addEventListener("click", this._toggleRecord);
        this._recordButton.addEventListener("contextmenu", (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
                this._toggleRecord();
            }
        });
        this._stopButton.addEventListener("contextmenu", (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
                this._toggleRecord();
            }
        });
        this._prevBarButton.addEventListener("click", this._whenPrevBarPressed);
        this._nextBarButton.addEventListener("click", this._whenNextBarPressed);
        this._volumeSlider.input.addEventListener("input", this._setVolumeSlider);
        this._zoomInButton.addEventListener("click", this._zoomIn);
        this._zoomOutButton.addEventListener("click", this._zoomOut);
        this._patternArea.addEventListener("mousedown", this._refocusStageNotEditing);
        this._trackArea.addEventListener("mousedown", this.refocusStage);
        this._volumeSlider.container.style.setProperty("flex-grow", "1");
        this._volumeSlider.container.style.setProperty("display", "flex");
        this._volumeBarContainer.style.setProperty("flex-grow", "1");
        this._volumeBarContainer.style.setProperty("display", "flex");
        this._volumeSlider.container.style.setProperty("--mod-color", ColorConfig.multiplicativeModSlider);
        this._volumeSlider.container.style.setProperty("--mod-border-radius", "50%");
        this._instrumentVolumeSlider.container.style.setProperty("--mod-color", ColorConfig.multiplicativeModSlider);
        this._instrumentVolumeSlider.container.style.setProperty("--mod-border-radius", "50%");
        this._feedbackAmplitudeSlider.container.style.setProperty("--mod-color", ColorConfig.multiplicativeModSlider);
        this._feedbackAmplitudeSlider.container.style.setProperty("--mod-border-radius", "50%");
        for (let i = 0; i < Config.operatorCount + 2; i++) {
            this._operatorAmplitudeSliders[i].container.style.setProperty("--mod-color", ColorConfig.multiplicativeModSlider);
            this._operatorAmplitudeSliders[i].container.style.setProperty("--mod-border-radius", "50%");
        }
        let thisRef = this;
        for (let mod = 0; mod < Config.modCount; mod++) {
            this._modChannelBoxes[mod].addEventListener("change", function () { thisRef._whenSetModChannel(mod); });
            this._modInstrumentBoxes[mod].addEventListener("change", function () { thisRef._whenSetModInstrument(mod); });
            this._modSetBoxes[mod].addEventListener("change", function () { thisRef._whenSetModSetting(mod); });
            this._modFilterBoxes[mod].addEventListener("change", function () { thisRef._whenSetModFilter(mod); });
            this._modTargetIndicators[mod].addEventListener("click", function () { thisRef._whenClickModTarget(mod); });
        }
        this._jumpToModIndicator.addEventListener("click", function () { thisRef._whenClickJumpToModTarget(); });
        this._patternArea.addEventListener("mousedown", this.refocusStage);
        this._fadeInOutEditor.container.addEventListener("mousedown", this.refocusStage);
        this._spectrumEditor.container.addEventListener("mousedown", this.refocusStage);
        this._eqFilterEditor.container.addEventListener("mousedown", this.refocusStage);
        this._noteFilterEditor.container.addEventListener("mousedown", this.refocusStage);
        this._harmonicsEditor.container.addEventListener("mousedown", this.refocusStage);
        this._tempoStepper.addEventListener("keydown", this._tempoStepperCaptureNumberKeys, false);
        this._addEnvelopeButton.addEventListener("click", this._addNewEnvelope);
        this._patternArea.addEventListener("contextmenu", this._disableCtrlContextMenu);
        this._trackArea.addEventListener("contextmenu", this._disableCtrlContextMenu);
        this.mainLayer.addEventListener("keydown", this._whenKeyPressed);
        this.mainLayer.addEventListener("keyup", this._whenKeyReleased);
        this.mainLayer.addEventListener("focusin", this._onFocusIn);
        this._instrumentCopyButton.addEventListener("click", this._copyInstrument.bind(this));
        this._instrumentPasteButton.addEventListener("click", this._pasteInstrument.bind(this));
        this._instrumentVolumeSliderInputBox.addEventListener("input", () => { this._doc.record(new ChangeVolume(this._doc, this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()].volume, Math.min(25.0, Math.max(-25.0, Math.round(+this._instrumentVolumeSliderInputBox.value))))); });
        this._panSliderInputBox.addEventListener("input", () => { this._doc.record(new ChangePan(this._doc, this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()].pan, Math.min(100.0, Math.max(0.0, Math.round(+this._panSliderInputBox.value))))); });
        this._detuneSliderInputBox.addEventListener("input", () => { this._doc.record(new ChangeDetune(this._doc, this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()].detune, Math.min(Config.detuneMax - Config.detuneCenter, Math.max(Config.detuneMin - Config.detuneCenter, Math.round(+this._detuneSliderInputBox.value))))); });
        this._customWaveDraw.addEventListener("input", () => { this._doc.record(new ChangeCustomWave(this._doc, this._customWaveDrawCanvas.newArray)); });
        this._twoNoteArpBox.addEventListener("input", () => { this._doc.record(new ChangeFastTwoNoteArp(this._doc, this._twoNoteArpBox.checked)); });
        this._clicklessTransitionBox.addEventListener("input", () => { this._doc.record(new ChangeClicklessTransition(this._doc, this._clicklessTransitionBox.checked)); });
        this._aliasingBox.addEventListener("input", () => { this._doc.record(new ChangeAliasing(this._doc, this._aliasingBox.checked)); });
        this._promptContainer.addEventListener("click", (event) => {
            if (event.target == this._promptContainer) {
                this._doc.undo();
            }
        });
        if (isMobile) {
            const autoPlayOption = this._optionsMenu.querySelector("[value=autoPlay]");
            autoPlayOption.disabled = true;
            autoPlayOption.setAttribute("hidden", "");
        }
        if (window.screen.availWidth < 710) {
            const layoutOption = this._optionsMenu.querySelector("[value=layout]");
            layoutOption.disabled = true;
            layoutOption.setAttribute("hidden", "");
        }
    }
    _toggleAlgorithmCanvas(e) {
        if (this._customAlgorithmCanvas.mode != "feedback") {
            this._customAlgorithmCanvas.mode = "feedback";
            e.target.textContent = "A";
            this._algorithmCanvasSwitch.value = "feedback";
        }
        else {
            this._customAlgorithmCanvas.mode = "algorithm";
            e.target.textContent = "F";
        }
        this._customAlgorithmCanvas.redrawCanvas();
    }
    _toggleDropdownMenu(dropdown, submenu = 0) {
        let target = this._vibratoDropdown;
        let group = this._vibratoDropdownGroup;
        switch (dropdown) {
            case 0:
                target = this._vibratoDropdown;
                this._openVibratoDropdown = this._openVibratoDropdown ? false : true;
                group = this._vibratoDropdownGroup;
                break;
            case 1:
                target = this._panDropdown;
                this._openPanDropdown = this._openPanDropdown ? false : true;
                group = this._panDropdownGroup;
                break;
            case 2:
                target = this._chordDropdown;
                this._openChordDropdown = this._openChordDropdown ? false : true;
                group = this._chordDropdownGroup;
                break;
            case 3:
                target = this._transitionDropdown;
                this._openTransitionDropdown = this._openTransitionDropdown ? false : true;
                group = this._transitionDropdownGroup;
                break;
            case 4:
                target = this._operatorDropdowns[submenu];
                this._openOperatorDropdowns[submenu] = this._openOperatorDropdowns[submenu] ? false : true;
                group = this._operatorDropdownGroups[submenu];
                break;
        }
        if (target.textContent == "▼") {
            let instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
            target.textContent = "▲";
            if (group != this._chordDropdownGroup) {
                group.style.display = "";
            }
            else if (instrument.chord == Config.chords.dictionary["arpeggio"].index) {
                group.style.display = "";
            }
        }
        else {
            target.textContent = "▼";
            group.style.display = "none";
        }
    }
    _modSliderUpdate() {
        if (!this._doc.synth.playing) {
            this._hasActiveModSliders = false;
            for (let setting = 0; setting < Config.modulators.length; setting++) {
                if (this._showModSliders[setting] == true) {
                    this._showModSliders[setting] = false;
                    this._newShowModSliders[setting] = false;
                    let slider = this._getSliderForModSetting(setting);
                    if (slider != null) {
                        slider.container.classList.remove("modSlider");
                    }
                }
            }
        }
        else {
            let instrument = this._doc.getCurrentInstrument();
            const anyModActive = this._doc.synth.isAnyModActive(this._doc.channel, instrument);
            if (anyModActive) {
                let instrument = this._doc.getCurrentInstrument();
                function updateModSlider(editor, slider, setting, channel, instrument) {
                    if (editor._doc.synth.isModActive(setting, channel, instrument)) {
                        let currentVal = (editor._doc.synth.getModValue(setting, channel, instrument, false) - Config.modulators[setting].convertRealFactor) / Config.modulators[setting].maxRawVol;
                        if (currentVal != editor._modSliderValues[setting]) {
                            editor._modSliderValues[setting] = currentVal;
                            slider.container.style.setProperty("--mod-position", (currentVal * 96.0 + 2.0) + "%");
                        }
                        return true;
                    }
                    return false;
                }
                for (let setting = 0; setting < Config.modulators.length; setting++) {
                    this._newShowModSliders[setting] = this._showModSliders[setting];
                    let slider = this._getSliderForModSetting(setting);
                    if (slider != null) {
                        this._newShowModSliders[setting] = updateModSlider(this, slider, setting, this._doc.channel, instrument);
                    }
                }
            }
            else if (this._hasActiveModSliders) {
                for (let setting = 0; setting < Config.modulators.length; setting++) {
                    this._newShowModSliders[setting] = false;
                }
            }
            if (anyModActive || this._hasActiveModSliders) {
                let anySliderActive = false;
                for (let setting = 0; setting < Config.modulators.length; setting++) {
                    if (this._newShowModSliders[setting] != this._showModSliders[setting]) {
                        this._showModSliders[setting] = this._newShowModSliders[setting];
                        let slider = this._getSliderForModSetting(setting);
                        if (slider != null) {
                            if (this._showModSliders[setting] == true) {
                                slider.container.classList.add("modSlider");
                            }
                            else {
                                slider.container.classList.remove("modSlider");
                            }
                        }
                    }
                    if (this._newShowModSliders[setting] == true)
                        anySliderActive = true;
                }
                this._hasActiveModSliders = anySliderActive;
            }
        }
    }
    _getSliderForModSetting(setting) {
        switch (setting) {
            case Config.modulators.dictionary["pan"].index:
                return this._panSlider;
            case Config.modulators.dictionary["detune"].index:
                return this._detuneSlider;
            case Config.modulators.dictionary["fm slider 1"].index:
                return this._operatorAmplitudeSliders[0];
            case Config.modulators.dictionary["fm slider 2"].index:
                return this._operatorAmplitudeSliders[1];
            case Config.modulators.dictionary["fm slider 3"].index:
                return this._operatorAmplitudeSliders[2];
            case Config.modulators.dictionary["fm slider 4"].index:
                return this._operatorAmplitudeSliders[3];
            case Config.modulators.dictionary["fm feedback"].index:
                return this._feedbackAmplitudeSlider;
            case Config.modulators.dictionary["pulse width"].index:
                return this._pulseWidthSlider;
            case Config.modulators.dictionary["reverb"].index:
                return this._reverbSlider;
            case Config.modulators.dictionary["distortion"].index:
                return this._distortionSlider;
            case Config.modulators.dictionary["note volume"].index:
                if (!this._showModSliders[Config.modulators.dictionary["mix volume"].index])
                    return this._instrumentVolumeSlider;
                return null;
            case Config.modulators.dictionary["mix volume"].index:
                return this._instrumentVolumeSlider;
            case Config.modulators.dictionary["vibrato depth"].index:
                return this._vibratoDepthSlider;
            case Config.modulators.dictionary["vibrato speed"].index:
                return this._vibratoSpeedSlider;
            case Config.modulators.dictionary["vibrato delay"].index:
                return this._vibratoDelaySlider;
            case Config.modulators.dictionary["arp speed"].index:
                return this._arpeggioSpeedSlider;
            case Config.modulators.dictionary["pan delay"].index:
                return this._panDelaySlider;
            case Config.modulators.dictionary["tempo"].index:
                return this._tempoSlider;
            case Config.modulators.dictionary["song volume"].index:
                return this._volumeSlider;
            case Config.modulators.dictionary["eq filt cut"].index:
                return this._eqFilterSimpleCutSlider;
            case Config.modulators.dictionary["eq filt peak"].index:
                return this._eqFilterSimplePeakSlider;
            case Config.modulators.dictionary["note filt cut"].index:
                return this._noteFilterSimpleCutSlider;
            case Config.modulators.dictionary["note filt peak"].index:
                return this._noteFilterSimplePeakSlider;
            case Config.modulators.dictionary["bit crush"].index:
                return this._bitcrusherQuantizationSlider;
            case Config.modulators.dictionary["freq crush"].index:
                return this._bitcrusherFreqSlider;
            case Config.modulators.dictionary["pitch shift"].index:
                return this._pitchShiftSlider;
            case Config.modulators.dictionary["chorus"].index:
                return this._chorusSlider;
            case Config.modulators.dictionary["echo"].index:
                return this._echoSustainSlider;
            case Config.modulators.dictionary["echo delay"].index:
                return this._echoDelaySlider;
            case Config.modulators.dictionary["sustain"].index:
                return this._stringSustainSlider;
            case Config.modulators.dictionary["fm slider 5"].index:
                return this._operatorAmplitudeSliders[4];
            case Config.modulators.dictionary["fm slider 6"].index:
                return this._operatorAmplitudeSliders[5];
            default:
                return null;
        }
    }
    _openPrompt(promptName) {
        this._doc.openPrompt(promptName);
        this._setPrompt(promptName);
    }
    _setPrompt(promptName) {
        if (this._currentPromptName == promptName)
            return;
        this._currentPromptName = promptName;
        if (this.prompt) {
            if (this._wasPlaying && !(this.prompt instanceof TipPrompt || this.prompt instanceof LimiterPrompt || this.prompt instanceof CustomScalePrompt || this.prompt instanceof CustomChipPrompt || this.prompt instanceof CustomFilterPrompt)) {
                this._doc.performance.play();
            }
            this._wasPlaying = false;
            this._promptContainer.style.display = "none";
            this._promptContainer.removeChild(this.prompt.container);
            this.prompt.cleanUp();
            this.prompt = null;
            this.refocusStage();
        }
        if (promptName) {
            switch (promptName) {
                case "export":
                    this.prompt = new ExportPrompt(this._doc);
                    break;
                case "import":
                    this.prompt = new ImportPrompt(this._doc);
                    break;
                case "songRecovery":
                    this.prompt = new SongRecoveryPrompt(this._doc);
                    break;
                case "barCount":
                    this.prompt = new SongDurationPrompt(this._doc);
                    break;
                case "beatsPerBar":
                    this.prompt = new BeatsPerBarPrompt(this._doc);
                    break;
                case "moveNotesSideways":
                    this.prompt = new MoveNotesSidewaysPrompt(this._doc);
                    break;
                case "channelSettings":
                    this.prompt = new ChannelSettingsPrompt(this._doc);
                    break;
                case "limiterSettings":
                    this.prompt = new LimiterPrompt(this._doc, this);
                    break;
                case "customScale":
                    this.prompt = new CustomScalePrompt(this._doc);
                    break;
                case "customChipSettings":
                    this.prompt = new CustomChipPrompt(this._doc, this);
                    break;
                case "customEQFilterSettings":
                    this.prompt = new CustomFilterPrompt(this._doc, this, false);
                    break;
                case "customNoteFilterSettings":
                    this.prompt = new CustomFilterPrompt(this._doc, this, true);
                    break;
                case "theme":
                    this.prompt = new ThemePrompt(this._doc);
                    break;
                case "layout":
                    this.prompt = new LayoutPrompt(this._doc);
                    break;
                case "recordingSetup":
                    this.prompt = new RecordingSetupPrompt(this._doc);
                    break;
                default:
                    this.prompt = new TipPrompt(this._doc, promptName);
                    break;
            }
            if (this.prompt) {
                if (!(this.prompt instanceof TipPrompt || this.prompt instanceof LimiterPrompt || this.prompt instanceof CustomChipPrompt || this.prompt instanceof CustomFilterPrompt)) {
                    this._wasPlaying = this._doc.synth.playing;
                    this._doc.performance.pause();
                }
                this._promptContainer.style.display = "";
                this._promptContainer.appendChild(this.prompt.container);
            }
        }
    }
    changeBarScrollPos(offset) {
        this._barScrollBar.changePos(offset);
    }
    _renderInstrumentBar(channel, instrumentIndex, colors) {
        if (this._doc.song.layeredInstruments || this._doc.song.patternInstruments) {
            this._instrumentsButtonRow.style.display = "";
            this._instrumentsButtonBar.style.setProperty("--text-color-lit", colors.primaryNote);
            this._instrumentsButtonBar.style.setProperty("--text-color-dim", colors.secondaryNote);
            this._instrumentsButtonBar.style.setProperty("--background-color-lit", colors.primaryChannel);
            this._instrumentsButtonBar.style.setProperty("--background-color-dim", colors.secondaryChannel);
            const maxInstrumentsPerChannel = this._doc.song.getMaxInstrumentsPerChannel();
            while (this._instrumentButtons.length < channel.instruments.length) {
                const instrumentButton = button(String(this._instrumentButtons.length + 1));
                this._instrumentButtons.push(instrumentButton);
                this._instrumentsButtonBar.insertBefore(instrumentButton, this._instrumentRemoveButton);
            }
            for (let i = this._renderedInstrumentCount; i < channel.instruments.length; i++) {
                this._instrumentButtons[i].style.display = "";
            }
            for (let i = channel.instruments.length; i < this._renderedInstrumentCount; i++) {
                this._instrumentButtons[i].style.display = "none";
            }
            this._renderedInstrumentCount = channel.instruments.length;
            while (this._instrumentButtons.length > maxInstrumentsPerChannel) {
                this._instrumentsButtonBar.removeChild(this._instrumentButtons.pop());
            }
            this._instrumentRemoveButton.style.display = (channel.instruments.length > Config.instrumentCountMin) ? "" : "none";
            this._instrumentAddButton.style.display = (channel.instruments.length < maxInstrumentsPerChannel) ? "" : "none";
            if (channel.instruments.length < maxInstrumentsPerChannel) {
                this._instrumentRemoveButton.classList.remove("last-button");
            }
            else {
                this._instrumentRemoveButton.classList.add("last-button");
            }
            if (channel.instruments.length > 1) {
                if (this._highlightedInstrumentIndex != instrumentIndex) {
                    const oldButton = this._instrumentButtons[this._highlightedInstrumentIndex];
                    if (oldButton != null)
                        oldButton.classList.remove("selected-instrument");
                    const newButton = this._instrumentButtons[instrumentIndex];
                    newButton.classList.add("selected-instrument");
                    this._highlightedInstrumentIndex = instrumentIndex;
                }
            }
            else {
                const oldButton = this._instrumentButtons[this._highlightedInstrumentIndex];
                if (oldButton != null)
                    oldButton.classList.remove("selected-instrument");
                this._highlightedInstrumentIndex = -1;
            }
            if (this._doc.song.layeredInstruments && this._doc.song.patternInstruments && (this._doc.channel < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount)) {
                for (let i = 0; i < channel.instruments.length; i++) {
                    if (this._doc.recentPatternInstruments[this._doc.channel].indexOf(i) != -1) {
                        this._instrumentButtons[i].classList.remove("deactivated");
                    }
                    else {
                        this._instrumentButtons[i].classList.add("deactivated");
                    }
                }
                this._deactivatedInstruments = true;
            }
            else if (this._deactivatedInstruments || (this._doc.channel >= this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount)) {
                for (let i = 0; i < channel.instruments.length; i++) {
                    this._instrumentButtons[i].classList.remove("deactivated");
                }
                this._deactivatedInstruments = false;
            }
            if ((this._doc.song.layeredInstruments && this._doc.song.patternInstruments) && channel.instruments.length > 1 && (this._doc.channel < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount)) {
                for (let i = 0; i < channel.instruments.length; i++) {
                    this._instrumentButtons[i].classList.remove("no-underline");
                }
            }
            else {
                for (let i = 0; i < channel.instruments.length; i++) {
                    this._instrumentButtons[i].classList.add("no-underline");
                }
            }
        }
        else {
            this._instrumentsButtonRow.style.display = "none";
        }
    }
    _usageCheck(channelIndex, instrumentIndex) {
        var instrumentUsed = false;
        var patternUsed = false;
        var modUsed = false;
        const channel = this._doc.song.channels[channelIndex];
        if (channelIndex < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
            for (let modChannelIdx = this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount; modChannelIdx < this._doc.song.channels.length; modChannelIdx++) {
                const modChannel = this._doc.song.channels[modChannelIdx];
                const patternIdx = modChannel.bars[this._doc.bar];
                if (patternIdx > 0) {
                    const modInstrumentIdx = modChannel.patterns[patternIdx - 1].instruments[0];
                    const modInstrument = modChannel.instruments[modInstrumentIdx];
                    for (let mod = 0; mod < Config.modCount; mod++) {
                        if (modInstrument.modChannels[mod] == channelIndex && (modInstrument.modInstruments[mod] == instrumentIndex || modInstrument.modInstruments[mod] >= channel.instruments.length)) {
                            modUsed = true;
                        }
                    }
                }
            }
        }
        if (channel.bars[this._doc.bar] != 0) {
            let lowestSelX = Math.min(this._doc.selection.boxSelectionX0, this._doc.selection.boxSelectionX1);
            let highestSelX = Math.max(this._doc.selection.boxSelectionX0, this._doc.selection.boxSelectionX1);
            let lowestSelY = Math.min(this._doc.selection.boxSelectionY0, this._doc.selection.boxSelectionY1);
            let highestSelY = Math.max(this._doc.selection.boxSelectionY0, this._doc.selection.boxSelectionY1);
            for (let i = 0; i < this._doc.song.barCount; i++) {
                if (channel.bars[i] == channel.bars[this._doc.bar] && i != this._doc.bar &&
                    (i < lowestSelX || i > highestSelX || this._doc.channel < lowestSelY || this._doc.channel > highestSelY)) {
                    patternUsed = true;
                    i = this._doc.song.barCount;
                }
            }
            for (let i = 0; i < this._doc.song.barCount; i++) {
                if (channel.bars[i] != 0 && channel.bars[i] != channel.bars[this._doc.bar] &&
                    channel.patterns[channel.bars[i] - 1].instruments.includes(instrumentIndex) && i != this._doc.bar &&
                    (i < lowestSelX || i > highestSelX || this._doc.channel < lowestSelY || this._doc.channel > highestSelY)) {
                    instrumentUsed = true;
                    i = this._doc.song.barCount;
                }
            }
        }
        if (patternUsed) {
            this._usedPatternIndicator.style.setProperty("fill", ColorConfig.indicatorPrimary);
        }
        else {
            this._usedPatternIndicator.style.setProperty("fill", ColorConfig.indicatorSecondary);
        }
        if (instrumentUsed) {
            this._usedInstrumentIndicator.style.setProperty("fill", ColorConfig.indicatorPrimary);
        }
        else {
            this._usedInstrumentIndicator.style.setProperty("fill", ColorConfig.indicatorSecondary);
        }
        if (modUsed) {
            this._jumpToModIndicator.style.setProperty("display", "");
            this._jumpToModIndicator.style.setProperty("fill", ColorConfig.indicatorPrimary);
            this._jumpToModIndicator.classList.add("modTarget");
        }
        else if (channelIndex < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
            this._jumpToModIndicator.style.setProperty("display", "");
            this._jumpToModIndicator.style.setProperty("fill", ColorConfig.indicatorSecondary);
            this._jumpToModIndicator.classList.remove("modTarget");
        }
        else {
            this._jumpToModIndicator.style.setProperty("display", "none");
        }
    }
    _copyTextToClipboard(text) {
        let nav;
        nav = navigator;
        if (nav.clipboard && nav.clipboard.writeText) {
            nav.clipboard.writeText(text).catch(() => {
                window.prompt("Copy to clipboard:", text);
            });
            return;
        }
        const textField = document.createElement("textarea");
        textField.textContent = text;
        document.body.appendChild(textField);
        textField.select();
        const succeeded = document.execCommand("copy");
        textField.remove();
        this.refocusStage();
        if (!succeeded)
            window.prompt("Copy this:", text);
    }
    _animateVolume(outVolumeCap, historicOutCap) {
        this._outVolumeBar.setAttribute("width", "" + Math.min(144, outVolumeCap * 144));
        this._outVolumeCap.setAttribute("x", "" + (8 + Math.min(144, historicOutCap * 144)));
    }
    _switchEQFilterType(toSimple) {
        const channel = this._doc.song.channels[this._doc.channel];
        const instrument = channel.instruments[this._doc.getCurrentInstrument()];
        if (instrument.eqFilterType != toSimple) {
            this._doc.record(new ChangeEQFilterType(this._doc, instrument, toSimple));
        }
    }
    _switchNoteFilterType(toSimple) {
        const channel = this._doc.song.channels[this._doc.channel];
        const instrument = channel.instruments[this._doc.getCurrentInstrument()];
        if (instrument.noteFilterType != toSimple) {
            this._doc.record(new ChangeNoteFilterType(this._doc, instrument, toSimple));
        }
    }
    _randomPreset() {
        const isNoise = this._doc.song.getChannelIsNoise(this._doc.channel);
        this._doc.record(new ChangePreset(this._doc, pickRandomPresetValue(isNoise)));
    }
    _randomGenerated() {
        this._doc.record(new ChangeRandomGeneratedInstrument(this._doc));
    }
    _setPreset(preset) {
        if (isNaN(preset)) {
            switch (preset) {
                case "copyInstrument":
                    this._copyInstrument();
                    break;
                case "pasteInstrument":
                    this._pasteInstrument();
                    break;
                case "randomPreset":
                    this._randomPreset();
                    break;
                case "randomGenerated":
                    this._randomGenerated();
                    break;
            }
            this._doc.notifier.changed();
        }
        else {
            this._doc.record(new ChangePreset(this._doc, parseInt(preset)));
        }
    }
}
//# sourceMappingURL=SongEditor.js.map