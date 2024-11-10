import { Config } from "../synth/SynthConfig";
import { clamp, Synth } from "../synth/synth";
import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { ColorConfig } from "./ColorConfig";
import { ChangeSequence } from "./Change";
import { ChangeFadeInOut } from "./changes";
export class FadeInOutEditor {
    constructor(_doc) {
        this._doc = _doc;
        this._editorWidth = 120;
        this._editorHeight = 26;
        this._fadeCurve = SVG.path({ fill: ColorConfig.uiWidgetBackground, "pointer-events": "none" });
        this._dottedLinePath = SVG.path({ fill: "none", stroke: "currentColor", "stroke-width": 1, "stroke-dasharray": "3, 2", "pointer-events": "none" });
        this._controlCurve = SVG.path({ fill: "none", stroke: "currentColor", "stroke-width": 2, "pointer-events": "none" });
        this._svg = SVG.svg({ style: `background-color: ${ColorConfig.editorBackground}; touch-action: none; cursor: crosshair;`, width: "100%", height: "100%", viewBox: "0 0 " + this._editorWidth + " " + this._editorHeight, preserveAspectRatio: "none" }, this._fadeCurve, this._dottedLinePath, this._controlCurve);
        this.container = HTML.div({ class: "fadeInOut", style: "height: 100%;" }, this._svg);
        this._mouseX = 0;
        this._mouseXStart = 0;
        this._mouseDown = false;
        this._mouseDragging = false;
        this._draggingFadeIn = false;
        this._dragChange = null;
        this._renderedFadeIn = -1;
        this._renderedFadeOut = -1;
        this._whenMousePressed = (event) => {
            event.preventDefault();
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = ((event.clientX || event.pageX) - boundingRect.left);
            this._whenCursorPressed();
        };
        this._whenTouchPressed = (event) => {
            event.preventDefault();
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = (event.touches[0].clientX - boundingRect.left);
            this._whenCursorPressed();
        };
        this._whenMouseMoved = (event) => {
            if (this.container.offsetParent == null)
                return;
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = ((event.clientX || event.pageX) - boundingRect.left);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            this._whenCursorMoved();
        };
        this._whenTouchMoved = (event) => {
            if (this.container.offsetParent == null)
                return;
            if (!this._mouseDown)
                return;
            event.preventDefault();
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = (event.touches[0].clientX - boundingRect.left);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            this._whenCursorMoved();
        };
        this._whenCursorReleased = (event) => {
            if (this.container.offsetParent == null)
                return;
            if (this._mouseDown && this._doc.lastChangeWas(this._dragChange) && this._dragChange != null) {
                if (!this._mouseDragging) {
                    const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
                    if (this._draggingFadeIn) {
                        this._doc.record(new ChangeFadeInOut(this._doc, this._xToFadeIn(this._mouseX), instrument.fadeOut));
                    }
                    else {
                        this._doc.record(new ChangeFadeInOut(this._doc, instrument.fadeIn, this._xToFadeOut(this._mouseX)));
                    }
                }
                else {
                    this._doc.record(this._dragChange);
                }
            }
            this._dragChange = null;
            this._mouseDragging = false;
            this._mouseDown = false;
        };
        const dottedLineX = this._fadeOutToX(Config.fadeOutNeutral);
        this._dottedLinePath.setAttribute("d", `M ${dottedLineX} 0 L ${dottedLineX} ${this._editorHeight}`);
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenCursorReleased);
        this.container.addEventListener("touchcancel", this._whenCursorReleased);
    }
    _fadeInToX(fadeIn) {
        return 1.0 + (this._editorWidth - 2.0) * 0.4 * fadeIn / (Config.fadeInRange - 1);
    }
    _xToFadeIn(x) {
        return clamp(0, Config.fadeInRange, Math.round((x - 1.0) * (Config.fadeInRange - 1) / (0.4 * this._editorWidth - 2.0)));
    }
    _fadeOutToX(fadeOut) {
        return 1.0 + (this._editorWidth - 2.0) * (0.5 + 0.5 * fadeOut / (Config.fadeOutTicks.length - 1));
    }
    _xToFadeOut(x) {
        return clamp(0, Config.fadeOutTicks.length, Math.round((Config.fadeOutTicks.length - 1) * ((x - 1.0) / (this._editorWidth - 2.0) - 0.5) / 0.5));
    }
    _whenCursorPressed() {
        if (isNaN(this._mouseX))
            this._mouseX = 0;
        this._mouseXStart = this._mouseX;
        this._mouseDown = true;
        this._mouseDragging = false;
        const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        const fadeInX = this._fadeInToX(instrument.fadeIn);
        const fadeOutX = this._fadeOutToX(instrument.fadeOut);
        this._draggingFadeIn = this._mouseXStart < (fadeInX + fadeOutX) / 2.0;
        this._dragChange = new ChangeSequence();
        this._doc.setProspectiveChange(this._dragChange);
    }
    _whenCursorMoved() {
        if (this._dragChange != null && this._doc.lastChangeWas(this._dragChange)) {
            this._dragChange.undo();
        }
        else {
            this._mouseDown = false;
        }
        this._dragChange = null;
        if (this._mouseDown) {
            const sequence = new ChangeSequence();
            this._dragChange = sequence;
            this._doc.setProspectiveChange(this._dragChange);
            if (Math.abs(this._mouseX - this._mouseXStart) > 4.0) {
                this._mouseDragging = true;
            }
            if (this._mouseDragging) {
                const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
                if (this._draggingFadeIn) {
                    sequence.append(new ChangeFadeInOut(this._doc, this._xToFadeIn(this._fadeInToX(instrument.fadeIn) + this._mouseX - this._mouseXStart), instrument.fadeOut));
                }
                else {
                    sequence.append(new ChangeFadeInOut(this._doc, instrument.fadeIn, this._xToFadeOut(this._fadeOutToX(instrument.fadeOut) + this._mouseX - this._mouseXStart)));
                }
            }
        }
    }
    render() {
        const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        if (this._renderedFadeIn == instrument.fadeIn && this._renderedFadeOut == instrument.fadeOut) {
            return;
        }
        const fadeInX = this._fadeInToX(instrument.fadeIn);
        const fadeOutX = this._fadeOutToX(instrument.fadeOut);
        this._controlCurve.setAttribute("d", `M ${fadeInX} 0 L ${fadeInX} ${this._editorHeight} M ${fadeOutX} 0 L ${fadeOutX} ${this._editorHeight}`);
        const dottedLineX = this._fadeOutToX(Config.fadeOutNeutral);
        let fadePath = "";
        fadePath += `M 0 ${this._editorHeight} `;
        fadePath += `L ${fadeInX} 0 `;
        if (Synth.fadeOutSettingToTicks(instrument.fadeOut) > 0) {
            fadePath += `L ${dottedLineX} 0 `;
            fadePath += `L ${fadeOutX} ${this._editorHeight} `;
        }
        else {
            fadePath += `L ${fadeOutX} 0 `;
            fadePath += `L ${dottedLineX} ${this._editorHeight} `;
        }
        fadePath += "z";
        this._fadeCurve.setAttribute("d", fadePath);
    }
}
//# sourceMappingURL=FadeInOutEditor.js.map