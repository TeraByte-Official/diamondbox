import { HTML } from "imperative-html/dist/esm/elements-strict";
const { span } = HTML;
export class InputBox {
    constructor(input, _doc, _getChange) {
        this.input = input;
        this._doc = _doc;
        this._getChange = _getChange;
        this._change = null;
        this._value = "";
        this._oldValue = "";
        this._whenInput = () => {
            const continuingProspectiveChange = this._doc.lastChangeWas(this._change);
            if (!continuingProspectiveChange)
                this._oldValue = this._value;
            this._change = this._getChange(this._oldValue, this.input.value);
            this._doc.setProspectiveChange(this._change);
        };
        this._whenChange = () => {
            this._doc.record(this._change);
            this._change = null;
        };
        input.addEventListener("input", this._whenInput);
        input.addEventListener("change", this._whenChange);
    }
    updateValue(value) {
        this._value = value;
        this.input.value = String(value);
    }
}
export class Slider {
    constructor(input, _doc, _getChange, midTick) {
        this.input = input;
        this._doc = _doc;
        this._getChange = _getChange;
        this._change = null;
        this._value = 0;
        this._oldValue = 0;
        this._whenInput = () => {
            const continuingProspectiveChange = this._doc.lastChangeWas(this._change);
            if (!continuingProspectiveChange)
                this._oldValue = this._value;
            if (this._getChange != null) {
                this._change = this._getChange(this._oldValue, parseInt(this.input.value));
                this._doc.setProspectiveChange(this._change);
            }
        };
        this._whenChange = () => {
            if (this._getChange != null) {
                this._doc.record(this._change);
                this._change = null;
            }
        };
        this.container = (midTick) ? span({ class: "midTick", style: "position: sticky; width: 61.5%;" }, input) : span({ style: "position: sticky;" }, input);
        input.addEventListener("input", this._whenInput);
        input.addEventListener("change", this._whenChange);
    }
    updateValue(value) {
        this._value = value;
        this.input.value = String(value);
    }
}
//# sourceMappingURL=HTMLWrapper.js.map