import { Config } from "../synth/SynthConfig";
import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ChangeGroup } from "./Change";
import { ChangePatternsPerChannel, ChangeInstrumentsFlags, ChangeChannelCount } from "./changes";
const { button, div, label, br, h2, input } = HTML;
export class ChannelSettingsPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._patternsStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._pitchChannelStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._drumChannelStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._modChannelStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._layeredInstrumentsBox = input({ style: "width: 3em; margin-left: 1em;", type: "checkbox" });
        this._patternInstrumentsBox = input({ style: "width: 3em; margin-left: 1em;", type: "checkbox" });
        this._cancelButton = button({ class: "cancelButton" });
        this._okayButton = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this.container = div({ class: "prompt noSelection", style: "width: 250px; text-align: right;" }, h2("Channel Settings"), label({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Pitch channels:", this._pitchChannelStepper), label({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Drum channels:", this._drumChannelStepper), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Mod channels:", this._modChannelStepper), label({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Available patterns per channel:", this._patternsStepper), label({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Simultaneous instruments", br(), "per channel:", this._layeredInstrumentsBox), label({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Different instruments", br(), "per pattern:", this._patternInstrumentsBox), label({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton), this._cancelButton);
        this._close = () => {
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._okayButton.removeEventListener("click", this._saveChanges);
            this._cancelButton.removeEventListener("click", this._close);
            this._patternsStepper.removeEventListener("keypress", ChannelSettingsPrompt._validateKey);
            this._pitchChannelStepper.removeEventListener("keypress", ChannelSettingsPrompt._validateKey);
            this._drumChannelStepper.removeEventListener("keypress", ChannelSettingsPrompt._validateKey);
            this._modChannelStepper.removeEventListener("keypress", ChannelSettingsPrompt._validateKey);
            this._patternsStepper.removeEventListener("blur", this._validateNumber);
            this._pitchChannelStepper.removeEventListener("blur", this._validateNumber);
            this._drumChannelStepper.removeEventListener("blur", this._validateNumber);
            this._modChannelStepper.removeEventListener("blur", this._validateNumber);
            this.container.removeEventListener("keydown", this._whenKeyPressed);
        };
        this._whenKeyPressed = (event) => {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                this._saveChanges();
            }
        };
        this._validateNumber = (event) => {
            const input = event.target;
            input.value = String(ChannelSettingsPrompt._validate(input));
        };
        this._saveChanges = () => {
            const group = new ChangeGroup();
            group.append(new ChangeInstrumentsFlags(this._doc, this._layeredInstrumentsBox.checked, this._patternInstrumentsBox.checked));
            group.append(new ChangePatternsPerChannel(this._doc, ChannelSettingsPrompt._validate(this._patternsStepper)));
            group.append(new ChangeChannelCount(this._doc, ChannelSettingsPrompt._validate(this._pitchChannelStepper), ChannelSettingsPrompt._validate(this._drumChannelStepper), ChannelSettingsPrompt._validate(this._modChannelStepper)));
            this._doc.prompt = null;
            this._doc.record(group, true);
        };
        this._patternsStepper.value = this._doc.song.patternsPerChannel + "";
        this._patternsStepper.min = "1";
        this._patternsStepper.max = Config.barCountMax + "";
        this._pitchChannelStepper.value = this._doc.song.pitchChannelCount + "";
        this._pitchChannelStepper.min = Config.pitchChannelCountMin + "";
        this._pitchChannelStepper.max = Config.pitchChannelCountMax + "";
        this._drumChannelStepper.value = this._doc.song.noiseChannelCount + "";
        this._drumChannelStepper.min = Config.noiseChannelCountMin + "";
        this._drumChannelStepper.max = Config.noiseChannelCountMax + "";
        this._modChannelStepper.value = this._doc.song.modChannelCount + "";
        this._modChannelStepper.min = Config.modChannelCountMin + "";
        this._modChannelStepper.max = Config.modChannelCountMax + "";
        this._layeredInstrumentsBox.checked = this._doc.song.layeredInstruments;
        this._patternInstrumentsBox.checked = this._doc.song.patternInstruments;
        this._pitchChannelStepper.select();
        setTimeout(() => this._pitchChannelStepper.focus());
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this._patternsStepper.addEventListener("keypress", ChannelSettingsPrompt._validateKey);
        this._pitchChannelStepper.addEventListener("keypress", ChannelSettingsPrompt._validateKey);
        this._drumChannelStepper.addEventListener("keypress", ChannelSettingsPrompt._validateKey);
        this._modChannelStepper.addEventListener("keypress", ChannelSettingsPrompt._validateKey);
        this._patternsStepper.addEventListener("blur", this._validateNumber);
        this._pitchChannelStepper.addEventListener("blur", this._validateNumber);
        this._drumChannelStepper.addEventListener("blur", this._validateNumber);
        this._modChannelStepper.addEventListener("blur", this._validateNumber);
        this.container.addEventListener("keydown", this._whenKeyPressed);
    }
    static _validateKey(event) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return true;
        }
        return false;
    }
    static _validate(input) {
        return Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value))));
    }
}
//# sourceMappingURL=ChannelSettingsPrompt.js.map