var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Config } from "../synth/SynthConfig";
import { analogousDrumMap } from "./Midi";
const id = ((Math.random() * 0xffffffff) >>> 0).toString(16);
export class MidiInputHandler {
    constructor(_doc) {
        this._doc = _doc;
        this._takeMidiHandlerFocus = (event) => {
            localStorage.setItem("midiHandlerId", id);
        };
        this._handleStateChange = (event) => {
            if (event.port.type !== "input")
                return;
            switch (event.port.state) {
                case "connected":
                    this._registerMidiInput(event.port);
                    break;
                case "disconnected":
                    this._unregisterMidiInput(event.port);
                    break;
            }
        };
        this._registerMidiInput = (midiInput) => {
            midiInput.addEventListener("midimessage", this._onMidiMessage);
        };
        this._unregisterMidiInput = (midiInput) => {
            midiInput.removeEventListener("midimessage", this._onMidiMessage);
            this._doc.performance.clearAllPitches();
        };
        this._onMidiMessage = (event) => {
            if (!this._doc.prefs.enableMidi || localStorage.getItem("midiHandlerId") != id)
                return;
            const isDrum = this._doc.song.getChannelIsNoise(this._doc.channel);
            let [eventType, key, velocity] = event.data;
            eventType &= 0xF0;
            if (isDrum) {
                const drum = analogousDrumMap[key];
                if (drum != undefined) {
                    key = drum.frequency;
                }
                else {
                    return;
                }
            }
            else {
                key -= Config.keys[this._doc.song.key].basePitch;
                if (key < 0 || key > Config.maxPitch)
                    return;
            }
            if (eventType == 144 && velocity == 0) {
                eventType = 128;
            }
            switch (eventType) {
                case 144:
                    this._doc.synth.preferLowerLatency = true;
                    this._doc.performance.addPerformedPitch(key);
                    break;
                case 128:
                    this._doc.performance.removePerformedPitch(key);
                    break;
            }
        };
        this.registerMidiAccessHandler();
    }
    registerMidiAccessHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            if (navigator.requestMIDIAccess == null)
                return;
            try {
                const midiAccess = yield navigator.requestMIDIAccess();
                midiAccess.inputs.forEach(this._registerMidiInput);
                midiAccess.addEventListener("statechange", this._handleStateChange);
                this._takeMidiHandlerFocus();
                window.addEventListener("focus", this._takeMidiHandlerFocus);
            }
            catch (e) {
                console.error("Failed to get MIDI access", e);
            }
        });
    }
}
//# sourceMappingURL=MidiInput.js.map