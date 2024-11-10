import { Song } from "../synth/synth";
const versionPrefix = "songVersion: ";
const maximumSongCount = 8;
const maximumWorkPerVersion = 3 * 60 * 1000;
const minimumWorkPerSpan = 1 * 60 * 1000;
function keyIsVersion(key) {
    return key.indexOf(versionPrefix) == 0;
}
function keyToVersion(key) {
    return JSON.parse(key.substring(versionPrefix.length));
}
export function versionToKey(version) {
    return versionPrefix + JSON.stringify(version);
}
export function generateUid() {
    return ((Math.random() * (-1 >>> 0)) >>> 0).toString(32);
}
function compareSongs(a, b) {
    return b.versions[0].time - a.versions[0].time;
}
function compareVersions(a, b) {
    return b.time - a.time;
}
export class SongRecovery {
    constructor() {
        this._song = new Song();
    }
    static getAllRecoveredSongs() {
        const songs = [];
        const songsByUid = {};
        for (let i = 0; i < localStorage.length; i++) {
            const itemKey = localStorage.key(i);
            if (keyIsVersion(itemKey)) {
                const version = keyToVersion(itemKey);
                let song = songsByUid[version.uid];
                if (song == undefined) {
                    song = { versions: [] };
                    songsByUid[version.uid] = song;
                    songs.push(song);
                }
                song.versions.push(version);
            }
        }
        for (const song of songs) {
            song.versions.sort(compareVersions);
        }
        songs.sort(compareSongs);
        return songs;
    }
    saveVersion(uid, name, songData) {
        const newName = name;
        const newTime = Math.round(Date.now());
        clearTimeout(this._saveVersionTimeoutHandle);
        this._saveVersionTimeoutHandle = setTimeout(() => {
            try {
                this._song.fromBase64String(songData);
            }
            catch (error) {
                window.alert("Whoops, the song data appears to have been corrupted! Please try to recover the last working version of the song from the \"Recover Recent Song...\" option in BeepBox's \"File\" menu.");
                return;
            }
            const songs = SongRecovery.getAllRecoveredSongs();
            let currentSong = null;
            for (const song of songs) {
                if (song.versions[0].uid == uid) {
                    currentSong = song;
                }
            }
            if (currentSong == null) {
                currentSong = { versions: [] };
                songs.unshift(currentSong);
            }
            let versions = currentSong.versions;
            let newWork = 1000;
            if (versions.length > 0) {
                const mostRecentTime = versions[0].time;
                const mostRecentWork = versions[0].work;
                newWork = mostRecentWork + Math.min(maximumWorkPerVersion, newTime - mostRecentTime);
            }
            const newVersion = { uid: uid, name: newName, time: newTime, work: newWork };
            const newKey = versionToKey(newVersion);
            versions.unshift(newVersion);
            localStorage.setItem(newKey, songData);
            let minSpan = minimumWorkPerSpan;
            const spanMult = Math.pow(2, 1 / 2);
            for (var i = 1; i < versions.length; i++) {
                const currentWork = versions[i].work;
                const olderWork = (i == versions.length - 1) ? 0.0 : versions[i + 1].work;
                if (currentWork - olderWork < minSpan) {
                    let indexToDiscard = i;
                    if (i < versions.length - 1) {
                        const currentTime = versions[i].time;
                        const newerTime = versions[i - 1].time;
                        const olderTime = versions[i + 1].time;
                        if ((currentTime - olderTime) < 0.5 * (newerTime - currentTime)) {
                            indexToDiscard = i + 1;
                        }
                    }
                    localStorage.removeItem(versionToKey(versions[indexToDiscard]));
                    break;
                }
                minSpan *= spanMult;
            }
            while (songs.length > maximumSongCount) {
                let leastImportantSong = null;
                let leastImportance = Number.POSITIVE_INFINITY;
                for (let i = Math.round(maximumSongCount / 2); i < songs.length; i++) {
                    const song = songs[i];
                    const timePassed = newTime - song.versions[0].time;
                    const timeScale = 1.0 / ((timePassed / (12 * 60 * 60 * 1000)) + 1.0);
                    const adjustedWork = song.versions[0].work + 5 * 60 * 1000;
                    const weight = adjustedWork * timeScale;
                    if (leastImportance > weight) {
                        leastImportance = weight;
                        leastImportantSong = song;
                    }
                }
                for (const version of leastImportantSong.versions) {
                    localStorage.removeItem(versionToKey(version));
                }
                songs.splice(songs.indexOf(leastImportantSong), 1);
            }
        }, 750);
    }
}
//# sourceMappingURL=SongRecovery.js.map