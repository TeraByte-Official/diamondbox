import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { ColorConfig } from "./ColorConfig";
import { ChangeLimiterSettings } from "./changes";
import { prettyNumber } from "./EditorConfig";
const { button, div, h2, input } = HTML;
export class LimiterCanvas {
    constructor(lim) {
        this._editorWidth = 200;
        this._editorHeight = 52;
        this._fill = SVG.path({ fill: ColorConfig.uiWidgetBackground, "pointer-events": "none" });
        this._ticks = SVG.svg({ "pointer-events": "none" });
        this._subticks = SVG.svg({ "pointer-events": "none" });
        this._boostCurve = SVG.path({ fill: "none", stroke: ColorConfig.textSelection, "stroke-width": 2, "pointer-events": "none" });
        this._boostDot = SVG.circle({ fill: ColorConfig.textSelection, stroke: "none", r: "3" });
        this._midCurve = SVG.path({ fill: "none", stroke: ColorConfig.primaryText, "stroke-width": 2, "pointer-events": "none" });
        this._limitCurve = SVG.path({ fill: "none", stroke: ColorConfig.linkAccent, "stroke-width": 2, "pointer-events": "none" });
        this._limitDot = SVG.circle({ fill: ColorConfig.linkAccent, stroke: "none", r: "3" });
        this._label0 = SVG.text({ x: "-1.5%", y: "148.5%", "pointer-events": "none", "font-size": "7pt", fill: "var(--secondary-text)" }, "0");
        this._label1 = SVG.text({ x: "48.2%", y: "148.5%", "pointer-events": "none", "font-size": "7pt", fill: "var(--secondary-text)" }, "1");
        this._label2 = SVG.text({ x: "98.2%", y: "148.5%", "pointer-events": "none", "font-size": "7pt", fill: "var(--secondary-text)" }, "2");
        this._inLabel = SVG.text({ x: "-5%", y: "113.5%", "pointer-events": "none", "font-size": "6pt", fill: "var(--secondary-text)" }, "In");
        this._outLabel = SVG.text({ x: "-9%", y: "131%", "pointer-events": "none", "font-size": "6pt", fill: "var(--secondary-text)" }, "Out");
        this._xAxisLabel = SVG.text({ x: "42%", y: "172%", "pointer-events": "none", "font-size": "7pt", fill: "var(--primary-text)" }, "Volume");
        this._yAxisLabel = SVG.text({ x: "55.2%", y: "160%", "pointer-events": "none", "font-size": "7pt", transform: "rotate(-90 30,120)", fill: "var(--primary-text)" }, "Gain");
        this._inVolumeBg = SVG.rect({ "pointer-events": "none", width: "100%", height: "6px", x: "0%", y: "105%", fill: ColorConfig.uiWidgetBackground });
        this._outVolumeBg = SVG.rect({ "pointer-events": "none", width: "100%", height: "6px", x: "0%", y: "120%", fill: ColorConfig.uiWidgetBackground });
        this._inVolumeBar = SVG.rect({ "pointer-events": "none", height: "6px", x: "0%", y: "105%", fill: "url('#volumeGrad')" });
        this._inVolumeCap = SVG.rect({ "pointer-events": "none", width: "2px", height: "6px", y: "105%", fill: ColorConfig.uiWidgetFocus });
        this._outVolumeBar = SVG.rect({ "pointer-events": "none", height: "6px", x: "0%", y: "120%", fill: "url('#volumeGrad')" });
        this._outVolumeCap = SVG.rect({ "pointer-events": "none", width: "2px", height: "6px", y: "120%", fill: ColorConfig.uiWidgetFocus });
        this._stop1 = SVG.stop({ "stop-color": "lime", offset: "30%" });
        this._stop2 = SVG.stop({ "stop-color": "orange", offset: "45%" });
        this._stop3 = SVG.stop({ "stop-color": "red", offset: "50%" });
        this._gradient = SVG.linearGradient({ id: "volumeGrad", gradientUnits: "userSpaceOnUse" }, this._stop1, this._stop2, this._stop3);
        this._defs = SVG.defs({}, this._gradient);
        this._svg = SVG.svg({ style: `background-color: ${ColorConfig.editorBackground}; touch-action: none; overflow: visible;`, width: "100%", height: "100%", viewBox: "0 0 " + this._editorWidth + " " + this._editorHeight, preserveAspectRatio: "none" }, this._defs, this._fill, this._ticks, this._subticks, this._boostCurve, this._midCurve, this._limitCurve, this._boostDot, this._limitDot, this._label0, this._label1, this._label2, this._inLabel, this._outLabel, this._xAxisLabel, this._yAxisLabel, this._inVolumeBg, this._outVolumeBg, this._inVolumeBar, this._outVolumeBar, this._inVolumeCap, this._outVolumeCap);
        this.container = HTML.div({ class: "", style: "height: 4em; width: 80%; padding-bottom: 1.5em;" }, this._svg);
        for (let i = 0; i <= 2; i++) {
            this._ticks.appendChild(SVG.rect({ fill: ColorConfig.tonic, x: (i * this._editorWidth / 2) - 1, y: 0, width: 2, height: this._editorHeight }));
        }
        for (let i = 1; i <= 3; i += 2) {
            this._subticks.appendChild(SVG.rect({ fill: ColorConfig.fifthNote, x: (i * this._editorWidth / 4) - 1, y: 0, width: 1, height: this._editorHeight }));
        }
        this._limiterPrompt = lim;
    }
    animateVolume(inVolumeCap, historicInCap, outVolumeCap, historicOutCap) {
        this._inVolumeBar.setAttribute("width", "" + Math.min(this._editorWidth, inVolumeCap * (this._editorWidth / 2.0)));
        this._inVolumeCap.setAttribute("x", "" + Math.min(this._editorWidth, historicInCap * (this._editorWidth / 2.0)));
        this._outVolumeBar.setAttribute("width", "" + Math.min(this._editorWidth, outVolumeCap * (this._editorWidth / 2.0)));
        this._outVolumeCap.setAttribute("x", "" + Math.min(this._editorWidth, historicOutCap * (this._editorWidth / 2.0)));
    }
    render() {
        const controlPointToHeight = (point) => {
            return Math.max(0, (1 - (point / 5)) * (this._editorHeight - 1) + 1);
        };
        let lastValue = 0;
        let currentSubpathIdx = 0;
        let lastSubpathIdx = -1;
        let path = "";
        let subPaths = ["", "", ""];
        for (let i = 0; i < 64; i++) {
            let limiterRatio = +this._limiterPrompt.limitRatioSlider.value;
            limiterRatio = (limiterRatio < 10 ? limiterRatio / 10 : (limiterRatio - 9));
            let compressorRatio = +this._limiterPrompt.compressionRatioSlider.value;
            compressorRatio = (compressorRatio < 10 ? compressorRatio / 10 : (1 + (compressorRatio - 10) / 60));
            let limiterThreshold = +this._limiterPrompt.limitThresholdSlider.value;
            let compressorThreshold = +this._limiterPrompt.compressionThresholdSlider.value;
            let useVol = i * 2.0 / 64.0;
            let nextValue = 1 / 1.05;
            if (useVol >= limiterThreshold) {
                nextValue = 1 / (1.05 * (useVol + 1 - limiterThreshold) * limiterRatio + (1 - limiterRatio));
            }
            else if (useVol < compressorThreshold) {
                nextValue = 1 / (((useVol + 1 - compressorThreshold) * 0.8 + 0.25) * compressorRatio + 1.05 * (1 - compressorRatio));
            }
            if (i == 0) {
                path += "M 0 " + prettyNumber(controlPointToHeight(nextValue)) + " ";
            }
            if (currentSubpathIdx > lastSubpathIdx) {
                if (lastSubpathIdx >= 0) {
                    subPaths[lastSubpathIdx] += "L " + prettyNumber(i * this._editorWidth / 64) + " " + prettyNumber(controlPointToHeight(nextValue)) + " ";
                }
                subPaths[currentSubpathIdx] += "M " + prettyNumber(i * this._editorWidth / 64) + " " + prettyNumber(controlPointToHeight(nextValue)) + " ";
                if (currentSubpathIdx == 1 || (lastSubpathIdx == 0 && currentSubpathIdx == 2)) {
                    this._boostDot.setAttribute("cx", prettyNumber(i * this._editorWidth / 64));
                    this._boostDot.setAttribute("cy", prettyNumber(controlPointToHeight(nextValue)));
                }
                if (currentSubpathIdx == 2) {
                    this._limitDot.setAttribute("cx", prettyNumber(i * this._editorWidth / 64));
                    this._limitDot.setAttribute("cy", prettyNumber(controlPointToHeight(nextValue)));
                }
                lastSubpathIdx = currentSubpathIdx;
            }
            if (lastValue != 0 || nextValue != 0) {
                path += "L ";
                subPaths[currentSubpathIdx] += "L ";
            }
            else {
                path += "M ";
                subPaths[currentSubpathIdx] += "M ";
            }
            path += prettyNumber(i * this._editorWidth / 64) + " " + prettyNumber(controlPointToHeight(nextValue)) + " ";
            subPaths[currentSubpathIdx] += prettyNumber(i * this._editorWidth / 64) + " " + prettyNumber(controlPointToHeight(nextValue)) + " ";
            lastValue = nextValue;
            if (currentSubpathIdx == 0 && (i >= compressorThreshold * 32 - 2)) {
                currentSubpathIdx++;
            }
            if (currentSubpathIdx == 1 && (i >= limiterThreshold * 32 - 2)) {
                currentSubpathIdx++;
            }
        }
        const lastHeight = controlPointToHeight(lastValue);
        if (lastValue > 0) {
            path += "L " + (this._editorWidth - 1) + " " + prettyNumber(lastHeight) + " ";
            subPaths[currentSubpathIdx] += "L " + (this._editorWidth - 1) + " " + prettyNumber(lastHeight) + " ";
        }
        this._boostCurve.setAttribute("d", subPaths[0]);
        this._midCurve.setAttribute("d", subPaths[1]);
        this._limitCurve.setAttribute("d", subPaths[2]);
        this._fill.setAttribute("d", path + "L " + this._editorWidth + " " + prettyNumber(lastHeight) + " L " + this._editorWidth + " " + prettyNumber(this._editorHeight) + " L 0 " + prettyNumber(this._editorHeight) + " z ");
    }
}
export class LimiterPrompt {
    constructor(_doc, _songEditor) {
        this._doc = _doc;
        this._songEditor = _songEditor;
        this.limiterCanvas = new LimiterCanvas(this);
        this._playButton = button({ style: "width: 55%;", type: "button" });
        this.limitDecaySlider = input({ title: "limit decay", style: `width: 5em; flex-grow: 1; margin: 0;`, type: "range", min: "1", max: "30", value: "4", step: "1" });
        this.limitRiseSlider = input({ title: "limit rise", style: `width: 5em; flex-grow: 1; margin: 0;`, type: "range", min: "2000", max: "10000", value: "4000", step: "250" });
        this.compressionThresholdSlider = input({ title: "compressor threshold", style: `width: 100%; flex-grow: 1; margin: 0;`, type: "range", min: "0", max: "1.1", value: "1", step: "0.05" });
        this.limitThresholdSlider = input({ title: "limiter threshold", style: `width: 100%; flex-grow: 1; margin: 0;`, type: "range", min: "0", max: "2", value: "1", step: "0.05" });
        this.compressionRatioSlider = input({ title: "compressor ratio", style: `width: 100%; flex-grow: 1; margin: 0;`, type: "range", min: "0", max: "20", value: "10", step: "1" });
        this.limitRatioSlider = input({ title: "limiter ratio", style: `width: 100%; flex-grow: 1; margin: 0;`, type: "range", min: "0", max: "20", value: "10", step: "1" });
        this.masterGainSlider = input({ title: "master gain", style: `width: 5em; flex-grow: 1; margin: 0;`, type: "range", min: "0", max: "5", value: "1", step: "0.02" });
        this.inVolumeHistoricTimer = 0.0;
        this.inVolumeHistoricCap = 0.0;
        this.outVolumeHistoricTimer = 0.0;
        this.outVolumeHistoricCap = 0.0;
        this._cancelButton = button({ class: "cancelButton" });
        this._okayButton = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this._resetButton = button({ style: "width:45%;" }, "Reset");
        this.container = div({ class: "prompt noSelection", style: "width: 250px;" }, h2("Limiter Options"), div({ style: "display: flex; width: 55%; align-self: center; flex-direction: row; align-items: center; justify-content: center;" }, this._playButton), div({ style: "display: flex; flex-direction: row; align-items: center; justify-content: center;" }, this.limiterCanvas.container), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; margin-top: 1.5em; justify-content: flex-end;" }, div({ style: `text-align: right; width: 25%; margin-right: 4.5%; color: ${ColorConfig.primaryText};` }, ""), div({ style: `text-align: center; width: 33%; margin-right: 4.5%; color: ${ColorConfig.textSelection};` }, "Boost"), div({ style: `text-align: center; width: 33%; margin-right: 0%; color: ${ColorConfig.linkAccent};` }, "Cutoff")), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; margin-top: 0.5em; justify-content: flex-end;" }, div({ style: `text-align: right; width: 25%; margin-right: 4.5%; color: ${ColorConfig.primaryText};` }, "Threshold:"), div({ style: `width: 33%; margin-right: 4.5%;` }, this.compressionThresholdSlider), div({ style: `width: 33%; margin-right: 0%;` }, this.limitThresholdSlider)), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ style: `text-align: right; width: 25%; margin-right: 4.5%; color: ${ColorConfig.primaryText};` }, "Ratio:"), div({ style: `width: 33%; margin-right: 4.5%;` }, this.compressionRatioSlider), div({ style: `width: 33%; margin-right: 0%;` }, this.limitRatioSlider)), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ style: `text-align: right; width: 8.5em; margin-right: 1em; color: ${ColorConfig.primaryText};` }, "Limit Decay:"), this.limitDecaySlider), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ style: `text-align: right; width: 8.5em; margin-right: 1em; color: ${ColorConfig.primaryText};` }, "Limit Rise:"), this.limitRiseSlider), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ style: `text-align: right; width: 8.5em; margin-right: 1em; color: ${ColorConfig.primaryText};` }, "Master Gain:"), this.masterGainSlider), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton, this._resetButton), this._cancelButton);
        this._volumeUpdate = () => {
            this.inVolumeHistoricTimer--;
            if (this.inVolumeHistoricTimer <= 0) {
                this.inVolumeHistoricCap -= 0.03;
            }
            if (this._doc.song.inVolumeCap > this.inVolumeHistoricCap) {
                this.inVolumeHistoricCap = this._doc.song.inVolumeCap;
                this.inVolumeHistoricTimer = 50;
            }
            this.outVolumeHistoricTimer--;
            if (this.outVolumeHistoricTimer <= 0) {
                this.outVolumeHistoricCap -= 0.03;
            }
            if (this._doc.song.outVolumeCap > this.outVolumeHistoricCap) {
                this.outVolumeHistoricCap = this._doc.song.outVolumeCap;
                this.outVolumeHistoricTimer = 50;
            }
            this.limiterCanvas.animateVolume(this._doc.song.inVolumeCap, this.inVolumeHistoricCap, this._doc.song.outVolumeCap, this.outVolumeHistoricCap);
            window.requestAnimationFrame(this._volumeUpdate);
        };
        this._togglePlay = () => {
            this._songEditor.togglePlay();
            this.updatePlayButton();
        };
        this._whenInput = () => {
            if (+this.limitThresholdSlider.value < +this.compressionThresholdSlider.value) {
                this.limitThresholdSlider.removeEventListener("input", this._whenInputFavorLimitThreshold);
                this.limitThresholdSlider.value = this.compressionThresholdSlider.value;
                this.limitThresholdSlider.addEventListener("input", this._whenInputFavorLimitThreshold);
            }
            this.limiterCanvas.render();
            this._updateLimiter();
        };
        this._whenInputFavorLimitThreshold = () => {
            if (+this.limitThresholdSlider.value < +this.compressionThresholdSlider.value) {
                this.compressionThresholdSlider.removeEventListener("input", this._whenInput);
                this.compressionThresholdSlider.value = this.limitThresholdSlider.value;
                this.compressionThresholdSlider.addEventListener("input", this._whenInput);
            }
            this.limiterCanvas.render();
            this._updateLimiter();
        };
        this._close = () => {
            this.limitRatioSlider.value = "" + this.startingLimitRatio;
            this.compressionRatioSlider.value = "" + this.startingCompressionRatio;
            this.limitThresholdSlider.value = "" + this.startingLimitThreshold;
            this.compressionThresholdSlider.value = "" + this.startingCompressionThreshold;
            this.limitDecaySlider.value = "" + this.startingLimitDecay;
            this.limitRiseSlider.value = "" + this.startingLimitRise;
            this.masterGainSlider.value = "" + this.startingMasterGain;
            this._updateLimiter();
            this._doc.prompt = null;
        };
        this.cleanUp = () => {
            this._okayButton.removeEventListener("click", this._saveChanges);
            this._resetButton.removeEventListener("click", this._resetDefaults);
            this._cancelButton.removeEventListener("click", this._close);
            this.container.removeEventListener("keydown", this.whenKeyPressed);
            this.limitDecaySlider.removeEventListener("input", this._whenInput);
            this.limitRiseSlider.removeEventListener("input", this._whenInput);
            this.limitThresholdSlider.removeEventListener("input", this._whenInputFavorLimitThreshold);
            this.limitRatioSlider.removeEventListener("input", this._whenInput);
            this.compressionRatioSlider.removeEventListener("input", this._whenInput);
            this.compressionThresholdSlider.removeEventListener("input", this._whenInput);
            this.masterGainSlider.removeEventListener("input", this._whenInput);
            this._playButton.removeEventListener("click", this._togglePlay);
        };
        this.whenKeyPressed = (event) => {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                this._saveChanges();
            }
            if (event.keyCode == 32) {
                this._togglePlay();
                event.preventDefault();
            }
        };
        this._resetDefaults = () => {
            if (this.limitRatioSlider.value != "10" || this.limitRiseSlider.value != "4000" || this.limitDecaySlider.value != "4" || this.limitThresholdSlider.value != "1" || this.compressionRatioSlider.value != "10" || this.compressionThresholdSlider.value != "1" || this.masterGainSlider.value != "1") {
                this.limitRatioSlider.value = "10";
                this.limitRiseSlider.value = "4000";
                this.limitDecaySlider.value = "4";
                this.limitThresholdSlider.value = "1";
                this.compressionRatioSlider.value = "10";
                this.compressionThresholdSlider.value = "1";
                this.masterGainSlider.value = "1";
                this._whenInput();
            }
        };
        this._updateLimiter = () => {
            this._doc.record(new ChangeLimiterSettings(this._doc, (+this.limitRatioSlider.value < 10 ? +this.limitRatioSlider.value / 10 : (+this.limitRatioSlider.value - 9)), (+this.compressionRatioSlider.value < 10 ? +this.compressionRatioSlider.value / 10 : (1 + (+this.compressionRatioSlider.value - 10) / 60)), +this.limitThresholdSlider.value, +this.compressionThresholdSlider.value, +this.limitRiseSlider.value, +this.limitDecaySlider.value, +this.masterGainSlider.value), true);
        };
        this._saveChanges = () => {
            this._updateLimiter();
            this._doc.prompt = null;
        };
        this._okayButton.addEventListener("click", this._saveChanges);
        this._resetButton.addEventListener("click", this._resetDefaults);
        this._cancelButton.addEventListener("click", this._close);
        this.container.addEventListener("keydown", this.whenKeyPressed);
        this.limitRatioSlider.value = "" + (this._doc.song.limitRatio < 1 ? this._doc.song.limitRatio * 10 : 9 + this._doc.song.limitRatio);
        this.compressionRatioSlider.value = "" + (this._doc.song.compressionRatio < 1 ? this._doc.song.compressionRatio * 10 : 10 + (this._doc.song.compressionRatio - 1) * 60);
        this.limitThresholdSlider.value = "" + this._doc.song.limitThreshold;
        this.compressionThresholdSlider.value = "" + this._doc.song.compressionThreshold;
        this.limitDecaySlider.value = "" + this._doc.song.limitDecay;
        this.limitRiseSlider.value = "" + this._doc.song.limitRise;
        this.masterGainSlider.value = "" + this._doc.song.masterGain;
        this.startingLimitRatio = +this.limitRatioSlider.value;
        this.startingCompressionRatio = +this.compressionRatioSlider.value;
        this.startingLimitThreshold = +this.limitThresholdSlider.value;
        this.startingCompressionThreshold = +this.compressionThresholdSlider.value;
        this.startingLimitDecay = +this.limitDecaySlider.value;
        this.startingLimitRise = +this.limitRiseSlider.value;
        this.startingMasterGain = +this.masterGainSlider.value;
        this.limitDecaySlider.addEventListener("input", this._whenInput);
        this.limitRiseSlider.addEventListener("input", this._whenInput);
        this.limitRatioSlider.addEventListener("input", this._whenInput);
        this.limitThresholdSlider.addEventListener("input", this._whenInputFavorLimitThreshold);
        this.compressionRatioSlider.addEventListener("input", this._whenInput);
        this.compressionThresholdSlider.addEventListener("input", this._whenInput);
        this.masterGainSlider.addEventListener("input", this._whenInput);
        this._playButton.addEventListener("click", this._togglePlay);
        window.requestAnimationFrame(this._volumeUpdate);
        this.updatePlayButton();
        setTimeout(() => this._playButton.focus());
        this.limiterCanvas.render();
    }
    updatePlayButton() {
        if (this._doc.synth.playing) {
            this._playButton.classList.remove("playButton");
            this._playButton.classList.add("pauseButton");
            this._playButton.title = "Pause (Space)";
            this._playButton.innerText = "Pause";
        }
        else {
            this._playButton.classList.remove("pauseButton");
            this._playButton.classList.add("playButton");
            this._playButton.title = "Play (Space)";
            this._playButton.innerText = "Play";
        }
    }
}
//# sourceMappingURL=LimiterPrompt.js.map