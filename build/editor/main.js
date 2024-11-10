import { Config } from "../synth/SynthConfig";
import { isMobile, EditorConfig } from "./EditorConfig";
import { ColorConfig } from "./ColorConfig";
import "./style";
import { SongEditor } from "./SongEditor";
import { Note, Pattern, Instrument, Channel, Song, Synth } from "../synth/synth";
import { SongDocument } from "./SongDocument";
import { ExportPrompt } from "./ExportPrompt";
import { ChangePreset } from "./changes";
const doc = new SongDocument();
const editor = new SongEditor(doc);
const beepboxEditorContainer = document.getElementById("beepboxEditorContainer");
beepboxEditorContainer.appendChild(editor.mainLayer);
editor.whenUpdated();
editor.mainLayer.className += " load";
editor.mainLayer.getElementsByClassName("pattern-area")[0].className += " load";
editor.mainLayer.getElementsByClassName("settings-area")[0].className += " load";
editor.mainLayer.getElementsByClassName("editor-song-settings")[0].className += " load";
editor.mainLayer.getElementsByClassName("instrument-settings-area")[0].className += " load";
editor.mainLayer.getElementsByClassName("trackAndMuteContainer")[0].className += " load";
editor.mainLayer.getElementsByClassName("barScrollBar")[0].className += " load";
$('#pitchPresetSelect').select2({ dropdownAutoWidth: true });
$('#drumPresetSelect').select2({ dropdownAutoWidth: true });
$("body").on('click', '.select2-container--open .select2-results__group', function () {
    $(this).siblings().toggle();
});
$("#pitchPresetSelect").on('select2:open', function () {
    $('.select2-dropdown--below').css('opacity', 0);
    $('.select2-dropdown').css('opacity', 1);
    $('#pitchPresetSelect');
    setTimeout(() => {
        let groups = $('.select2-container--open .select2-results__group');
        let options = $('.select2-container--open .select2-results__option');
        $.each(groups, (index, v) => {
            $(v).siblings().hide();
            $(v)[0].setAttribute("style", "color: " + ColorConfig.getChannelColor(doc.song, doc.channel).primaryNote + ";");
        });
        $.each(options, (index, v) => {
            $(v)[0].setAttribute("style", "color: " + ColorConfig.getChannelColor(doc.song, doc.channel).primaryNote + ";");
        });
        $('.select2-dropdown--below').css('opacity', 1);
    }, 0);
});
$("#drumPresetSelect").on('select2:open', function () {
    $('.select2-dropdown--below').css('opacity', 0);
    $('.select2-dropdown').css('opacity', 1);
    $('#drumPresetSelect');
    setTimeout(() => {
        let groups = $('.select2-container--open .select2-results__group');
        let options = $('.select2-container--open .select2-results__option');
        $.each(groups, (index, v) => {
            $(v).siblings().hide();
            $(v)[0].setAttribute("style", "color: " + ColorConfig.getChannelColor(doc.song, doc.channel).primaryNote + ";");
        });
        $.each(options, (index, v) => {
            $(v)[0].setAttribute("style", "color: " + ColorConfig.getChannelColor(doc.song, doc.channel).primaryNote + ";");
        });
        $('.select2-dropdown--below').css('opacity', 1);
    }, 0);
});
$('#pitchPresetSelect').on("change", editor._whenSetPitchedPreset);
$('#pitchPresetSelect').on("select2:close", editor._refocus);
$('#drumPresetSelect').on("change", editor._whenSetDrumPreset);
$('#drumPresetSelect').on("select2:close", editor._refocus);
editor.mainLayer.focus();
if (!isMobile && doc.prefs.autoPlay) {
    function autoplay() {
        if (!document.hidden) {
            doc.synth.play();
            editor.updatePlayButton();
            window.removeEventListener("visibilitychange", autoplay);
        }
    }
    if (document.hidden) {
        window.addEventListener("visibilitychange", autoplay);
    }
    else {
        autoplay();
    }
}
if ("scrollRestoration" in history)
    history.scrollRestoration = "manual";
editor.updatePlayButton();
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service_worker.js", { updateViaCache: "all", scope: "/" }).catch(() => { });
}
export { Config, Note, Pattern, Instrument, Channel, Song, Synth, ColorConfig, EditorConfig, SongDocument, SongEditor, ExportPrompt, ChangePreset };
//# sourceMappingURL=main.js.map