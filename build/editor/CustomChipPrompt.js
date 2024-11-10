import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { ColorConfig } from "./ColorConfig";
import { ChangeCustomWave } from "./changes";
const { button, div, h2 } = HTML;
export class CustomChipPromptCanvas {
    constructor(doc) {
        this._mouseX = 0;
        this._mouseY = 0;
        this._lastIndex = 0;
        this._lastAmp = 0;
        this._mouseDown = false;
        this.chipData = new Float32Array(64);
        this.startingChipData = new Float32Array(64);
        this._undoHistoryState = 0;
        this._changeQueue = [];
        this._editorWidth = 768;
        this._editorHeight = 294;
        this._fill = SVG.path({ fill: ColorConfig.uiWidgetBackground, "pointer-events": "none" });
        this._ticks = SVG.svg({ "pointer-events": "none" });
        this._subticks = SVG.svg({ "pointer-events": "none" });
        this._blocks = SVG.svg({ "pointer-events": "none" });
        this._svg = SVG.svg({ style: `background-color: ${ColorConfig.editorBackground}; touch-action: none; overflow: visible;`, width: "100%", height: "100%", viewBox: "0 0 " + this._editorWidth + " " + this._editorHeight, preserveAspectRatio: "none" }, this._fill, this._ticks, this._subticks, this._blocks);
        this.container = HTML.div({ class: "", style: "height: 294px; width: 768px; padding-bottom: 1.5em;" }, this._svg);
        this._storeChange = () => {
            var sameCheck = true;
            if (this._changeQueue.length > 0) {
                for (var i = 0; i < 64; i++) {
                    if (this._changeQueue[this._undoHistoryState][i] != this.chipData[i]) {
                        sameCheck = false;
                        i = 64;
                    }
                }
            }
            if (sameCheck == false || this._changeQueue.length == 0) {
                this._changeQueue.splice(0, this._undoHistoryState);
                this._undoHistoryState = 0;
                this._changeQueue.unshift(this.chipData.slice());
                if (this._changeQueue.length > 32) {
                    this._changeQueue.pop();
                }
            }
        };
        this.undo = () => {
            if (this._undoHistoryState < this._changeQueue.length - 1) {
                this._undoHistoryState++;
                this.chipData = this._changeQueue[this._undoHistoryState].slice();
                new ChangeCustomWave(this._doc, this.chipData);
                this.render();
            }
        };
        this.redo = () => {
            if (this._undoHistoryState > 0) {
                this._undoHistoryState--;
                this.chipData = this._changeQueue[this._undoHistoryState].slice();
                new ChangeCustomWave(this._doc, this.chipData);
                this.render();
            }
        };
        this._whenKeyPressed = (event) => {
            if (event.keyCode == 90) {
                this.undo();
                event.stopPropagation();
            }
            else if (event.keyCode == 89) {
                this.redo();
                event.stopPropagation();
            }
        };
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
            this._lastIndex = -1;
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
            this._lastIndex = -1;
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
            this._storeChange();
            this._mouseDown = false;
        };
        this._doc = doc;
        for (let i = 0; i <= 4; i += 2) {
            this._ticks.appendChild(SVG.rect({ fill: ColorConfig.tonic, x: (i * this._editorWidth / 4) - 1, y: 0, width: 2, height: this._editorHeight }));
        }
        for (let i = 1; i <= 8; i++) {
            this._subticks.appendChild(SVG.rect({ fill: ColorConfig.fifthNote, x: (i * this._editorWidth / 8) - 1, y: 0, width: 1, height: this._editorHeight }));
        }
        this._ticks.appendChild(SVG.rect({ fill: ColorConfig.tonic, x: 0, y: (this._editorHeight / 2) - 1, width: this._editorWidth, height: 2 }));
        for (let i = 0; i < 3; i++) {
            this._subticks.appendChild(SVG.rect({ fill: ColorConfig.fifthNote, x: 0, y: i * 8 * (this._editorHeight / 49), width: this._editorWidth, height: 1 }));
            this._subticks.appendChild(SVG.rect({ fill: ColorConfig.fifthNote, x: 0, y: this._editorHeight - 1 - i * 8 * (this._editorHeight / 49), width: this._editorWidth, height: 1 }));
        }
        let col = ColorConfig.getChannelColor(this._doc.song, this._doc.channel).primaryNote;
        for (let i = 0; i <= 64; i++) {
            let val = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()].customChipWave[i];
            this.chipData[i] = val;
            this.startingChipData[i] = val;
            this._blocks.appendChild(SVG.rect({ fill: col, x: (i * this._editorWidth / 64), y: (val + 24) * (this._editorHeight / 49), width: this._editorWidth / 64, height: this._editorHeight / 49 }));
        }
        this._storeChange();
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenCursorReleased);
        this.container.addEventListener("touchcancel", this._whenCursorReleased);
        this._svg.addEventListener("keydown", this._whenKeyPressed);
        this.container.addEventListener("keydown", this._whenKeyPressed);
    }
    _whenCursorMoved() {
        if (this._mouseDown) {
            const index = Math.min(63, Math.max(0, Math.floor(this._mouseX * 64 / this._editorWidth)));
            const amp = Math.min(48, Math.max(0, Math.floor(this._mouseY * 49 / this._editorHeight)));
            if (this._lastIndex != -1 && this._lastIndex != index) {
                var lowest = index;
                var highest = this._lastIndex;
                var startingAmp = amp;
                var endingAmp = this._lastAmp;
                if (this._lastIndex < index) {
                    lowest = this._lastIndex;
                    highest = index;
                    startingAmp = this._lastAmp;
                    endingAmp = amp;
                }
                for (var i = lowest; i <= highest; i++) {
                    const medAmp = Math.round(startingAmp + (endingAmp - startingAmp) * ((i - lowest) / (highest - lowest)));
                    this.chipData[i] = medAmp - 24;
                    this._blocks.children[i].setAttribute("y", "" + (medAmp * (this._editorHeight / 49)));
                }
            }
            else {
                this.chipData[index] = amp - 24;
                this._blocks.children[index].setAttribute("y", "" + (amp * (this._editorHeight / 49)));
            }
            new ChangeCustomWave(this._doc, this.chipData);
            this._lastIndex = index;
            this._lastAmp = amp;
        }
    }
    render() {
        for (var i = 0; i < 64; i++) {
            this._blocks.children[i].setAttribute("y", "" + ((this.chipData[i] + 24) * (this._editorHeight / 49)));
        }
    }
}
export class CustomChipPrompt {
    constructor(_doc, _songEditor) {
        this._doc = _doc;
        this._songEditor = _songEditor;
        this.customChipCanvas = new CustomChipPromptCanvas(this._doc);
        this._playButton = button({ style: "width: 55%;", type: "button" });
        this._cancelButton = button({ class: "cancelButton" });
        this._okayButton = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this.container = div({ class: "prompt noSelection", style: "width: 600px;" }, h2("Edit Custom Chip Instrument"), div({ style: "display: flex; width: 55%; align-self: center; flex-direction: row; align-items: center; justify-content: center;" }, this._playButton), div({ style: "display: flex; flex-direction: row; align-items: center; justify-content: center;" }, this.customChipCanvas.container), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton), this._cancelButton);
        this._togglePlay = () => {
            this._songEditor.togglePlay();
            this.updatePlayButton();
        };
        this._close = () => {
            this._doc.prompt = null;
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._okayButton.removeEventListener("click", this._saveChanges);
            this._cancelButton.removeEventListener("click", this._close);
            this.container.removeEventListener("keydown", this.whenKeyPressed);
            this._playButton.removeEventListener("click", this._togglePlay);
        };
        this.whenKeyPressed = (event) => {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                this._saveChanges();
            }
            else if (event.keyCode == 32) {
                this._togglePlay();
                event.preventDefault();
            }
            else if (event.keyCode == 90) {
                this.customChipCanvas.undo();
                event.stopPropagation();
            }
            else if (event.keyCode == 89) {
                this.customChipCanvas.redo();
                event.stopPropagation();
            }
            else if (event.keyCode == 219) {
                this._doc.synth.goToPrevBar();
            }
            else if (event.keyCode == 221) {
                this._doc.synth.goToNextBar();
            }
        };
        this._saveChanges = () => {
            this._doc.prompt = null;
            new ChangeCustomWave(this._doc, this.customChipCanvas.startingChipData);
            this._doc.record(new ChangeCustomWave(this._doc, this.customChipCanvas.chipData), true);
        };
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this.container.addEventListener("keydown", this.whenKeyPressed);
        this._playButton.addEventListener("click", this._togglePlay);
        this.updatePlayButton();
        setTimeout(() => this._playButton.focus());
        this.customChipCanvas.render();
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
//# sourceMappingURL=CustomChipPrompt.js.map