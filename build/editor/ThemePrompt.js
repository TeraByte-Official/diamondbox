import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ColorConfig } from "./ColorConfig";
const { button, div, h2, select, option } = HTML;
export class ThemePrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._themeSelect = select({ style: "width: 100%;" }, option({ value: "dark classic" }, "BeepBox Dark"), option({ value: "light classic" }, "BeepBox Light"), option({ value: "dark competition" }, "BeepBox Competition Dark"), option({ value: "jummbox classic" }, "JummBox Dark"), option({ value: "jummbox light" }, "Gold Light"), option({ value: "forest" }, "Forest"), option({ value: "canyon" }, "Canyon"), option({ value: "midnight" }, "Midnight"), option({ value: "beachcombing" }, "Beachcombing"), option({ value: "violet verdant" }, "Violet Verdant"), option({ value: "sunset" }, "Sunset"), option({ value: "autumn" }, "Autumn"), option({ value: "fruit" }, "Shadowfruit"), option({ value: "toxic" }, "Toxic"), option({ value: "roe" }, "Roe"), option({ value: "moonlight" }, "Moonlight"), option({ value: "portal" }, "Portal"), option({ value: "fusion" }, "Fusion"), option({ value: "inverse" }, "Inverse"), option({ value: "nebula" }, "Nebula"), option({ value: "roe light" }, "Roe Light"), option({ value: "amoled dark" }, "High Contrast Dark"), option({ value: "energized" }, "Energized"), option({ value: "neapolitan" }, "Neapolitan"), option({ value: "mono" }, "Mono"));
        this._cancelButton = button({ class: "cancelButton" });
        this._okayButton = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this.container = div({ class: "prompt noSelection", style: "width: 220px;" }, h2("Set Theme"), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ class: "selectContainer", style: "width: 100%;" }, this._themeSelect)), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton), this._cancelButton);
        this.lastTheme = window.localStorage.getItem("colorTheme");
        this._close = () => {
            if (this.lastTheme != null) {
                ColorConfig.setTheme(this.lastTheme);
            }
            else {
                ColorConfig.setTheme("dark classic");
            }
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._okayButton.removeEventListener("click", this._saveChanges);
            this._cancelButton.removeEventListener("click", this._close);
            this.container.removeEventListener("keydown", this._whenKeyPressed);
        };
        this._whenKeyPressed = (event) => {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                this._saveChanges();
            }
        };
        this._saveChanges = () => {
            window.localStorage.setItem("colorTheme", this._themeSelect.value);
            this._doc.prompt = null;
            this._doc.prefs.colorTheme = this._themeSelect.value;
            this._doc.undo();
        };
        this._previewTheme = () => {
            ColorConfig.setTheme(this._themeSelect.value);
            this._doc.notifier.changed();
        };
        if (this.lastTheme != null) {
            this._themeSelect.value = this.lastTheme;
        }
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this.container.addEventListener("keydown", this._whenKeyPressed);
        this._themeSelect.addEventListener("change", this._previewTheme);
    }
}
//# sourceMappingURL=ThemePrompt.js.map