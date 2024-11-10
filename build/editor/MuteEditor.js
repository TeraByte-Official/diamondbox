import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ColorConfig } from "./ColorConfig";
import { InputBox } from "./HTMLWrapper";
import { ChangeChannelOrder, ChangeChannelName, ChangeRemoveChannel } from "./changes";
import { Config } from "../synth/SynthConfig";
export class MuteEditor {
    constructor(_doc, _editor) {
        this._doc = _doc;
        this._editor = _editor;
        this._cornerFiller = HTML.div({ style: `background: ${ColorConfig.editorBackground}; position: sticky; bottom: 0; left: 0; width: 32px; height: 30px;` });
        this._buttons = [];
        this._channelCounts = [];
        this._channelNameDisplay = HTML.div({ style: `background-color: ${ColorConfig.uiWidgetFocus}; white-space:nowrap; display: none; transform:translate(20px); width: auto; pointer-events: none; position: absolute; border-radius: 0.2em; z-index: 2;`, "color": ColorConfig.primaryText }, "");
        this._channelNameInput = new InputBox(HTML.input({ style: `color: ${ColorConfig.primaryText}; background-color: ${ColorConfig.uiWidgetFocus}; margin-top: -2px; display: none; width: 6em; position: absolute; border-radius: 0.2em; z-index: 2;`, "color": ColorConfig.primaryText }, ""), this._doc, (oldValue, newValue) => new ChangeChannelName(this._doc, oldValue, newValue));
        this._channelDropDown = HTML.select({ style: "width: 0px; left: 19px; height: 19px; position:absolute; opacity:0" }, HTML.option({ value: "rename" }, "Rename..."), HTML.option({ value: "chnUp" }, "Move Channel Up"), HTML.option({ value: "chnDown" }, "Move Channel Down"), HTML.option({ value: "chnMute" }, "Mute Channel"), HTML.option({ value: "chnSolo" }, "Solo Channel"), HTML.option({ value: "chnInsert" }, "Insert Channel Below"), HTML.option({ value: "chnDelete" }, "Delete This Channel"));
        this.container = HTML.div({ class: "muteEditor", style: "position: sticky; padding-top: " + Config.barEditorHeight + "px;" }, this._channelNameDisplay, this._channelNameInput.input, this._channelDropDown);
        this._editorHeight = 128;
        this._renderedChannelCount = 0;
        this._renderedPitchChannels = 0;
        this._renderedNoiseChannels = 0;
        this._renderedModChannels = 0;
        this._renderedChannelHeight = -1;
        this._channelDropDownChannel = 0;
        this._channelDropDownOpen = false;
        this._channelDropDownLastState = false;
        this._channelNameInputWhenInput = () => {
            let newValue = this._channelNameInput.input.value;
            if (newValue.length > 15) {
                this._channelNameInput.input.value = newValue.substring(0, 15);
            }
        };
        this._channelNameInputClicked = (event) => {
            event.stopPropagation();
        };
        this._channelNameInputHide = () => {
            this._channelNameInput.input.style.setProperty("display", "none");
            this._channelNameDisplay.style.setProperty("display", "none");
        };
        this._channelDropDownClick = (event) => {
            this._channelDropDownOpen = !this._channelDropDownLastState;
            this._channelDropDownGetOpenedPosition(event);
        };
        this._channelDropDownBlur = () => {
            this._channelDropDownOpen = false;
            this._channelNameDisplay.style.setProperty("display", "none");
        };
        this._channelDropDownGetOpenedPosition = (event) => {
            this._channelDropDownLastState = this._channelDropDownOpen;
            this._channelDropDownChannel = Math.floor(Math.min(this._renderedChannelCount, Math.max(0, parseInt(this._channelDropDown.style.getPropertyValue("top")) / this._renderedChannelHeight)));
            this._doc.muteEditorChannel = this._channelDropDownChannel;
            this._channelNameDisplay.style.setProperty("display", "");
            if ((this._channelDropDownChannel < this._doc.song.pitchChannelCount && this._doc.song.pitchChannelCount == Config.pitchChannelCountMax)
                || (this._channelDropDownChannel >= this._doc.song.pitchChannelCount && this._channelDropDownChannel < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount && this._doc.song.noiseChannelCount == Config.noiseChannelCountMax)
                || (this._channelDropDownChannel >= this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount && this._doc.song.modChannelCount == Config.modChannelCountMax)) {
                this._channelDropDown.options[5].disabled = true;
            }
            else {
                this._channelDropDown.options[5].disabled = false;
            }
            if (this._channelDropDownChannel == 0 || this._channelDropDownChannel == this._doc.song.pitchChannelCount || this._channelDropDownChannel == this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
                this._channelDropDown.options[1].disabled = true;
            }
            else {
                this._channelDropDown.options[1].disabled = false;
            }
            if (this._channelDropDownChannel == this._doc.song.pitchChannelCount - 1 || this._channelDropDownChannel == this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount - 1 || this._channelDropDownChannel == this._doc.song.getChannelCount() - 1) {
                this._channelDropDown.options[2].disabled = true;
            }
            else {
                this._channelDropDown.options[2].disabled = false;
            }
            if (this._doc.song.pitchChannelCount == 1 && this._channelDropDownChannel == 0) {
                this._channelDropDown.options[6].disabled = true;
            }
            else {
                this._channelDropDown.options[6].disabled = false;
            }
        };
        this._channelDropDownHandler = (event) => {
            this._channelNameDisplay.style.setProperty("display", "none");
            this._channelDropDown.style.setProperty("display", "none");
            this._channelDropDownOpen = false;
            event.stopPropagation();
            switch (this._channelDropDown.value) {
                case "rename":
                    this._channelNameInput.input.style.setProperty("display", "");
                    this._channelNameInput.input.style.setProperty("transform", this._channelNameDisplay.style.getPropertyValue("transform"));
                    if (this._channelNameDisplay.textContent != null) {
                        this._channelNameInput.input.value = this._channelNameDisplay.textContent;
                    }
                    else {
                        this._channelNameInput.input.value = "";
                    }
                    this._channelNameInput.input.select();
                    break;
                case "chnUp":
                    this._doc.record(new ChangeChannelOrder(this._doc, this._channelDropDownChannel, this._channelDropDownChannel, -1));
                    break;
                case "chnDown":
                    this._doc.record(new ChangeChannelOrder(this._doc, this._channelDropDownChannel, this._channelDropDownChannel, 1));
                    break;
                case "chnMute":
                    this._doc.song.channels[this._channelDropDownChannel].muted = !this._doc.song.channels[this._channelDropDownChannel].muted;
                    this.render();
                    break;
                case "chnSolo": {
                    let shouldSolo = false;
                    for (let channel = 0; channel < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount; channel++) {
                        if (this._doc.song.channels[channel].muted == (channel == this._channelDropDownChannel)) {
                            shouldSolo = true;
                            channel = this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount;
                        }
                    }
                    if (shouldSolo) {
                        for (let channel = 0; channel < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount; channel++) {
                            this._doc.song.channels[channel].muted = (channel != this._channelDropDownChannel);
                        }
                    }
                    else {
                        for (let channel = 0; channel < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount; channel++) {
                            this._doc.song.channels[channel].muted = false;
                        }
                    }
                    this.render();
                    break;
                }
                case "chnInsert": {
                    this._doc.channel = this._channelDropDownChannel;
                    this._doc.selection.resetBoxSelection();
                    this._doc.selection.insertChannel();
                    break;
                }
                case "chnDelete": {
                    this._doc.record(new ChangeRemoveChannel(this._doc, this._channelDropDownChannel, this._channelDropDownChannel));
                    break;
                }
            }
            if (this._channelDropDown.value != "rename")
                this._editor.refocusStage();
            this._channelDropDown.selectedIndex = -1;
        };
        this._onClick = (event) => {
            const index = this._buttons.indexOf(event.target);
            if (index == -1)
                return;
            let xPos = event.clientX - this._buttons[0].getBoundingClientRect().left;
            if (xPos < 21.0) {
                this._doc.song.channels[index].muted = !this._doc.song.channels[index].muted;
            }
            this._doc.notifier.changed();
        };
        this._onMouseMove = (event) => {
            const index = this._buttons.indexOf(event.target);
            if (index == -1) {
                if (!this._channelDropDownOpen && event.target != this._channelNameDisplay && event.target != this._channelDropDown) {
                    this._channelNameDisplay.style.setProperty("display", "none");
                    this._channelDropDown.style.setProperty("display", "none");
                    this._channelDropDown.style.setProperty("width", "0px");
                }
                return;
            }
            let xPos = event.clientX - this._buttons[0].getBoundingClientRect().left;
            if (xPos >= 21.0) {
                if (!this._channelDropDownOpen) {
                    this._channelDropDown.style.setProperty("display", "");
                    var height = this._doc.getChannelHeight();
                    this._channelNameDisplay.style.setProperty("transform", "translate(20px, " + (height / 4 + height * index) + "px)");
                    if (this._doc.song.channels[index].name != "") {
                        this._channelNameDisplay.textContent = this._doc.song.channels[index].name;
                        this._channelNameDisplay.style.setProperty("display", "");
                    }
                    else {
                        if (index < this._doc.song.pitchChannelCount) {
                            this._channelNameDisplay.textContent = "Pitch " + (index + 1);
                        }
                        else if (index < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
                            this._channelNameDisplay.textContent = "Noise " + (index - this._doc.song.pitchChannelCount + 1);
                        }
                        else {
                            this._channelNameDisplay.textContent = "Mod " + (index - this._doc.song.pitchChannelCount - this._doc.song.noiseChannelCount + 1);
                        }
                        this._channelNameDisplay.style.setProperty("display", "none");
                    }
                    this._channelDropDown.style.top = (Config.barEditorHeight + 2 + index * this._renderedChannelHeight) + "px";
                    this._channelDropDown.style.setProperty("width", "15px");
                }
            }
            else {
                if (!this._channelDropDownOpen) {
                    this._channelNameDisplay.style.setProperty("display", "none");
                    this._channelDropDown.style.setProperty("display", "none");
                    this._channelDropDown.style.setProperty("width", "0px");
                }
            }
        };
        this._onMouseLeave = (event) => {
            if (!this._channelDropDownOpen) {
                this._channelNameDisplay.style.setProperty("display", "none");
                this._channelDropDown.style.setProperty("width", "0px");
            }
        };
        this.container.addEventListener("click", this._onClick);
        this.container.addEventListener("mousemove", this._onMouseMove);
        this.container.addEventListener("mouseleave", this._onMouseLeave);
        this._channelDropDown.selectedIndex = -1;
        this._channelDropDown.addEventListener("change", this._channelDropDownHandler);
        this._channelDropDown.addEventListener("mousedown", this._channelDropDownGetOpenedPosition);
        this._channelDropDown.addEventListener("blur", this._channelDropDownBlur);
        this._channelDropDown.addEventListener("click", this._channelDropDownClick);
        this._channelNameInput.input.addEventListener("change", this._channelNameInputHide);
        this._channelNameInput.input.addEventListener("blur", this._channelNameInputHide);
        this._channelNameInput.input.addEventListener("mousedown", this._channelNameInputClicked);
        this._channelNameInput.input.addEventListener("input", this._channelNameInputWhenInput);
    }
    onKeyUp(event) {
        switch (event.keyCode) {
            case 27:
                this._channelDropDownOpen = false;
                this._channelNameDisplay.style.setProperty("display", "none");
                break;
            case 13:
                this._channelDropDownOpen = false;
                this._channelNameDisplay.style.setProperty("display", "none");
                break;
            default:
                break;
        }
    }
    render() {
        if (!this._doc.prefs.enableChannelMuting)
            return;
        const channelHeight = this._doc.getChannelHeight();
        if (this._renderedChannelCount != this._doc.song.getChannelCount()) {
            for (let y = this._renderedChannelCount; y < this._doc.song.getChannelCount(); y++) {
                const channelCountText = HTML.div({ class: "noSelection muteButtonText", style: "display: table-cell; -webkit-text-stroke: 1.5px; vertical-align: middle; text-align: center; -webkit-user-select: none; -webkit-touch-callout: none; -moz-user-select: none; -ms-user-select: none; user-select: none; pointer-events: none; width: 12px; height: 20px; transform: translate(0px, 1px);" });
                const muteButton = HTML.div({ class: "mute-button", title: "Mute (M), Mute All (⇧M), Solo (S), Exclude (⇧S)", style: `display: block; pointer-events: none; width: 16px; height: 20px; transform: translate(2px, 1px);` });
                const muteContainer = HTML.div({ style: "align-items: center; height: 20px; margin: 0px; display: table; flex-direction: row; justify-content: space-between;" }, [
                    muteButton,
                    channelCountText,
                ]);
                this.container.appendChild(muteContainer);
                this._buttons[y] = muteContainer;
                this._channelCounts[y] = channelCountText;
            }
            for (let y = this._doc.song.getChannelCount(); y < this._renderedChannelCount; y++) {
                this.container.removeChild(this._buttons[y]);
            }
            this._buttons.length = this._doc.song.getChannelCount();
            this.container.appendChild(this._cornerFiller);
        }
        for (let y = 0; y < this._doc.song.getChannelCount(); y++) {
            if (this._doc.song.channels[y].muted) {
                this._buttons[y].children[0].classList.add("muted");
                if (y < this._doc.song.pitchChannelCount)
                    this._channelCounts[y].style.color = ColorConfig.trackEditorBgPitchDim;
                else if (y < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount)
                    this._channelCounts[y].style.color = ColorConfig.trackEditorBgNoiseDim;
                else
                    this._channelCounts[y].style.color = ColorConfig.trackEditorBgModDim;
            }
            else {
                this._buttons[y].children[0].classList.remove("muted");
                if (y < this._doc.song.pitchChannelCount)
                    this._channelCounts[y].style.color = ColorConfig.trackEditorBgPitch;
                else if (y < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount)
                    this._channelCounts[y].style.color = ColorConfig.trackEditorBgNoise;
                else
                    this._channelCounts[y].style.color = ColorConfig.trackEditorBgMod;
            }
        }
        if (this._renderedChannelHeight != channelHeight || this._renderedChannelCount != this._doc.song.getChannelCount()) {
            for (let y = 0; y < this._doc.song.getChannelCount(); y++) {
                this._buttons[y].style.marginTop = ((channelHeight - 20) / 2) + "px";
                this._buttons[y].style.marginBottom = ((channelHeight - 20) / 2) + "px";
            }
        }
        if (this._renderedModChannels != this._doc.song.modChannelCount || this._renderedChannelCount != this._doc.song.getChannelCount()) {
            for (let y = 0; y < this._doc.song.getChannelCount(); y++) {
                if (y < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
                    this._buttons[y].children[0].classList.remove("modMute");
                }
                else {
                    this._buttons[y].children[0].classList.add("modMute");
                }
            }
        }
        if (this._renderedModChannels != this._doc.song.modChannelCount || this._renderedPitchChannels != this._doc.song.pitchChannelCount || this._renderedNoiseChannels != this._doc.song.noiseChannelCount) {
            for (let y = 0; y < this._doc.song.getChannelCount(); y++) {
                if (y < this._doc.song.pitchChannelCount) {
                    let val = (y + 1);
                    this._channelCounts[y].textContent = val + "";
                    this._channelCounts[y].style.fontSize = (val >= 10) ? "xx-small" : "inherit";
                }
                else if (y < this._doc.song.pitchChannelCount + this._doc.song.noiseChannelCount) {
                    let val = (y - this._doc.song.pitchChannelCount + 1);
                    this._channelCounts[y].textContent = val + "";
                    this._channelCounts[y].style.fontSize = (val >= 10) ? "xx-small" : "inherit";
                }
                else {
                    let val = (y - this._doc.song.pitchChannelCount - this._doc.song.noiseChannelCount + 1);
                    this._channelCounts[y].textContent = val + "";
                    this._channelCounts[y].style.fontSize = (val >= 10) ? "xx-small" : "inherit";
                }
            }
            this._renderedPitchChannels = this._doc.song.pitchChannelCount;
            this._renderedNoiseChannels = this._doc.song.noiseChannelCount;
            this._renderedModChannels = this._doc.song.modChannelCount;
        }
        if (this._renderedChannelHeight != channelHeight || this._renderedChannelCount != this._doc.song.getChannelCount()) {
            this._renderedChannelHeight = channelHeight;
            this._renderedChannelCount = this._doc.song.getChannelCount();
            this._editorHeight = Config.barEditorHeight + this._doc.song.getChannelCount() * channelHeight;
            this._channelNameDisplay.style.setProperty("display", "none");
            this.container.style.height = (this._editorHeight + 16) + "px";
            if (this._renderedChannelHeight < 27) {
                this._channelNameDisplay.style.setProperty("margin-top", "-2px");
                this._channelDropDown.style.setProperty("margin-top", "-4px");
                this._channelNameInput.input.style.setProperty("margin-top", "-4px");
            }
            else if (this._renderedChannelHeight < 30) {
                this._channelNameDisplay.style.setProperty("margin-top", "-1px");
                this._channelDropDown.style.setProperty("margin-top", "-3px");
                this._channelNameInput.input.style.setProperty("margin-top", "-3px");
            }
            else {
                this._channelNameDisplay.style.setProperty("margin-top", "0px");
                this._channelDropDown.style.setProperty("margin-top", "0px");
                this._channelNameInput.input.style.setProperty("margin-top", "-2px");
            }
        }
    }
}
//# sourceMappingURL=MuteEditor.js.map