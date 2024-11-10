import { Config } from "../synth/SynthConfig";
export class KeyboardLayout {
    constructor(_doc) {
        this._doc = _doc;
        this._possiblyPlayingPitchesFromKeyboard = false;
        this._onWindowBlur = (event) => {
            if (this._possiblyPlayingPitchesFromKeyboard) {
                this._doc.performance.clearAllPitches();
                this._possiblyPlayingPitchesFromKeyboard = false;
            }
        };
        window.addEventListener("blur", this._onWindowBlur);
    }
    static keyPosToPitch(doc, x, y, keyboardLayout) {
        let pitchOffset = null;
        let forcedKey = null;
        switch (keyboardLayout) {
            case "wickiHayden":
                pitchOffset = y * 5 + x * 2 - 2;
                break;
            case "songScale":
                const scaleFlags = Config.scales[doc.song.scale].flags;
                const scaleIndices = scaleFlags.map((flag, index) => flag ? index : null).filter((index) => index != null);
                pitchOffset = (y - 1 + Math.floor(x / scaleIndices.length)) * Config.pitchesPerOctave + scaleIndices[(x + scaleIndices.length) % scaleIndices.length];
                break;
            case "pianoAtC":
                pitchOffset = KeyboardLayout._pianoAtC[y][x];
                forcedKey = Config.keys.dictionary["C"].basePitch;
                break;
            case "pianoAtA":
                pitchOffset = KeyboardLayout._pianoAtA[y][x];
                forcedKey = Config.keys.dictionary["A"].basePitch;
                break;
            case "pianoTransposingC":
                pitchOffset = KeyboardLayout._pianoAtC[y][x];
                break;
            case "pianoTransposingA":
                pitchOffset = KeyboardLayout._pianoAtA[y][x];
                break;
        }
        if (pitchOffset == null)
            return null;
        const octaveOffset = Math.max(0, doc.song.channels[doc.channel].octave - 1) * Config.pitchesPerOctave;
        let keyOffset = 0;
        if (forcedKey != null) {
            const keyBasePitch = Config.keys[doc.song.key].basePitch;
            keyOffset = (forcedKey - keyBasePitch + 144) % 12;
        }
        const pitch = octaveOffset + keyOffset + pitchOffset;
        if (pitch < 0 || pitch > Config.maxPitch)
            return null;
        return pitch;
    }
    handleKeyEvent(event, pressed) {
        switch (event.code) {
            case "Backquote":
                this.handleKey(-1, 3, pressed);
                break;
            case "Digit1":
                this.handleKey(0, 3, pressed);
                break;
            case "Digit2":
                this.handleKey(1, 3, pressed);
                break;
            case "Digit3":
                this.handleKey(2, 3, pressed);
                break;
            case "Digit4":
                this.handleKey(3, 3, pressed);
                break;
            case "Digit5":
                this.handleKey(4, 3, pressed);
                break;
            case "Digit6":
                this.handleKey(5, 3, pressed);
                break;
            case "Digit7":
                this.handleKey(6, 3, pressed);
                break;
            case "Digit8":
                this.handleKey(7, 3, pressed);
                break;
            case "Digit9":
                this.handleKey(8, 3, pressed);
                break;
            case "Digit0":
                this.handleKey(9, 3, pressed);
                break;
            case "Minus":
                this.handleKey(10, 3, pressed);
                break;
            case "Equal":
                this.handleKey(11, 3, pressed);
                break;
            case "IntlYen":
                this.handleKey(12, 3, pressed);
                break;
            case "KeyQ":
                this.handleKey(0, 2, pressed);
                break;
            case "KeyW":
                this.handleKey(1, 2, pressed);
                break;
            case "KeyE":
                this.handleKey(2, 2, pressed);
                break;
            case "KeyR":
                this.handleKey(3, 2, pressed);
                break;
            case "KeyT":
                this.handleKey(4, 2, pressed);
                break;
            case "KeyY":
                this.handleKey(5, 2, pressed);
                break;
            case "KeyU":
                this.handleKey(6, 2, pressed);
                break;
            case "KeyI":
                this.handleKey(7, 2, pressed);
                break;
            case "KeyO":
                this.handleKey(8, 2, pressed);
                break;
            case "KeyP":
                this.handleKey(9, 2, pressed);
                break;
            case "BracketLeft":
                this.handleKey(10, 2, pressed);
                break;
            case "BracketRight":
                this.handleKey(11, 2, pressed);
                break;
            case "Backslash":
                if (event.key == "\\" || event.key == "|") {
                    this.handleKey(12, 2, pressed);
                }
                else {
                    this.handleKey(11, 1, pressed);
                }
                break;
            case "KeyA":
                this.handleKey(0, 1, pressed);
                break;
            case "KeyS":
                this.handleKey(1, 1, pressed);
                break;
            case "KeyD":
                this.handleKey(2, 1, pressed);
                break;
            case "KeyF":
                this.handleKey(3, 1, pressed);
                break;
            case "KeyG":
                this.handleKey(4, 1, pressed);
                break;
            case "KeyH":
                this.handleKey(5, 1, pressed);
                break;
            case "KeyJ":
                this.handleKey(6, 1, pressed);
                break;
            case "KeyK":
                this.handleKey(7, 1, pressed);
                break;
            case "KeyL":
                this.handleKey(8, 1, pressed);
                break;
            case "Semicolon":
                this.handleKey(9, 1, pressed);
                break;
            case "Quote":
                this.handleKey(10, 1, pressed);
                break;
            case "IntlHash":
                this.handleKey(11, 1, pressed);
                break;
            case "IntlBackslash":
                this.handleKey(-1, 0, pressed);
                break;
            case "KeyZ":
                this.handleKey(0, 0, pressed);
                break;
            case "KeyX":
                this.handleKey(1, 0, pressed);
                break;
            case "KeyC":
                this.handleKey(2, 0, pressed);
                break;
            case "KeyV":
                this.handleKey(3, 0, pressed);
                break;
            case "KeyB":
                this.handleKey(4, 0, pressed);
                break;
            case "KeyN":
                this.handleKey(5, 0, pressed);
                break;
            case "KeyM":
                this.handleKey(6, 0, pressed);
                break;
            case "Comma":
                this.handleKey(7, 0, pressed);
                break;
            case "Period":
                this.handleKey(8, 0, pressed);
                break;
            case "Slash":
                this.handleKey(9, 0, pressed);
                break;
            case "IntlRo":
                this.handleKey(10, 0, pressed);
                break;
            default: return;
        }
        event.preventDefault();
    }
    handleKey(x, y, pressed) {
        const isDrum = this._doc.song.getChannelIsNoise(this._doc.channel);
        if (isDrum) {
            if (x >= 0 && x < Config.drumCount) {
                if (pressed) {
                    this._doc.synth.preferLowerLatency = true;
                    this._doc.performance.addPerformedPitch(x);
                    this._possiblyPlayingPitchesFromKeyboard = true;
                }
                else {
                    this._doc.performance.removePerformedPitch(x);
                }
            }
            return;
        }
        const pitch = KeyboardLayout.keyPosToPitch(this._doc, x, y, this._doc.prefs.keyboardLayout);
        if (pitch != null) {
            if (pressed) {
                this._doc.synth.preferLowerLatency = true;
                this._doc.performance.addPerformedPitch(pitch);
                this._possiblyPlayingPitchesFromKeyboard = true;
            }
            else {
                this._doc.performance.removePerformedPitch(pitch);
            }
        }
    }
}
KeyboardLayout._pianoAtC = [
    [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17],
    [null, 1, 3, null, 6, 8, 10, null, 13, 15, null, 18],
    [12, 14, 16, 17, 19, 21, 23, 24, 26, 28, 29, 31, 33],
    [null, 13, 15, null, 18, 20, 22, null, 25, 27, null, 30, 32],
];
KeyboardLayout._pianoAtA = [
    [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17],
    [-1, 1, null, 4, 6, null, 9, 11, 13, null, 16, 18],
    [12, 14, 15, 17, 19, 20, 22, 24, 26, 27, 29, 31, 32],
    [11, 13, null, 16, 18, null, 21, 23, 25, null, 28, 30, null],
];
//# sourceMappingURL=KeyboardLayout.js.map