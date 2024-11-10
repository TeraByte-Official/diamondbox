import { Config } from "../synth/SynthConfig";
import { isMobile } from "./EditorConfig";
import { Song, Synth } from "../synth/synth";
import { SongRecovery, generateUid } from "./SongRecovery";
import { ColorConfig } from "./ColorConfig";
import { Layout } from "./Layout";
import { SongPerformance } from "./SongPerformance";
import { Selection } from "./Selection";
import { Preferences } from "./Preferences";
import { ChangeNotifier } from "./ChangeNotifier";
import { ChangeSong, setDefaultInstruments, discardInvalidPatternInstruments } from "./changes";
export class SongDocument {
    constructor() {
        this.notifier = new ChangeNotifier();
        this.selection = new Selection(this);
        this.prefs = new Preferences();
        this.channel = 0;
        this.muteEditorChannel = 0;
        this.bar = 0;
        this.recentPatternInstruments = [];
        this.viewedInstrument = [];
        this.trackVisibleBars = 16;
        this.trackVisibleChannels = 4;
        this.barScrollPos = 0;
        this.channelScrollPos = 0;
        this.prompt = null;
        this.addedEffect = false;
        this.addedEnvelope = false;
        this.currentPatternIsDirty = false;
        this._recovery = new SongRecovery();
        this._recentChange = null;
        this._sequenceNumber = 0;
        this._lastSequenceNumber = 0;
        this._stateShouldBePushed = false;
        this._recordedNewSong = false;
        this._waitingToUpdateState = false;
        this._whenHistoryStateChanged = () => {
            if (this.synth.recording) {
                this.performance.abortRecording();
            }
            if (window.history.state == null && window.location.hash != "") {
                this._sequenceNumber++;
                this._resetSongRecoveryUid();
                const state = { canUndo: true, sequenceNumber: this._sequenceNumber, bar: this.bar, channel: this.channel, instrument: this.viewedInstrument[this.channel], recoveryUid: this._recoveryUid, prompt: null, selection: this.selection.toJSON() };
                new ChangeSong(this, window.location.hash);
                this.prompt = state.prompt;
                if (this.prefs.displayBrowserUrl) {
                    this._replaceState(state, this.song.toBase64String());
                }
                else {
                    this._pushState(state, this.song.toBase64String());
                }
                this.forgetLastChange();
                this.notifier.notifyWatchers();
                this.synth.pause();
                this.synth.goToBar(0);
                return;
            }
            const state = this._getHistoryState();
            if (state == null)
                throw new Error("History state is null.");
            if (state.sequenceNumber == this._sequenceNumber)
                return;
            this.bar = state.bar;
            this.channel = state.channel;
            this.viewedInstrument[this.channel] = state.instrument;
            this._sequenceNumber = state.sequenceNumber;
            this.prompt = state.prompt;
            new ChangeSong(this, this._getHash());
            this._recoveryUid = state.recoveryUid;
            this.selection.fromJSON(state.selection);
            this.forgetLastChange();
            this.notifier.notifyWatchers();
        };
        this._cleanDocument = () => {
            this.notifier.notifyWatchers();
        };
        this._validateDocState = () => {
            const channelCount = this.song.getChannelCount();
            for (let i = this.recentPatternInstruments.length; i < channelCount; i++) {
                this.recentPatternInstruments[i] = [0];
            }
            this.recentPatternInstruments.length = channelCount;
            for (let i = 0; i < channelCount; i++) {
                if (i == this.channel) {
                    if (this.song.patternInstruments) {
                        const pattern = this.song.getPattern(this.channel, this.bar);
                        if (pattern != null) {
                            this.recentPatternInstruments[i] = pattern.instruments.concat();
                        }
                    }
                    else {
                        const channel = this.song.channels[this.channel];
                        for (let j = 0; j < channel.instruments.length; j++) {
                            this.recentPatternInstruments[i][j] = j;
                        }
                        this.recentPatternInstruments[i].length = channel.instruments.length;
                    }
                }
                discardInvalidPatternInstruments(this.recentPatternInstruments[i], this.song, i);
            }
            for (let i = this.viewedInstrument.length; i < channelCount; i++) {
                this.viewedInstrument[i] = 0;
            }
            this.viewedInstrument.length = channelCount;
            for (let i = 0; i < channelCount; i++) {
                if (this.song.patternInstruments && !this.song.layeredInstruments && i == this.channel) {
                    const pattern = this.song.getPattern(this.channel, this.bar);
                    if (pattern != null) {
                        this.viewedInstrument[i] = pattern.instruments[0];
                    }
                }
                this.viewedInstrument[i] = Math.min(this.viewedInstrument[i] | 0, this.song.channels[i].instruments.length - 1);
            }
            const highlightedPattern = this.getCurrentPattern();
            if (highlightedPattern != null && this.song.patternInstruments) {
                this.recentPatternInstruments[this.channel] = highlightedPattern.instruments.concat();
            }
            if ((!this.synth.playing && (this.bar < this.selection.boxSelectionBar || this.selection.boxSelectionBar + this.selection.boxSelectionWidth <= this.bar)) ||
                this.channel < this.selection.boxSelectionChannel ||
                this.selection.boxSelectionChannel + this.selection.boxSelectionHeight <= this.channel ||
                this.song.barCount < this.selection.boxSelectionBar + this.selection.boxSelectionWidth ||
                channelCount < this.selection.boxSelectionChannel + this.selection.boxSelectionHeight ||
                (this.selection.boxSelectionWidth == 1 && this.selection.boxSelectionHeight == 1)) {
                this.selection.resetBoxSelection();
            }
        };
        this._updateHistoryState = () => {
            this._waitingToUpdateState = false;
            let hash;
            try {
                hash = this.song.toBase64String();
            }
            catch (error) {
                window.alert("Whoops, the song data appears to have been corrupted! Please try to recover the last working version of the song from the \"Recover Recent Song...\" option in BeepBox's \"File\" menu.");
                return;
            }
            if (this._stateShouldBePushed)
                this._sequenceNumber++;
            if (this._recordedNewSong) {
                this._resetSongRecoveryUid();
            }
            else {
                this._recovery.saveVersion(this._recoveryUid, this.song.title, hash);
            }
            let state = { canUndo: true, sequenceNumber: this._sequenceNumber, bar: this.bar, channel: this.channel, instrument: this.viewedInstrument[this.channel], recoveryUid: this._recoveryUid, prompt: this.prompt, selection: this.selection.toJSON() };
            if (this._stateShouldBePushed) {
                this._pushState(state, hash);
            }
            else {
                this._replaceState(state, hash);
            }
            this._stateShouldBePushed = false;
            this._recordedNewSong = false;
        };
        this.notifier.watch(this._validateDocState);
        ColorConfig.setTheme(this.prefs.colorTheme);
        Layout.setLayout(this.prefs.layout);
        if (window.sessionStorage.getItem("currentUndoIndex") == null) {
            window.sessionStorage.setItem("currentUndoIndex", "0");
            window.sessionStorage.setItem("oldestUndoIndex", "0");
            window.sessionStorage.setItem("newestUndoIndex", "0");
        }
        let songString = window.location.hash;
        if (songString == "") {
            songString = this._getHash();
        }
        this.song = new Song(songString);
        if (songString == "" || songString == undefined) {
            setDefaultInstruments(this.song);
            this.song.scale = this.prefs.defaultScale;
        }
        songString = this.song.toBase64String();
        this.synth = new Synth(this.song);
        this.synth.volume = this._calcVolume();
        this.synth.anticipatePoorPerformance = isMobile;
        let state = this._getHistoryState();
        if (state == null) {
            state = { canUndo: false, sequenceNumber: 0, bar: 0, channel: 0, instrument: 0, recoveryUid: generateUid(), prompt: null, selection: this.selection.toJSON() };
        }
        if (state.recoveryUid == undefined)
            state.recoveryUid = generateUid();
        this._replaceState(state, songString);
        window.addEventListener("hashchange", this._whenHistoryStateChanged);
        window.addEventListener("popstate", this._whenHistoryStateChanged);
        this.bar = state.bar | 0;
        this.channel = state.channel | 0;
        for (let i = 0; i <= this.channel; i++)
            this.viewedInstrument[i] = 0;
        this.viewedInstrument[this.channel] = state.instrument | 0;
        this._recoveryUid = state.recoveryUid;
        this.prompt = state.prompt;
        this.selection.fromJSON(state.selection);
        for (const eventName of ["input", "change", "click", "keyup", "keydown", "mousedown", "mousemove", "mouseup", "touchstart", "touchmove", "touchend", "touchcancel"]) {
            window.addEventListener(eventName, this._cleanDocument);
        }
        this._validateDocState();
        this.performance = new SongPerformance(this);
    }
    toggleDisplayBrowserUrl() {
        const state = this._getHistoryState();
        this.prefs.displayBrowserUrl = !this.prefs.displayBrowserUrl;
        this._replaceState(state, this.song.toBase64String());
    }
    _getHistoryState() {
        if (this.prefs.displayBrowserUrl) {
            return window.history.state;
        }
        else {
            const json = JSON.parse(window.sessionStorage.getItem(window.sessionStorage.getItem("currentUndoIndex")));
            return json == null ? null : json.state;
        }
    }
    _getHash() {
        if (this.prefs.displayBrowserUrl) {
            return window.location.hash;
        }
        else {
            const json = JSON.parse(window.sessionStorage.getItem(window.sessionStorage.getItem("currentUndoIndex")));
            return json == null ? "" : json.hash;
        }
    }
    _replaceState(state, hash) {
        if (this.prefs.displayBrowserUrl) {
            window.history.replaceState(state, "", "#" + hash);
        }
        else {
            window.sessionStorage.setItem(window.sessionStorage.getItem("currentUndoIndex") || "0", JSON.stringify({ state, hash }));
            window.history.replaceState(null, "", location.pathname);
        }
    }
    _pushState(state, hash) {
        if (this.prefs.displayBrowserUrl) {
            window.history.pushState(state, "", "#" + hash);
        }
        else {
            let currentIndex = Number(window.sessionStorage.getItem("currentUndoIndex"));
            let oldestIndex = Number(window.sessionStorage.getItem("oldestUndoIndex"));
            currentIndex = (currentIndex + 1) % SongDocument._maximumUndoHistory;
            window.sessionStorage.setItem("currentUndoIndex", String(currentIndex));
            window.sessionStorage.setItem("newestUndoIndex", String(currentIndex));
            if (currentIndex == oldestIndex) {
                oldestIndex = (oldestIndex + 1) % SongDocument._maximumUndoHistory;
                window.sessionStorage.setItem("oldestUndoIndex", String(oldestIndex));
            }
            window.sessionStorage.setItem(String(currentIndex), JSON.stringify({ state, hash }));
            window.history.replaceState(null, "", location.pathname);
        }
        this._lastSequenceNumber = state.sequenceNumber;
    }
    hasRedoHistory() {
        return this._lastSequenceNumber > this._sequenceNumber;
    }
    _forward() {
        if (this.prefs.displayBrowserUrl) {
            window.history.forward();
        }
        else {
            let currentIndex = Number(window.sessionStorage.getItem("currentUndoIndex"));
            let newestIndex = Number(window.sessionStorage.getItem("newestUndoIndex"));
            if (currentIndex != newestIndex) {
                currentIndex = (currentIndex + 1) % SongDocument._maximumUndoHistory;
                window.sessionStorage.setItem("currentUndoIndex", String(currentIndex));
                setTimeout(this._whenHistoryStateChanged);
            }
        }
    }
    _back() {
        if (this.prefs.displayBrowserUrl) {
            window.history.back();
        }
        else {
            let currentIndex = Number(window.sessionStorage.getItem("currentUndoIndex"));
            let oldestIndex = Number(window.sessionStorage.getItem("oldestUndoIndex"));
            if (currentIndex != oldestIndex) {
                currentIndex = (currentIndex + SongDocument._maximumUndoHistory - 1) % SongDocument._maximumUndoHistory;
                window.sessionStorage.setItem("currentUndoIndex", String(currentIndex));
                setTimeout(this._whenHistoryStateChanged);
            }
        }
    }
    record(change, replace = false, newSong = false) {
        if (change.isNoop()) {
            this._recentChange = null;
            if (replace)
                this._back();
        }
        else {
            change.commit();
            this._recentChange = change;
            this._stateShouldBePushed = this._stateShouldBePushed || !replace;
            this._recordedNewSong = this._recordedNewSong || newSong;
            if (!this._waitingToUpdateState) {
                window.requestAnimationFrame(this._updateHistoryState);
                this._waitingToUpdateState = true;
            }
        }
    }
    _resetSongRecoveryUid() {
        this._recoveryUid = generateUid();
    }
    openPrompt(prompt) {
        this.prompt = prompt;
        const hash = this.song.toBase64String();
        this._sequenceNumber++;
        const state = { canUndo: true, sequenceNumber: this._sequenceNumber, bar: this.bar, channel: this.channel, instrument: this.viewedInstrument[this.channel], recoveryUid: this._recoveryUid, prompt: this.prompt, selection: this.selection.toJSON() };
        this._pushState(state, hash);
    }
    undo() {
        const state = this._getHistoryState();
        if (state.canUndo)
            this._back();
    }
    redo() {
        this._forward();
    }
    setProspectiveChange(change) {
        this._recentChange = change;
    }
    forgetLastChange() {
        this._recentChange = null;
    }
    lastChangeWas(change) {
        return change != null && change == this._recentChange;
    }
    goBackToStart() {
        this.bar = 0;
        this.channel = 0;
        this.barScrollPos = 0;
        this.channelScrollPos = 0;
        this.synth.snapToStart();
        this.notifier.changed();
    }
    setVolume(val) {
        this.prefs.volume = val;
        this.prefs.save();
        this.synth.volume = this._calcVolume();
    }
    _calcVolume() {
        return Math.min(1.0, Math.pow(this.prefs.volume / 50.0, 0.5)) * Math.pow(2.0, (this.prefs.volume - 75.0) / 25.0);
    }
    getCurrentPattern(barOffset = 0) {
        return this.song.getPattern(this.channel, this.bar + barOffset);
    }
    getCurrentInstrument(barOffset = 0) {
        if (barOffset == 0) {
            return this.viewedInstrument[this.channel];
        }
        else {
            const pattern = this.getCurrentPattern(barOffset);
            return pattern == null ? 0 : pattern.instruments[0];
        }
    }
    getMobileLayout() {
        return (this.prefs.layout == "wide") ? window.innerWidth <= 1000 : window.innerWidth <= 710;
    }
    getBarWidth() {
        return (!this.getMobileLayout() && this.prefs.enableChannelMuting && (!this.getFullScreen() || this.prefs.layout == "wide")) ? 30 : 32;
    }
    getChannelHeight() {
        const squashed = this.getMobileLayout() || this.song.getChannelCount() > 4 || (this.song.barCount > this.trackVisibleBars && this.song.getChannelCount() > 3);
        const megaSquashed = !this.getMobileLayout() && (((this.prefs.layout != "wide") && this.song.getChannelCount() > 11) || this.song.getChannelCount() > 22);
        return megaSquashed ? 23 : (squashed ? 27 : 32);
    }
    getFullScreen() {
        return !this.getMobileLayout() && (this.prefs.layout != "small");
    }
    getVisibleOctaveCount() {
        return this.getFullScreen() ? this.prefs.visibleOctaves : Preferences.defaultVisibleOctaves;
    }
    getVisiblePitchCount() {
        return this.getVisibleOctaveCount() * Config.pitchesPerOctave + 1;
    }
    getBaseVisibleOctave(channel) {
        const visibleOctaveCount = this.getVisibleOctaveCount();
        return Math.max(0, Math.min(Config.pitchOctaves - visibleOctaveCount, Math.ceil(this.song.channels[channel].octave - visibleOctaveCount * 0.5)));
    }
}
SongDocument._maximumUndoHistory = 300;
//# sourceMappingURL=SongDocument.js.map