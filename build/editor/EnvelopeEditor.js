import { Config } from "../synth/SynthConfig";
import { ChangeSetEnvelopeTarget, ChangeSetEnvelopeType, ChangeRemoveEnvelope } from "./changes";
import { HTML } from "imperative-html/dist/esm/elements-strict";
export class EnvelopeEditor {
    constructor(_doc) {
        this._doc = _doc;
        this.container = HTML.div({ class: "envelopeEditor" });
        this._rows = [];
        this._targetSelects = [];
        this._envelopeSelects = [];
        this._deleteButtons = [];
        this._renderedEnvelopeCount = 0;
        this._renderedEqFilterCount = -1;
        this._renderedNoteFilterCount = -1;
        this._renderedEffects = 0;
        this._onChange = (event) => {
            const targetSelectIndex = this._targetSelects.indexOf(event.target);
            const envelopeSelectIndex = this._envelopeSelects.indexOf(event.target);
            if (targetSelectIndex != -1) {
                const combinedValue = parseInt(this._targetSelects[targetSelectIndex].value);
                const target = combinedValue % Config.instrumentAutomationTargets.length;
                const index = (combinedValue / Config.instrumentAutomationTargets.length) >>> 0;
                this._doc.record(new ChangeSetEnvelopeTarget(this._doc, targetSelectIndex, target, index));
            }
            else if (envelopeSelectIndex != -1) {
                this._doc.record(new ChangeSetEnvelopeType(this._doc, envelopeSelectIndex, this._envelopeSelects[envelopeSelectIndex].selectedIndex));
            }
        };
        this._onClick = (event) => {
            const index = this._deleteButtons.indexOf(event.target);
            if (index != -1) {
                this._doc.record(new ChangeRemoveEnvelope(this._doc, index));
            }
        };
        this.container.addEventListener("change", this._onChange);
        this.container.addEventListener("click", this._onClick);
    }
    _makeOption(target, index) {
        let displayName = Config.instrumentAutomationTargets[target].displayName;
        if (Config.instrumentAutomationTargets[target].maxCount > 1) {
            if (displayName.indexOf("#") != -1) {
                displayName = displayName.replace("#", String(index + 1));
            }
            else {
                displayName += " " + (index + 1);
            }
        }
        return HTML.option({ value: target + index * Config.instrumentAutomationTargets.length }, displayName);
    }
    _updateTargetOptionVisibility(menu, instrument) {
        for (let optionIndex = 0; optionIndex < menu.childElementCount; optionIndex++) {
            const option = menu.children[optionIndex];
            const combinedValue = parseInt(option.value);
            const target = combinedValue % Config.instrumentAutomationTargets.length;
            const index = (combinedValue / Config.instrumentAutomationTargets.length) >>> 0;
            option.hidden = !instrument.supportsEnvelopeTarget(target, index);
        }
    }
    render() {
        const instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        for (let envelopeIndex = this._rows.length; envelopeIndex < instrument.envelopeCount; envelopeIndex++) {
            const targetSelect = HTML.select();
            for (let target = 0; target < Config.instrumentAutomationTargets.length; target++) {
                const interleaved = (Config.instrumentAutomationTargets[target].interleave);
                for (let index = 0; index < Config.instrumentAutomationTargets[target].maxCount; index++) {
                    targetSelect.appendChild(this._makeOption(target, index));
                    if (interleaved) {
                        targetSelect.appendChild(this._makeOption(target + 1, index));
                    }
                }
                if (interleaved)
                    target++;
            }
            const envelopeSelect = HTML.select();
            for (let envelope = 0; envelope < Config.envelopes.length; envelope++) {
                envelopeSelect.appendChild(HTML.option({ value: envelope }, Config.envelopes[envelope].name));
            }
            const deleteButton = HTML.button({ type: "button", class: "delete-envelope" });
            const row = HTML.div({ class: "envelope-row" }, HTML.div({ class: "selectContainer", style: "width: 0; flex: 1;" }, targetSelect), HTML.div({ class: "selectContainer", style: "width: 0; flex: 0.7;" }, envelopeSelect), deleteButton);
            this.container.appendChild(row);
            this._rows[envelopeIndex] = row;
            this._targetSelects[envelopeIndex] = targetSelect;
            this._envelopeSelects[envelopeIndex] = envelopeSelect;
            this._deleteButtons[envelopeIndex] = deleteButton;
        }
        for (let envelopeIndex = this._renderedEnvelopeCount; envelopeIndex < instrument.envelopeCount; envelopeIndex++) {
            this._rows[envelopeIndex].style.display = "";
            this._updateTargetOptionVisibility(this._targetSelects[envelopeIndex], instrument);
        }
        for (let envelopeIndex = instrument.envelopeCount; envelopeIndex < this._renderedEnvelopeCount; envelopeIndex++) {
            this._rows[envelopeIndex].style.display = "none";
        }
        let useControlPointCount = instrument.noteFilter.controlPointCount;
        if (instrument.noteFilterType)
            useControlPointCount = 1;
        if (this._renderedEqFilterCount != instrument.eqFilter.controlPointCount ||
            this._renderedNoteFilterCount != useControlPointCount ||
            this._renderedInstrumentType != instrument.type ||
            this._renderedEffects != instrument.effects) {
            for (let envelopeIndex = 0; envelopeIndex < this._renderedEnvelopeCount; envelopeIndex++) {
                this._updateTargetOptionVisibility(this._targetSelects[envelopeIndex], instrument);
            }
        }
        for (let envelopeIndex = 0; envelopeIndex < instrument.envelopeCount; envelopeIndex++) {
            this._targetSelects[envelopeIndex].value = String(instrument.envelopes[envelopeIndex].target + instrument.envelopes[envelopeIndex].index * Config.instrumentAutomationTargets.length);
            this._envelopeSelects[envelopeIndex].selectedIndex = instrument.envelopes[envelopeIndex].envelope;
        }
        this._renderedEnvelopeCount = instrument.envelopeCount;
        this._renderedEqFilterCount = instrument.eqFilter.controlPointCount;
        this._renderedNoteFilterCount = useControlPointCount;
        this._renderedInstrumentType = instrument.type;
        this._renderedEffects = instrument.effects;
    }
}
//# sourceMappingURL=EnvelopeEditor.js.map