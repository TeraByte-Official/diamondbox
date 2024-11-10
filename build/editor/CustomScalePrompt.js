import { Config } from "../synth/SynthConfig";
import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ChangeCustomScale } from "./changes";
const { button, div, h2, input } = HTML;
export class CustomScalePrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._flags = [];
        this._scaleFlags = [];
        this._scaleRows = [];
        this._cancelButton = button({ class: "cancelButton" });
        this._okayButton = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this._close = () => {
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._okayButton.removeEventListener("click", this._saveChanges);
            this._cancelButton.removeEventListener("click", this._close);
            this.container.removeEventListener("keydown", this.whenKeyPressed);
        };
        this.whenKeyPressed = (event) => {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                this._saveChanges();
            }
        };
        this._saveChanges = () => {
            for (var i = 1; i < this._scaleFlags.length; i++) {
                this._flags[i] = this._scaleFlags[i].checked;
            }
            this._doc.prompt = null;
            this._doc.record(new ChangeCustomScale(this._doc, this._flags));
        };
        this._flags = _doc.song.scaleCustom.slice();
        let scaleHolder = div({});
        for (var i = 1; i < Config.pitchesPerOctave; i++) {
            this._scaleFlags[i] = input({ type: "checkbox", style: "width: 1em; padding: 0; margin-right: 4em;", "checked": this._flags[i], "value": i });
            this._scaleRows[i] = div({ style: "text-align: right; height: 2em;" }, "note " + i + ":", this._scaleFlags[i]);
            scaleHolder.appendChild(this._scaleRows[i]);
        }
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this.container = div({ class: "prompt noSelection", style: "width: 250px;" }, h2("Custom Scale"), div({ style: "display: flex; flex-direction: row; align-items: center; justify-content: flex-end;" }, scaleHolder), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton), this._cancelButton);
        this.container.addEventListener("keydown", this.whenKeyPressed);
    }
}
//# sourceMappingURL=CustomScalePrompt.js.map