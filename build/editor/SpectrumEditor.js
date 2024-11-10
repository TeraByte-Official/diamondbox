import { Config } from "../synth/SynthConfig";
import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { ColorConfig } from "./ColorConfig";
import { ChangeSpectrum } from "./changes";
import { prettyNumber } from "./EditorConfig";
export class SpectrumEditor {
    constructor(_doc, _spectrumIndex) {
        this._doc = _doc;
        this._spectrumIndex = _spectrumIndex;
        this._editorWidth = 120;
        this._editorHeight = 26;
        this._fill = SVG.path({ fill: ColorConfig.uiWidgetBackground, "pointer-events": "none" });
        this._octaves = SVG.svg({ "pointer-events": "none" });
        this._fifths = SVG.svg({ "pointer-events": "none" });
        this._curve = SVG.path({ fill: "none", stroke: "currentColor", "stroke-width": 2, "pointer-events": "none" });
        this._arrow = SVG.path({ fill: "currentColor", "pointer-events": "none" });
        this._svg = SVG.svg({ style: `background-color: ${ColorConfig.editorBackground}; touch-action: none; cursor: crosshair;`, width: "100%", height: "100%", viewBox: "0 0 " + this._editorWidth + " " + this._editorHeight, preserveAspectRatio: "none" }, this._fill, this._octaves, this._fifths, this._curve, this._arrow);
        this.container = HTML.div({ class: "spectrum", style: "height: 100%;" }, this._svg);
        this._mouseX = 0;
        this._mouseY = 0;
        this._freqPrev = 0;
        this._ampPrev = 0;
        this._mouseDown = false;
        this._change = null;
        this._renderedPath = "";
        this._renderedFifths = true;
        this._whenMousePressed = (event) => {
            event.preventDefault();
            this._mouseDown = true;
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = ((event.clientX || event.pageX) - boundingRect.left) * this._editorWidth / (boundingRect.right - boundingRect.left);
            this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._freqPrev = this._xToFreq(this._mouseX);
            this._ampPrev = this._yToAmp(this._mouseY);
            this._whenCursorMoved();
        };
        this._whenTouchPressed = (event) => {
            event.preventDefault();
            this._mouseDown = true;
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = (event.touches[0].clientX - boundingRect.left) * this._editorWidth / (boundingRect.right - boundingRect.left);
            this._mouseY = (event.touches[0].clientY - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._freqPrev = this._xToFreq(this._mouseX);
            this._ampPrev = this._yToAmp(this._mouseY);
            this._whenCursorMoved();
        };
        this._whenMouseMoved = (event) => {
            if (this.container.offsetParent == null)
                return;
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = ((event.clientX || event.pageX) - boundingRect.left) * this._editorWidth / (boundingRect.right - boundingRect.left);
            this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._whenCursorMoved();
        };
        this._whenTouchMoved = (event) => {
            if (this.container.offsetParent == null)
                return;
            if (!this._mouseDown)
                return;
            event.preventDefault();
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = (event.touches[0].clientX - boundingRect.left) * this._editorWidth / (boundingRect.right - boundingRect.left);
            this._mouseY = (event.touches[0].clientY - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._whenCursorMoved();
        };
        this._whenCursorReleased = (event) => {
            if (this._mouseDown) {
                this._doc.record(this._change);
                this._change = null;
            }
            this._mouseDown = false;
        };
        for (let i = 0; i < Config.spectrumControlPoints; i += Config.spectrumControlPointsPerOctave) {
            this._octaves.appendChild(SVG.rect({ fill: ColorConfig.tonic, x: (i + 1) * this._editorWidth / (Config.spectrumControlPoints + 2) - 1, y: 0, width: 2, height: this._editorHeight }));
        }
        for (let i = 4; i <= Config.spectrumControlPoints; i += Config.spectrumControlPointsPerOctave) {
            this._fifths.appendChild(SVG.rect({ fill: ColorConfig.fifthNote, x: (i + 1) * this._editorWidth / (Config.spectrumControlPoints + 2) - 1, y: 0, width: 2, height: this._editorHeight }));
        }
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenCursorReleased);
        this.container.addEventListener("touchcancel", this._whenCursorReleased);
    }
    _xToFreq(x) {
        return (Config.spectrumControlPoints + 2) * x / this._editorWidth - 1;
    }
    _yToAmp(y) {
        return Config.spectrumMax * (1 - (y - 1) / (this._editorHeight - 2));
    }
    _whenCursorMoved() {
        if (this._mouseDown) {
            const freq = this._xToFreq(this._mouseX);
            const amp = this._yToAmp(this._mouseY);
            const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
            const spectrumWave = (this._spectrumIndex == null) ? instrument.spectrumWave : instrument.drumsetSpectrumWaves[this._spectrumIndex];
            if (freq != this._freqPrev) {
                const slope = (amp - this._ampPrev) / (freq - this._freqPrev);
                const offset = this._ampPrev - this._freqPrev * slope;
                const lowerFreq = Math.ceil(Math.min(this._freqPrev, freq));
                const upperFreq = Math.floor(Math.max(this._freqPrev, freq));
                for (let i = lowerFreq; i <= upperFreq; i++) {
                    if (i < 0 || i >= Config.spectrumControlPoints)
                        continue;
                    spectrumWave.spectrum[i] = Math.max(0, Math.min(Config.spectrumMax, Math.round(i * slope + offset)));
                }
            }
            spectrumWave.spectrum[Math.max(0, Math.min(Config.spectrumControlPoints - 1, Math.round(freq)))] = Math.max(0, Math.min(Config.spectrumMax, Math.round(amp)));
            this._freqPrev = freq;
            this._ampPrev = amp;
            this._change = new ChangeSpectrum(this._doc, instrument, spectrumWave);
            this._doc.setProspectiveChange(this._change);
        }
    }
    render() {
        const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        const spectrumWave = (this._spectrumIndex == null) ? instrument.spectrumWave : instrument.drumsetSpectrumWaves[this._spectrumIndex];
        const controlPointToHeight = (point) => {
            return (1 - (point / Config.spectrumMax)) * (this._editorHeight - 1) + 1;
        };
        let lastValue = 0;
        let path = "M 0 " + prettyNumber(this._editorHeight) + " ";
        for (let i = 0; i < Config.spectrumControlPoints; i++) {
            let nextValue = spectrumWave.spectrum[i];
            if (lastValue != 0 || nextValue != 0) {
                path += "L ";
            }
            else {
                path += "M ";
            }
            path += prettyNumber((i + 1) * this._editorWidth / (Config.spectrumControlPoints + 2)) + " " + prettyNumber(controlPointToHeight(nextValue)) + " ";
            lastValue = nextValue;
        }
        const lastHeight = controlPointToHeight(lastValue);
        if (lastValue > 0) {
            path += "L " + (this._editorWidth - 1) + " " + prettyNumber(lastHeight) + " ";
        }
        if (this._renderedPath != path) {
            this._renderedPath = path;
            this._curve.setAttribute("d", path);
            this._fill.setAttribute("d", path + "L " + this._editorWidth + " " + prettyNumber(lastHeight) + " L " + this._editorWidth + " " + prettyNumber(this._editorHeight) + " L 0 " + prettyNumber(this._editorHeight) + " z ");
            this._arrow.setAttribute("d", "M " + this._editorWidth + " " + prettyNumber(lastHeight) + " L " + (this._editorWidth - 4) + " " + prettyNumber(lastHeight - 4) + " L " + (this._editorWidth - 4) + " " + prettyNumber(lastHeight + 4) + " z");
            this._arrow.style.display = (lastValue > 0) ? "" : "none";
        }
        if (this._renderedFifths != this._doc.prefs.showFifth) {
            this._renderedFifths = this._doc.prefs.showFifth;
            this._fifths.style.display = this._doc.prefs.showFifth ? "" : "none";
        }
    }
}
//# sourceMappingURL=SpectrumEditor.js.map