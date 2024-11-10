import { Config } from "../synth/SynthConfig";
import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ChangeBeatsPerBar } from "./changes";
const { button, div, span, h2, input, br, select, option } = HTML;
export class BeatsPerBarPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._beatsStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._conversionStrategySelect = select({ style: "width: 100%;" }, option({ value: "splice" }, "Splice beats at end of bars."), option({ value: "stretch" }, "Stretch notes to fit in bars."), option({ value: "overflow" }, "Overflow notes across bars."));
        this._cancelButton = button({ class: "cancelButton" });
        this._okayButton = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this.container = div({ class: "prompt noSelection", style: "width: 250px;" }, h2("Beats Per Bar"), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ style: "text-align: right;" }, "Beats per bar:", br(), span({ style: "font-size: smaller; color: ${ColorConfig.secondaryText};" }, "(Multiples of 3 or 4 are recommended)")), this._beatsStepper), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ class: "selectContainer", style: "width: 100%;" }, this._conversionStrategySelect)), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton), this._cancelButton);
        this._close = () => {
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._okayButton.removeEventListener("click", this._saveChanges);
            this._cancelButton.removeEventListener("click", this._close);
            this._beatsStepper.removeEventListener("keypress", BeatsPerBarPrompt._validateKey);
            this._beatsStepper.removeEventListener("blur", BeatsPerBarPrompt._validateNumber);
            this.container.removeEventListener("keydown", this._whenKeyPressed);
        };
        this._whenKeyPressed = (event) => {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                this._saveChanges();
            }
        };
        this._saveChanges = () => {
            window.localStorage.setItem("beatCountStrategy", this._conversionStrategySelect.value);
            this._doc.prompt = null;
            this._doc.record(new ChangeBeatsPerBar(this._doc, BeatsPerBarPrompt._validate(this._beatsStepper), this._conversionStrategySelect.value), true);
        };
        this._beatsStepper.value = this._doc.song.beatsPerBar + "";
        this._beatsStepper.min = Config.beatsPerBarMin + "";
        this._beatsStepper.max = Config.beatsPerBarMax + "";
        const lastStrategy = window.localStorage.getItem("beatCountStrategy");
        if (lastStrategy != null) {
            this._conversionStrategySelect.value = lastStrategy;
        }
        this._beatsStepper.select();
        setTimeout(() => this._beatsStepper.focus());
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this._beatsStepper.addEventListener("keypress", BeatsPerBarPrompt._validateKey);
        this._beatsStepper.addEventListener("blur", BeatsPerBarPrompt._validateNumber);
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
    static _validateNumber(event) {
        const input = event.target;
        input.value = String(BeatsPerBarPrompt._validate(input));
    }
    static _validate(input) {
        return Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value))));
    }
}
//# sourceMappingURL=BeatsPerBarPrompt.js.map