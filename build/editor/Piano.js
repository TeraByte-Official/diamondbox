import { Config } from "../synth/SynthConfig";
import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { ColorConfig } from "./ColorConfig";
export class Piano {
    constructor(_doc) {
        this._doc = _doc;
        this._pianoContainer = HTML.div({ style: "width: 100%; height: 100%; display: flex; flex-direction: column-reverse; align-items: stretch;" });
        this._drumContainer = HTML.div({ style: "width: 100%; height: 100%; display: flex; flex-direction: column-reverse; align-items: stretch;" });
        this._modContainer = HTML.div({ style: "width: 100%; height: 100%; display: flex; flex-direction: column-reverse; align-items: stretch;" });
        this._preview = HTML.div({ style: `width: 100%; height: 40px; border: 2px solid ${ColorConfig.primaryText}; position: absolute; box-sizing: border-box; pointer-events: none;` });
        this.container = HTML.div({ style: "width: 32px; height: 100%; overflow: hidden; position: relative; flex-shrink: 0; touch-action: none;" }, this._pianoContainer, this._drumContainer, this._modContainer, this._preview);
        this._editorHeight = 481;
        this._pianoKeys = [];
        this._pianoLabels = [];
        this._modFirstLabels = [];
        this._modSecondLabels = [];
        this._modCountLabels = [];
        this._modCountRects = [];
        this._mouseY = 0;
        this._mouseDown = false;
        this._mouseOver = false;
        this._playedPitch = -1;
        this._renderedScale = -1;
        this._renderedDrums = false;
        this._renderedMod = false;
        this._renderedKey = -1;
        this._renderedPitchCount = -1;
        this._renderedLiveInputPitches = [];
        this._whenMouseOver = (event) => {
            if (this._mouseOver)
                return;
            this._mouseOver = true;
            this._updatePreview();
        };
        this._whenMouseOut = (event) => {
            if (!this._mouseOver)
                return;
            this._mouseOver = false;
            this._updatePreview();
        };
        this._whenMousePressed = (event) => {
            event.preventDefault();
            this._doc.synth.maintainLiveInput();
            this._mouseDown = true;
            const boundingRect = this.container.getBoundingClientRect();
            this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._updateCursorPitch();
            this._playLiveInput();
            this._updatePreview();
        };
        this._whenMouseMoved = (event) => {
            if (this._mouseDown || this._mouseOver)
                this._doc.synth.maintainLiveInput();
            const boundingRect = this.container.getBoundingClientRect();
            this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._updateCursorPitch();
            if (this._mouseDown)
                this._playLiveInput();
            this._updatePreview();
        };
        this._whenMouseReleased = (event) => {
            if (this._mouseDown)
                this._releaseLiveInput();
            this._mouseDown = false;
            this._updatePreview();
        };
        this._whenTouchPressed = (event) => {
            event.preventDefault();
            this._doc.synth.maintainLiveInput();
            this._mouseDown = true;
            const boundingRect = this.container.getBoundingClientRect();
            this._mouseY = (event.touches[0].clientY - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._updateCursorPitch();
            this._playLiveInput();
        };
        this._whenTouchMoved = (event) => {
            event.preventDefault();
            this._doc.synth.maintainLiveInput();
            const boundingRect = this.container.getBoundingClientRect();
            this._mouseY = (event.touches[0].clientY - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._updateCursorPitch();
            if (this._mouseDown)
                this._playLiveInput();
        };
        this._whenTouchReleased = (event) => {
            event.preventDefault();
            this._mouseDown = false;
            this._releaseLiveInput();
        };
        this._onAnimationFrame = () => {
            window.requestAnimationFrame(this._onAnimationFrame);
            let liveInputChanged = false;
            const liveInputPitchCount = !this._doc.performance.pitchesAreTemporary() ? this._doc.synth.liveInputPitches.length : 0;
            if (this._renderedLiveInputPitches.length != liveInputPitchCount) {
                liveInputChanged = true;
            }
            for (let i = 0; i < liveInputPitchCount; i++) {
                if (this._renderedLiveInputPitches[i] != this._doc.synth.liveInputPitches[i]) {
                    this._renderedLiveInputPitches[i] = this._doc.synth.liveInputPitches[i];
                    liveInputChanged = true;
                }
            }
            this._renderedLiveInputPitches.length = liveInputPitchCount;
            if (liveInputChanged) {
                this._updatePreview();
            }
        };
        this._documentChanged = () => {
            const isDrum = this._doc.song.getChannelIsNoise(this._doc.channel);
            const isMod = this._doc.song.getChannelIsMod(this._doc.channel);
            this._pitchCount = isMod ? Config.modCount : (isDrum ? Config.drumCount : this._doc.getVisiblePitchCount());
            this._pitchHeight = this._editorHeight / this._pitchCount;
            this._updateCursorPitch();
            if (this._mouseDown)
                this._playLiveInput();
            if (!this._doc.prefs.showLetters)
                return;
            if ((this._renderedScale == this._doc.song.scale && this._doc.song.scale != Config.scales.dictionary["Custom"].index) && this._renderedKey == this._doc.song.key && this._renderedDrums == isDrum && this._renderedMod == isMod && this._renderedPitchCount == this._pitchCount)
                return;
            this._renderedScale = this._doc.song.scale;
            this._renderedKey = this._doc.song.key;
            this._renderedDrums = isDrum;
            this._renderedMod = isMod;
            const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
            this._pianoContainer.style.display = (isDrum || isMod) ? "none" : "flex";
            this._drumContainer.style.display = isDrum ? "flex" : "none";
            this._modContainer.style.display = isMod ? "flex" : "none";
            if (!isDrum && !isMod) {
                if (this._renderedPitchCount != this._pitchCount) {
                    this._pianoContainer.innerHTML = "";
                    for (let i = 0; i < this._pitchCount; i++) {
                        const pianoLabel = HTML.div({ class: "piano-label", style: "font-weight: bold; -webkit-text-stroke-width: 0; font-size: 11px; font-family: sans-serif; position: absolute; padding-left: 15px;" });
                        const pianoKey = HTML.div({ class: "piano-button", style: "background: gray;" }, pianoLabel);
                        this._pianoContainer.appendChild(pianoKey);
                        this._pianoLabels[i] = pianoLabel;
                        this._pianoKeys[i] = pianoKey;
                    }
                    this._pianoLabels.length = this._pitchCount;
                    this._pianoKeys.length = this._pitchCount;
                    this._renderedPitchCount = this._pitchCount;
                }
                for (let j = 0; j < this._pitchCount; j++) {
                    const pitchNameIndex = (j + Config.keys[this._doc.song.key].basePitch) % Config.pitchesPerOctave;
                    const isWhiteKey = Config.keys[pitchNameIndex].isWhiteKey;
                    this._pianoKeys[j].style.background = isWhiteKey ? ColorConfig.whitePianoKey : ColorConfig.blackPianoKey;
                    let scale = this._doc.song.scale == Config.scales.dictionary["Custom"].index ? this._doc.song.scaleCustom : Config.scales[this._doc.song.scale].flags;
                    if (!scale[j % Config.pitchesPerOctave]) {
                        this._pianoKeys[j].classList.add("disabled");
                        this._pianoLabels[j].style.display = "none";
                    }
                    else {
                        this._pianoKeys[j].classList.remove("disabled");
                        this._pianoLabels[j].style.display = "";
                        const label = this._pianoLabels[j];
                        if ((j % 12) == 0) {
                            label.style.transform = "translate(-5px, 0px)";
                        }
                        else {
                            label.style.transform = "translate(0px, 0px)";
                        }
                        label.style.color = Config.keys[pitchNameIndex].isWhiteKey ? ColorConfig.whitePianoKeyText : ColorConfig.blackPianoKeyText;
                        label.textContent = Piano.getPitchName(pitchNameIndex, j, this._doc.getBaseVisibleOctave(this._doc.channel));
                    }
                }
            }
            else if (isMod) {
                let firstRow = "";
                let secondRow = "";
                let useFirstColor = ColorConfig.modLabelPrimaryText;
                let useSecondColor = ColorConfig.modLabelSecondaryText;
                for (let j = 0; j < Config.modCount; j++) {
                    let usingSecondRow = true;
                    let usingMod = true;
                    let instrumentVal = instrument.modInstruments[Config.modCount - j - 1] + 1;
                    let channelVal = instrument.modChannels[Config.modCount - j - 1] + 1;
                    let modulator = instrument.modulators[Config.modCount - j - 1];
                    let status = 1 + +(channelVal - 1 >= this._doc.song.pitchChannelCount);
                    if (instrument.modChannels[Config.modCount - j - 1] == -2)
                        status = 0;
                    else if (instrument.modChannels[Config.modCount - j - 1] == -1)
                        status = 3;
                    let instrumentsLength = this._doc.song.channels[Math.max(0, channelVal - 1)].instruments.length;
                    switch (status) {
                        case 0:
                            firstRow = "Mod";
                            usingSecondRow = false;
                            useSecondColor = ColorConfig.modLabelSecondaryText;
                            usingMod = false;
                            break;
                        case 1:
                            if (this._doc.song.channels[channelVal - 1].name == "") {
                                if (instrumentsLength > 1) {
                                    if (channelVal >= 10 || instrumentVal >= 10) {
                                        firstRow = "P" + channelVal;
                                        if (instrumentVal - 1 == instrumentsLength) {
                                            firstRow += " All";
                                        }
                                        else if (instrumentVal - 1 > instrumentsLength) {
                                            firstRow += " Act";
                                        }
                                        else {
                                            firstRow += " I" + instrumentVal;
                                        }
                                    }
                                    else {
                                        firstRow = "Pitch" + channelVal;
                                        if (instrumentVal - 1 == instrumentsLength) {
                                            firstRow += " All";
                                        }
                                        else if (instrumentVal - 1 > instrumentsLength) {
                                            firstRow += " Act";
                                        }
                                        else {
                                            firstRow += " Ins" + instrumentVal;
                                        }
                                    }
                                }
                                else {
                                    firstRow = "Pitch " + channelVal;
                                }
                            }
                            else {
                                let insText;
                                if (instrumentVal - 1 == instrumentsLength) {
                                    insText = " All";
                                }
                                else if (instrumentVal - 1 > instrumentsLength) {
                                    insText = " Act";
                                }
                                else {
                                    insText = " I" + instrumentVal;
                                }
                                if (instrumentsLength > 1) {
                                    firstRow = "P" + channelVal + " " + this._doc.song.channels[channelVal - 1].name + insText;
                                }
                                else {
                                    firstRow = "P" + channelVal + " " + this._doc.song.channels[channelVal - 1].name;
                                }
                            }
                            break;
                        case 2:
                            channelVal = instrument.modChannels[Config.modCount - j - 1] + 1 - this._doc.song.pitchChannelCount;
                            instrumentsLength = this._doc.song.channels[channelVal - 1].instruments.length;
                            if (this._doc.song.channels[channelVal - 1].name == "") {
                                if (instrumentsLength > 1) {
                                    if (channelVal >= 10 || instrumentVal >= 10) {
                                        firstRow = "N" + channelVal;
                                        if (instrumentVal - 1 == instrumentsLength) {
                                            firstRow += " All";
                                        }
                                        else if (instrumentVal - 1 > instrumentsLength) {
                                            firstRow += " Act";
                                        }
                                        else {
                                            firstRow += " I" + instrumentVal;
                                        }
                                    }
                                    else {
                                        firstRow = "Noise" + channelVal;
                                        if (instrumentVal - 1 == instrumentsLength) {
                                            firstRow += " All";
                                        }
                                        else if (instrumentVal - 1 > instrumentsLength) {
                                            firstRow += " Act";
                                        }
                                        else {
                                            firstRow += " Ins" + instrumentVal;
                                        }
                                    }
                                }
                                else {
                                    firstRow = "Noise " + channelVal;
                                }
                            }
                            else {
                                if (instrumentsLength > 1) {
                                    let insText;
                                    if (instrumentVal - 1 == instrumentsLength) {
                                        insText = " All";
                                    }
                                    else if (instrumentVal - 1 > instrumentsLength) {
                                        insText = " Act";
                                    }
                                    else {
                                        insText = " I" + instrumentVal;
                                    }
                                    firstRow = "N" + channelVal + " " + this._doc.song.channels[channelVal - 1].name + insText;
                                }
                                else {
                                    firstRow = "N" + channelVal + " " + this._doc.song.channels[channelVal - 1].name;
                                }
                            }
                            break;
                        case 3:
                            firstRow = "Song";
                            break;
                    }
                    if (usingSecondRow) {
                        secondRow = Config.modulators[modulator].pianoName;
                        if (modulator == Config.modulators.dictionary["none"].index) {
                            useSecondColor = ColorConfig.modLabelSecondaryText;
                            usingMod = false;
                        }
                        else if (modulator == Config.modulators.dictionary["eq filter"].index || modulator == Config.modulators.dictionary["note filter"].index) {
                            var text = " Morph";
                            var filterVal = instrument.modFilterTypes[Config.modCount - j - 1];
                            if (filterVal > 0 && (filterVal % 2)) {
                                text = " Dot" + Math.ceil(filterVal / 2) + "X";
                            }
                            else if (filterVal > 0) {
                                text = " Dot" + Math.ceil(filterVal / 2) + "Y";
                            }
                            secondRow += text;
                        }
                    }
                    const firstLabel = this._modFirstLabels[j];
                    const secondLabel = this._modSecondLabels[j];
                    const modCountLabel = this._modCountLabels[j];
                    const modCountRect = this._modCountRects[j];
                    firstLabel.style.fill = useFirstColor;
                    firstLabel.textContent = firstRow;
                    secondLabel.style.fill = useSecondColor;
                    secondLabel.textContent = usingSecondRow ? secondRow : "Not set";
                    modCountLabel.textContent = "" + (Config.modCount - j);
                    modCountRect.style.fill = usingMod ? ColorConfig.indicatorPrimary : ColorConfig.modLabelSecondaryText;
                    if (this._doc.song.channels[Math.max(0, instrument.modChannels[Config.modCount - j - 1])].name != "") {
                        let scaleFactor = "1";
                        let height = firstLabel.parentElement.parentElement.getBoundingClientRect().height;
                        let length = firstLabel.getComputedTextLength();
                        let squeeze = 0;
                        if (length > height - 8) {
                            scaleFactor = "0.65";
                            squeeze = 2;
                        }
                        else if (length > height - 24) {
                            scaleFactor = "0.8";
                            squeeze = 1;
                        }
                        firstLabel.style.transform = "rotate(-90deg) translate(" + (-20 - squeeze - Math.round(Math.max(0, (height - 80) / 2))) + "px, 39px) scale(" + scaleFactor + ", 1)";
                        while (scaleFactor == "0.65" && firstLabel.getComputedTextLength() > height + 8) {
                            var offset = 4 + (instrumentVal >= 10 ? 1 : 0);
                            firstLabel.textContent = firstLabel.textContent.substr(0, firstLabel.textContent.length - offset) + firstLabel.textContent.substr(firstLabel.textContent.length - offset + 1);
                        }
                    }
                    else {
                        let height = firstLabel.parentElement.parentElement.getBoundingClientRect().height;
                        firstLabel.style.transform = "rotate(-90deg) translate(" + (-20 - Math.round(Math.max(0, (height - 80) / 2))) + "px, 39px) scale(1, 1)";
                    }
                }
            }
            this._updatePreview();
        };
        for (let i = 0; i < Config.drumCount; i++) {
            const scale = (1.0 - (i / Config.drumCount) * 0.35) * 100;
            this._drumContainer.appendChild(HTML.div({ class: "drum-button", style: `background-size: ${scale}% ${scale}%;` }));
        }
        for (let i = 0; i < Config.modCount; i++) {
            const firstRowText = SVG.text({ class: "modulator-label", "text-anchor": "left", fill: ColorConfig.modLabelPrimaryText, style: "font-weight: bold; align-self: flex-start; transform-origin: center; transform: rotate(-90deg) translate(-19px, 39px); font-size: 11px; font-family: sans-serif;" });
            const secondRowText = SVG.text({ class: "modulator-label", "text-anchor": "left", fill: ColorConfig.modLabelPrimaryText, style: "font-weight: bold; align-self: flex-end; transform-origin: center; transform: rotate(-90deg) translate(-26px, 42px); font-size: 11px; font-family: sans-serif;" });
            const countText = SVG.text({ class: "modulator-inverse-label", fill: ColorConfig.modLabelPrimary, style: "font-weight: bold; align-self: flex-start; transform-origin: center; transform: rotate(-90deg) translate(4px, 13px); font-size: 11px; font-family: sans-serif;" });
            const countRect = SVG.rect({ width: "12px", height: "9px", fill: ColorConfig.indicatorPrimary, style: "pointer-events: none; transform: translate(4px, 4px);" });
            const firstRowSVG = SVG.svg({ viewBox: "0 0 16 66", width: "16px", style: "pointer-events: none; flex-grow: 1;" }, [
                firstRowText,
            ]);
            const countSVG = SVG.svg({ viewBox: "0 0 16 14", width: "16px", style: "pointer-events: none;" }, [
                countRect,
                countText,
            ]);
            const secondRowSVG = SVG.svg({ viewBox: "0 0 16 80", width: "16px", style: "pointer-events: none;" }, [
                secondRowText,
            ]);
            const flexRow1 = HTML.div({ style: "display: flex; flex-direction: column; justify-content: space-between; pointer-events: none;" }, [
                countSVG,
                firstRowSVG,
            ]);
            const flexRow2 = HTML.div({ style: "display: flex; flex-direction: column-reverse; justify-content: space-between; pointer-events: none;" }, [
                secondRowSVG,
            ]);
            const flexContainer = HTML.div({ style: "display: flex; flex-direction: row; justify-content: space-between; padding: 0px; width: 32px; height: 100%; overflow: hidden; pointer-events: none;" }, [
                flexRow1,
                flexRow2,
            ]);
            const modKey = HTML.div({ class: "modulator-button", style: "background: " + ColorConfig.modLabelPrimary + ";" }, flexContainer);
            this._modContainer.appendChild(modKey);
            this._modFirstLabels.push(firstRowText);
            this._modSecondLabels.push(secondRowText);
            this._modCountLabels.push(countText);
            this._modCountRects.push(countRect);
        }
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenMouseReleased);
        this.container.addEventListener("mouseover", this._whenMouseOver);
        this.container.addEventListener("mouseout", this._whenMouseOut);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenTouchReleased);
        this.container.addEventListener("touchcancel", this._whenTouchReleased);
        this._doc.notifier.watch(this._documentChanged);
        this._documentChanged();
        window.requestAnimationFrame(this._onAnimationFrame);
    }
    forceRender() {
        this._renderedScale = -1;
        this._documentChanged();
    }
    _updateCursorPitch() {
        const scale = this._doc.song.scale == Config.scales.dictionary["Custom"].index ? this._doc.song.scaleCustom : Config.scales[this._doc.song.scale].flags;
        const mousePitch = Math.max(0, Math.min(this._pitchCount - 1, this._pitchCount - (this._mouseY / this._pitchHeight)));
        if (scale[Math.floor(mousePitch) % Config.pitchesPerOctave] || this._doc.song.getChannelIsNoise(this._doc.channel)) {
            this._cursorPitch = Math.floor(mousePitch);
        }
        else {
            let topPitch = Math.floor(mousePitch) + 1;
            let bottomPitch = Math.floor(mousePitch) - 1;
            while (!scale[topPitch % Config.pitchesPerOctave]) {
                topPitch++;
            }
            while (!scale[(bottomPitch) % Config.pitchesPerOctave]) {
                bottomPitch--;
            }
            let topRange = topPitch;
            let bottomRange = bottomPitch + 1;
            if (topPitch % Config.pitchesPerOctave == 0 || topPitch % Config.pitchesPerOctave == 7) {
                topRange -= 0.5;
            }
            if (bottomPitch % Config.pitchesPerOctave == 0 || bottomPitch % Config.pitchesPerOctave == 7) {
                bottomRange += 0.5;
            }
            this._cursorPitch = mousePitch - bottomRange > topRange - mousePitch ? topPitch : bottomPitch;
        }
    }
    _playLiveInput() {
        const octaveOffset = this._doc.getBaseVisibleOctave(this._doc.channel) * Config.pitchesPerOctave;
        const currentPitch = this._cursorPitch + octaveOffset;
        if (this._playedPitch == currentPitch)
            return;
        this._doc.performance.removePerformedPitch(this._playedPitch);
        this._playedPitch = currentPitch;
        this._doc.performance.addPerformedPitch(currentPitch);
    }
    _releaseLiveInput() {
        this._doc.performance.removePerformedPitch(this._playedPitch);
        this._playedPitch = -1;
    }
    _updatePreview() {
        this._preview.style.visibility = (!this._mouseOver || this._mouseDown) ? "hidden" : "visible";
        if (this._mouseOver && !this._mouseDown) {
            const boundingRect = this.container.getBoundingClientRect();
            const pitchHeight = this._pitchHeight / (this._editorHeight / (boundingRect.bottom - boundingRect.top));
            this._preview.style.left = "0px";
            this._preview.style.top = pitchHeight * (this._pitchCount - this._cursorPitch - 1) + "px";
            this._preview.style.height = pitchHeight + "px";
        }
        const octaveOffset = this._doc.getBaseVisibleOctave(this._doc.channel) * Config.pitchesPerOctave;
        const container = this._doc.song.getChannelIsNoise(this._doc.channel) ? this._drumContainer : this._pianoContainer;
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (this._renderedLiveInputPitches.indexOf(i + octaveOffset) == -1) {
                child.classList.remove("pressed");
            }
            else {
                child.classList.add("pressed");
            }
        }
    }
    static getPitchName(pitchNameIndex, scaleIndex, baseVisibleOctave) {
        let text;
        if (Config.keys[pitchNameIndex].isWhiteKey) {
            text = Config.keys[pitchNameIndex].name;
        }
        else {
            const shiftDir = Config.blackKeyNameParents[scaleIndex % Config.pitchesPerOctave];
            text = Config.keys[(pitchNameIndex + Config.pitchesPerOctave + shiftDir) % Config.pitchesPerOctave].name;
            if (shiftDir == 1) {
                text += "♭";
            }
            else if (shiftDir == -1) {
                text += "♯";
            }
        }
        if (scaleIndex % 12 == 0) {
            text += Math.floor(scaleIndex / 12) + baseVisibleOctave;
        }
        return text;
    }
}
//# sourceMappingURL=Piano.js.map