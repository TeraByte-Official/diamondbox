/*!
Copyright (c) 2012-2022 John Nesky and contributing authors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
export const TypePresets = ["chip wave", "FM", "basic noise", "spectrum", "drumset", "harmonics", "pulse width", "picked string", "custom chip", "mod", "advanced FM"];
export class Config {
}
Config.thresholdVal = -10;
Config.kneeVal = 40;
Config.ratioVal = 12;
Config.attackVal = 0;
Config.releaseVal = 0.25;
Config.scales = toNameMap([
    { name: "Free", realName: "chromatic", flags: [true, true, true, true, true, true, true, true, true, true, true, true] },
    { name: "Major", realName: "ionian", flags: [true, false, true, false, true, true, false, true, false, true, false, true] },
    { name: "Minor", realName: "aeolian", flags: [true, false, true, true, false, true, false, true, true, false, true, false] },
    { name: "Mixolydian", realName: "mixolydian", flags: [true, false, true, false, true, true, false, true, false, true, true, false] },
    { name: "Lydian", realName: "lydian", flags: [true, false, true, false, true, false, true, true, false, true, false, true] },
    { name: "Dorian", realName: "dorian", flags: [true, false, true, true, false, true, false, true, false, true, true, false] },
    { name: "Phrygian", realName: "phrygian", flags: [true, true, false, true, false, true, false, true, true, false, true, false] },
    { name: "Locrian", realName: "locrian", flags: [true, true, false, true, false, true, true, false, true, false, true, false] },
    { name: "Lydian Dominant", realName: "lydian dominant", flags: [true, false, true, false, true, false, true, true, false, true, true, false] },
    { name: "Phrygian Dominant", realName: "phrygian dominant", flags: [true, true, false, false, true, true, false, true, true, false, true, false] },
    { name: "Harmonic Major", realName: "harmonic major", flags: [true, false, true, false, true, true, false, true, true, false, false, true] },
    { name: "Harmonic Minor", realName: "harmonic minor", flags: [true, false, true, true, false, true, false, true, true, false, false, true] },
    { name: "Melodic Minor", realName: "melodic minor", flags: [true, false, true, true, false, true, false, true, false, true, false, true] },
    { name: "Blues", realName: "blues", flags: [true, false, false, true, false, true, true, true, false, false, true, false] },
    { name: "Altered", realName: "altered", flags: [true, true, false, true, true, false, true, false, true, false, true, false] },
    { name: "Major Pentatonic", realName: "major pentatonic", flags: [true, false, true, false, true, false, false, true, false, true, false, false] },
    { name: "Minor Pentatonic", realName: "minor pentatonic", flags: [true, false, false, true, false, true, false, true, false, false, true, false] },
    { name: "Whole Tone", realName: "whole tone", flags: [true, false, true, false, true, false, true, false, true, false, true, false] },
    { name: "Octatonic", realName: "octatonic", flags: [true, false, true, true, false, true, true, false, true, true, false, true] },
    { name: "Hexatonic", realName: "hexatonic", flags: [true, false, false, true, true, false, false, true, true, false, false, true] },
    { name: "what", realName: "what", flags: [true, false, true, true, false, true, true, false, false, false, true, false] },
    { name: "Custom", realName: "custom", flags: [true, false, true, true, false, false, false, true, true, false, true, true] },
]);
Config.keys = toNameMap([
    { name: "C", isWhiteKey: true, basePitch: 12 },
    { name: "C♯", isWhiteKey: false, basePitch: 13 },
    { name: "D", isWhiteKey: true, basePitch: 14 },
    { name: "D♯", isWhiteKey: false, basePitch: 15 },
    { name: "E", isWhiteKey: true, basePitch: 16 },
    { name: "F", isWhiteKey: true, basePitch: 17 },
    { name: "F♯", isWhiteKey: false, basePitch: 18 },
    { name: "G", isWhiteKey: true, basePitch: 19 },
    { name: "G♯", isWhiteKey: false, basePitch: 20 },
    { name: "A", isWhiteKey: true, basePitch: 21 },
    { name: "A♯", isWhiteKey: false, basePitch: 22 },
    { name: "B", isWhiteKey: true, basePitch: 23 },
]);
Config.blackKeyNameParents = [-1, 1, -1, 1, -1, 1, -1, -1, 1, -1, 1, -1];
Config.tempoMin = 30;
Config.tempoMax = 320;
Config.echoDelayRange = 24;
Config.echoDelayStepTicks = 4;
Config.echoSustainRange = 8;
Config.echoShelfHz = 4000.0;
Config.echoShelfGain = Math.pow(2.0, -0.5);
Config.reverbShelfHz = 8000.0;
Config.reverbShelfGain = Math.pow(2.0, -1.5);
Config.reverbRange = 32;
Config.reverbDelayBufferSize = 16384;
Config.reverbDelayBufferMask = Config.reverbDelayBufferSize - 1;
Config.beatsPerBarMin = 2;
Config.beatsPerBarMax = 16;
Config.barCountMin = 1;
Config.barCountMax = 256;
Config.instrumentCountMin = 1;
Config.layeredInstrumentCountMax = 4;
Config.patternInstrumentCountMax = 10;
Config.partsPerBeat = 24;
Config.ticksPerPart = 2;
Config.ticksPerArpeggio = 3;
Config.arpeggioPatterns = [[0], [0, 1], [0, 1, 2, 1], [0, 1, 2, 3], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5, 6], [0, 1, 2, 3, 4, 5, 6, 7]];
Config.rhythms = toNameMap([
    { name: "÷3 (triplets)", stepsPerBeat: 3, roundUpThresholds: [5, 12, 18] },
    { name: "÷4 (standard)", stepsPerBeat: 4, roundUpThresholds: [3, 9, 17, 21] },
    { name: "÷6", stepsPerBeat: 6, roundUpThresholds: null },
    { name: "÷8", stepsPerBeat: 8, roundUpThresholds: null },
    { name: "freehand", stepsPerBeat: 24, roundUpThresholds: null },
]);
Config.instrumentTypeNames = ["chip", "FM", "noise", "spectrum", "drumset", "harmonics", "PWM", "Picked String", "custom chip", "mod", "FM6op"];
Config.instrumentTypeHasSpecialInterval = [true, true, false, false, false, true, false, false, false, false];
Config.chipBaseExpression = 0.03375;
Config.fmBaseExpression = 0.03;
Config.noiseBaseExpression = 0.19;
Config.spectrumBaseExpression = 0.3;
Config.drumsetBaseExpression = 0.45;
Config.harmonicsBaseExpression = 0.025;
Config.pwmBaseExpression = 0.04725;
Config.pickedStringBaseExpression = 0.025;
Config.distortionBaseVolume = 0.011;
Config.bitcrusherBaseVolume = 0.010;
Config.rawChipWaves = toNameMap([
    { name: "rounded", expression: 0.94, samples: centerWave([0.0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.0, -0.2, -0.4, -0.5, -0.6, -0.7, -0.8, -0.85, -0.9, -0.95, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -0.95, -0.9, -0.85, -0.8, -0.7, -0.6, -0.5, -0.4, -0.2]) },
    { name: "triangle", expression: 1.0, samples: centerWave([1.0 / 15.0, 3.0 / 15.0, 5.0 / 15.0, 7.0 / 15.0, 9.0 / 15.0, 11.0 / 15.0, 13.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 13.0 / 15.0, 11.0 / 15.0, 9.0 / 15.0, 7.0 / 15.0, 5.0 / 15.0, 3.0 / 15.0, 1.0 / 15.0, -1.0 / 15.0, -3.0 / 15.0, -5.0 / 15.0, -7.0 / 15.0, -9.0 / 15.0, -11.0 / 15.0, -13.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -13.0 / 15.0, -11.0 / 15.0, -9.0 / 15.0, -7.0 / 15.0, -5.0 / 15.0, -3.0 / 15.0, -1.0 / 15.0]) },
    { name: "square", expression: 0.5, samples: centerWave([1.0, -1.0]) },
    { name: "1/4 pulse", expression: 0.5, samples: centerWave([1.0, -1.0, -1.0, -1.0]) },
    { name: "1/8 pulse", expression: 0.5, samples: centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]) },
    { name: "sawtooth", expression: 0.65, samples: centerWave([1.0 / 31.0, 3.0 / 31.0, 5.0 / 31.0, 7.0 / 31.0, 9.0 / 31.0, 11.0 / 31.0, 13.0 / 31.0, 15.0 / 31.0, 17.0 / 31.0, 19.0 / 31.0, 21.0 / 31.0, 23.0 / 31.0, 25.0 / 31.0, 27.0 / 31.0, 29.0 / 31.0, 31.0 / 31.0, -31.0 / 31.0, -29.0 / 31.0, -27.0 / 31.0, -25.0 / 31.0, -23.0 / 31.0, -21.0 / 31.0, -19.0 / 31.0, -17.0 / 31.0, -15.0 / 31.0, -13.0 / 31.0, -11.0 / 31.0, -9.0 / 31.0, -7.0 / 31.0, -5.0 / 31.0, -3.0 / 31.0, -1.0 / 31.0]) },
    { name: "double saw", expression: 0.5, samples: centerWave([0.0, -0.2, -0.4, -0.6, -0.8, -1.0, 1.0, -0.8, -0.6, -0.4, -0.2, 1.0, 0.8, 0.6, 0.4, 0.2]) },
    { name: "double pulse", expression: 0.4, samples: centerWave([1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0]) },
    { name: "spiky", expression: 0.4, samples: centerWave([1.0, -1.0, 1.0, -1.0, 1.0, 0.0]) },
    { name: "sine", expression: 0.88, samples: centerAndNormalizeWave([8.0, 9.0, 11.0, 12.0, 13.0, 14.0, 15.0, 15.0, 15.0, 15.0, 14.0, 14.0, 13.0, 11.0, 10.0, 9.0, 7.0, 6.0, 4.0, 3.0, 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 2.0, 4.0, 5.0, 6.0]) },
    { name: "flute", expression: 0.8, samples: centerAndNormalizeWave([3.0, 4.0, 6.0, 8.0, 10.0, 11.0, 13.0, 14.0, 15.0, 15.0, 14.0, 13.0, 11.0, 8.0, 5.0, 3.0]) },
    { name: "harp", expression: 0.8, samples: centerAndNormalizeWave([0.0, 3.0, 3.0, 3.0, 4.0, 5.0, 5.0, 6.0, 7.0, 8.0, 9.0, 11.0, 11.0, 13.0, 13.0, 15.0, 15.0, 14.0, 12.0, 11.0, 10.0, 9.0, 8.0, 7.0, 7.0, 5.0, 4.0, 3.0, 2.0, 1.0, 0.0, 0.0]) },
    { name: "sharp clarinet", expression: 0.38, samples: centerAndNormalizeWave([0.0, 0.0, 0.0, 1.0, 1.0, 8.0, 8.0, 9.0, 9.0, 9.0, 8.0, 8.0, 8.0, 8.0, 8.0, 9.0, 9.0, 7.0, 9.0, 9.0, 10.0, 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]) },
    { name: "soft clarinet", expression: 0.45, samples: centerAndNormalizeWave([0.0, 1.0, 5.0, 8.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 11.0, 11.0, 12.0, 13.0, 12.0, 10.0, 9.0, 7.0, 6.0, 4.0, 3.0, 3.0, 3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]) },
    { name: "alto sax", expression: 0.3, samples: centerAndNormalizeWave([5.0, 5.0, 6.0, 4.0, 3.0, 6.0, 8.0, 7.0, 2.0, 1.0, 5.0, 6.0, 5.0, 4.0, 5.0, 7.0, 9.0, 11.0, 13.0, 14.0, 14.0, 14.0, 14.0, 13.0, 10.0, 8.0, 7.0, 7.0, 4.0, 3.0, 4.0, 2.0]) },
    { name: "bassoon", expression: 0.35, samples: centerAndNormalizeWave([9.0, 9.0, 7.0, 6.0, 5.0, 4.0, 4.0, 4.0, 4.0, 5.0, 7.0, 8.0, 9.0, 10.0, 11.0, 13.0, 13.0, 11.0, 10.0, 9.0, 7.0, 6.0, 4.0, 2.0, 1.0, 1.0, 1.0, 2.0, 2.0, 5.0, 11.0, 14.0]) },
    { name: "trumpet", expression: 0.22, samples: centerAndNormalizeWave([10.0, 11.0, 8.0, 6.0, 5.0, 5.0, 5.0, 6.0, 7.0, 7.0, 7.0, 7.0, 6.0, 6.0, 7.0, 7.0, 7.0, 7.0, 7.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 7.0, 8.0, 9.0, 11.0, 14.0]) },
    { name: "electric guitar", expression: 0.2, samples: centerAndNormalizeWave([11.0, 12.0, 12.0, 10.0, 6.0, 6.0, 8.0, 0.0, 2.0, 4.0, 8.0, 10.0, 9.0, 10.0, 1.0, 7.0, 11.0, 3.0, 6.0, 6.0, 8.0, 13.0, 14.0, 2.0, 0.0, 12.0, 8.0, 4.0, 13.0, 11.0, 10.0, 13.0]) },
    { name: "organ", expression: 0.2, samples: centerAndNormalizeWave([11.0, 10.0, 12.0, 11.0, 14.0, 7.0, 5.0, 5.0, 12.0, 10.0, 10.0, 9.0, 12.0, 6.0, 4.0, 5.0, 13.0, 12.0, 12.0, 10.0, 12.0, 5.0, 2.0, 2.0, 8.0, 6.0, 6.0, 5.0, 8.0, 3.0, 2.0, 1.0]) },
    { name: "pan flute", expression: 0.35, samples: centerAndNormalizeWave([1.0, 4.0, 7.0, 6.0, 7.0, 9.0, 7.0, 7.0, 11.0, 12.0, 13.0, 15.0, 13.0, 11.0, 11.0, 12.0, 13.0, 10.0, 7.0, 5.0, 3.0, 6.0, 10.0, 7.0, 3.0, 3.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0]) },
    { name: "glitch", expression: 0.5, samples: centerWave([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0]) },
    { name: "trapezoid", expression: 1.0, samples: centerWave([1.0 / 15.0, 6.0 / 15.0, 10.0 / 15.0, 14.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 14.0 / 15.0, 10.0 / 15.0, 6.0 / 15.0, 1.0 / 15.0, -1.0 / 15.0, -6.0 / 15.0, -10.0 / 15.0, -14.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -14.0 / 15.0, -10.0 / 15.0, -6.0 / 15.0, -1.0 / 15.0,]) },
]);
Config.chipWaves = rawChipToIntegrated(Config.rawChipWaves);
Config.chipNoises = toNameMap([
    { name: "retro", expression: 0.25, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
    { name: "white", expression: 1.0, basePitch: 69, pitchFilterMult: 8.0, isSoft: true, samples: null },
    { name: "clang", expression: 0.4, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
    { name: "buzz", expression: 0.3, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
    { name: "hollow", expression: 1.5, basePitch: 96, pitchFilterMult: 1.0, isSoft: true, samples: null },
    { name: "shine", expression: 1.0, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
    { name: "deep", expression: 1.5, basePitch: 120, pitchFilterMult: 1024.0, isSoft: true, samples: null },
    { name: "cutter", expression: 0.005, basePitch: 96, pitchFilterMult: 1024.0, isSoft: false, samples: null },
    { name: "metallic", expression: 1.0, basePitch: 96, pitchFilterMult: 1024.0, isSoft: false, samples: null },
    { name: "static", expression: 1.0, basePitch: 96, pitchFilterMult: 1024.0, isSoft: false, samples: null },
]);
Config.filterFreqStep = 1.0 / 4.0;
Config.filterFreqRange = 34;
Config.filterFreqReferenceSetting = 28;
Config.filterFreqReferenceHz = 8000.0;
Config.filterFreqMaxHz = Config.filterFreqReferenceHz * Math.pow(2.0, Config.filterFreqStep * (Config.filterFreqRange - 1 - Config.filterFreqReferenceSetting));
Config.filterFreqMinHz = 8.0;
Config.filterGainRange = 15;
Config.filterGainCenter = 7;
Config.filterGainStep = 1.0 / 2.0;
Config.filterMaxPoints = 8;
Config.filterTypeNames = ["low-pass", "high-pass", "peak"];
Config.filterMorphCount = 10;
Config.filterSimpleCutRange = 11;
Config.filterSimplePeakRange = 8;
Config.fadeInRange = 10;
Config.fadeOutTicks = [-24, -12, -6, -3, -1, 6, 12, 24, 48, 72, 96];
Config.fadeOutNeutral = 4;
Config.drumsetFadeOutTicks = 48;
Config.transitions = toNameMap([
    { name: "normal", isSeamless: false, continues: false, slides: false, slideTicks: 3, includeAdjacentPatterns: false },
    { name: "interrupt", isSeamless: true, continues: false, slides: false, slideTicks: 3, includeAdjacentPatterns: true },
    { name: "continue", isSeamless: true, continues: true, slides: false, slideTicks: 3, includeAdjacentPatterns: true },
    { name: "slide", isSeamless: true, continues: false, slides: true, slideTicks: 3, includeAdjacentPatterns: true },
    { name: "slide in pattern", isSeamless: true, continues: false, slides: true, slideTicks: 3, includeAdjacentPatterns: false }
]);
Config.vibratos = toNameMap([
    { name: "none", amplitude: 0.0, type: 0, delayTicks: 0 },
    { name: "light", amplitude: 0.15, type: 0, delayTicks: 0 },
    { name: "delayed", amplitude: 0.3, type: 0, delayTicks: 37 },
    { name: "heavy", amplitude: 0.45, type: 0, delayTicks: 0 },
    { name: "shaky", amplitude: 0.1, type: 1, delayTicks: 0 },
]);
Config.vibratoTypes = toNameMap([
    { name: "normal", periodsSeconds: [0.14], period: 0.14 },
    { name: "shaky", periodsSeconds: [0.11, 1.618 * 0.11, 3 * 0.11], period: 266.97 },
]);
Config.arpSpeedScale = [0, 0.0625, 0.125, 0.2, 0.25, 1 / 3, 0.4, 0.5, 2 / 3, 0.75, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.15, 4.3, 4.5, 4.8, 5, 5.5, 6, 8];
Config.unisons = toNameMap([
    { name: "none", voices: 1, spread: 0.0, offset: 0.0, expression: 1.4, sign: 1.0 },
    { name: "shimmer", voices: 2, spread: 0.018, offset: 0.0, expression: 0.8, sign: 1.0 },
    { name: "hum", voices: 2, spread: 0.045, offset: 0.0, expression: 1.0, sign: 1.0 },
    { name: "honky tonk", voices: 2, spread: 0.09, offset: 0.0, expression: 1.0, sign: 1.0 },
    { name: "dissonant", voices: 2, spread: 0.25, offset: 0.0, expression: 0.9, sign: 1.0 },
    { name: "fifth", voices: 2, spread: 3.5, offset: 3.5, expression: 0.9, sign: 1.0 },
    { name: "octave", voices: 2, spread: 6.0, offset: 6.0, expression: 0.8, sign: 1.0 },
    { name: "bowed", voices: 2, spread: 0.02, offset: 0.0, expression: 1.0, sign: -1.0 },
    { name: "piano", voices: 2, spread: 0.01, offset: 0.0, expression: 1.0, sign: 0.7 },
    { name: "warbled", voices: 2, spread: 0.25, offset: 0.05, expression: 0.9, sign: -0.8 },
    { name: "hecking gosh", voices: 2, spread: 6.25, offset: -6.0, expression: 0.8, sign: -0.7 },
    { name: "dodecatonic", voices: 12, spread: 1, offset: -6.0, expression: 0.8, sign: -0.7 }
]);
Config.effectNames = ["reverb", "chorus", "panning", "distortion", "bitcrusher", "note filter", "echo", "pitch shift", "detune", "vibrato", "transition type", "chord type"];
Config.effectOrder = [2, 10, 11, 7, 8, 9, 5, 3, 4, 1, 6, 0];
Config.noteSizeMax = 6;
Config.volumeRange = 50;
Config.volumeLogScale = 0.1428;
Config.panCenter = 50;
Config.panMax = Config.panCenter * 2;
Config.panDelaySecondsMax = 0.001;
Config.chorusRange = 8;
Config.chorusPeriodSeconds = 2.0;
Config.chorusDelayRange = 0.0034;
Config.chorusDelayOffsets = [[1.51, 2.10, 3.35], [1.47, 2.15, 3.25]];
Config.chorusPhaseOffsets = [[0.0, 2.1, 4.2], [3.2, 5.3, 1.0]];
Config.chorusMaxDelay = Config.chorusDelayRange * (1.0 + Config.chorusDelayOffsets[0].concat(Config.chorusDelayOffsets[1]).reduce((x, y) => Math.max(x, y)));
Config.chords = toNameMap([
    { name: "simultaneous", customInterval: false, arpeggiates: false, strumParts: 0, singleTone: false },
    { name: "strum", customInterval: false, arpeggiates: false, strumParts: 1, singleTone: false },
    { name: "arpeggio", customInterval: false, arpeggiates: true, strumParts: 0, singleTone: true },
    { name: "custom interval", customInterval: true, arpeggiates: false, strumParts: 0, singleTone: true },
]);
Config.maxChordSize = 9;
Config.operatorCount = 4;
Config.maxPitchOrOperatorCount = Math.max(Config.maxChordSize, Config.operatorCount + 2);
Config.algorithms = toNameMap([
    { name: "1←(2 3 4)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2, 3, 4], [], [], []] },
    { name: "1←(2 3←4)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2, 3], [], [4], []] },
    { name: "1←2←(3 4)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2], [3, 4], [], []] },
    { name: "1←(2 3)←4", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2, 3], [4], [4], []] },
    { name: "1←2←3←4", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2], [3], [4], []] },
    { name: "1←3 2←4", carrierCount: 2, associatedCarrier: [1, 2, 1, 2], modulatedBy: [[3], [4], [], []] },
    { name: "1 2←(3 4)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2], modulatedBy: [[], [3, 4], [], []] },
    { name: "1 2←3←4", carrierCount: 2, associatedCarrier: [1, 2, 2, 2], modulatedBy: [[], [3], [4], []] },
    { name: "(1 2)←3←4", carrierCount: 2, associatedCarrier: [1, 2, 2, 2], modulatedBy: [[3], [3], [4], []] },
    { name: "(1 2)←(3 4)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2], modulatedBy: [[3, 4], [3, 4], [], []] },
    { name: "1 2 3←4", carrierCount: 3, associatedCarrier: [1, 2, 3, 3], modulatedBy: [[], [], [4], []] },
    { name: "(1 2 3)←4", carrierCount: 3, associatedCarrier: [1, 2, 3, 3], modulatedBy: [[4], [4], [4], []] },
    { name: "1 2 3 4", carrierCount: 4, associatedCarrier: [1, 2, 3, 4], modulatedBy: [[], [], [], []] },
    { name: "1←(2 3) 2←4", carrierCount: 2, associatedCarrier: [1, 2, 1, 2], modulatedBy: [[2, 3], [4], [], []] },
    { name: "1←(2 (3 (4", carrierCount: 3, associatedCarrier: [1, 2, 3, 3], modulatedBy: [[2, 3, 4], [3, 4], [4], []] },
]);
Config.algorithms6Op = toNameMap([
    { name: "Custom", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4, 5, 6], [], [], [], [], []] },
    { name: "1←2←3←4←5←6", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2], [3], [4], [5], [6], []] },
    { name: "1←3 2←4←5←6", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4], [], [5], [6], []] },
    { name: "1←3←4 2←5←6", carrierCount: 2, associatedCarrier: [1, 1, 1, 2, 2, 2], modulatedBy: [[3], [5], [4], [], [6], []] },
    { name: "1←4 2←5 3←6", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[4], [5], [6], [], [], []] },
    { name: "1←3 2←(4 5←6)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4, 5], [], [], [6], []] },
    { name: "1←(3 4) 2←5←6", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3, 4], [5], [], [], [6], []] },
    { name: "1←3 2←(4 5 6)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4, 5, 6], [], [], [], []] },
    { name: "1←3 2←(4 5)←6", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4, 5], [], [6], [6], []] },
    { name: "1←3 2←4←(5 6)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4], [], [5, 6], [], []] },
    { name: "1←(2 3 4 5 6)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4, 5, 6], [], [], [], [], []] },
    { name: "1←(2 3←5 4←6)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4], [], [5], [6], [], []] },
    { name: "1←(2 3 4←5←6)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4], [], [], [5], [6], []] },
    { name: "1←4←5 (2 3)←6", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[4], [6], [6], [5], [], []] },
    { name: "1←(3 4)←5 2←6", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3, 4], [6], [5], [5], [], []] },
    { name: "(1 2)←4 3←(5 6)", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[4], [4], [5, 6], [], [], []] },
    { name: "(1 2)←5 (3 4)←6", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[5], [5], [6], [6], [], []] },
    { name: "(1 2 3)←(4 5 6)", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[4, 5, 6], [4, 5, 6], [4, 5, 6], [], [], []] },
    { name: "1←5 (2 3 4)←6", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[5], [6], [6], [6], [], []] },
    { name: "1 2←5 (3 4)←6", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[], [5], [6], [6], [], []] },
    { name: "1 2 (3 4 5)←6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[], [], [6], [6], [6], []] },
    { name: "1 2 3 (4 5)←6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[], [], [], [6], [6], []] },
    { name: "1 2←4 3←(5 6)", carrierCount: 3, associatedCarrier: [1, 2, 3, 3, 3, 3], modulatedBy: [[], [4], [5, 6], [], [], []] },
    { name: "1←4 2←(5 6) 3", carrierCount: 3, associatedCarrier: [1, 2, 3, 3, 3, 3,], modulatedBy: [[4], [5, 6], [], [], [], []] },
    { name: "1 2 3←5 4←6", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[], [], [5], [6], [], []] },
    { name: "1 (2 3)←5←6 4", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4,], modulatedBy: [[], [5], [5], [], [6], []] },
    { name: "1 2 3←5←6 4", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[], [], [5, 6], [], [], []] },
    { name: "(1 2 3 4 5)←6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[6], [6], [6], [6], [6], []] },
    { name: "1 2 3 4 5←6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[], [], [], [], [6], []] },
    { name: "1 2 3 4 5 6", carrierCount: 6, associatedCarrier: [1, 2, 3, 4, 5, 6], modulatedBy: [[], [], [], [], [], []] },
    { name: "1←(2 (3 (4 (5 (6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[2, 3, 4, 5, 6], [3, 4, 5, 6], [4, 5, 6], [5, 6], [6], []] },
    { name: "1←(2(3(4(5(6", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4, 5, 6], [3, 4, 5, 6], [4, 5, 6], [5, 6], [6], []] },
    { name: "1←4(2←5(3←6", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[2, 3, 4], [3, 5], [6], [], [], []] },
    { name: "1←4(2←5 3←6", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[2, 3, 4], [5], [6], [], [], []] },
]);
Config.operatorCarrierInterval = [0.0, 0.04, -0.073, 0.091, 0.061, 0.024];
Config.operatorAmplitudeMax = 15;
Config.operatorFrequencies = toNameMap([
    { name: "0.12×", mult: 0.125, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "0.25×", mult: 0.25, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "0.5×", mult: 0.5, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "0.75×", mult: 0.75, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "1×", mult: 1.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "~1×", mult: 1.0, hzOffset: 1.5, amplitudeSign: -1.0 },
    { name: "2×", mult: 2.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "~2×", mult: 2.0, hzOffset: -1.3, amplitudeSign: -1.0 },
    { name: "3×", mult: 3.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "3.5×", mult: 3.5, hzOffset: -0.05, amplitudeSign: 1.0 },
    { name: "4×", mult: 4.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "~4×", mult: 4.0, hzOffset: -2.4, amplitudeSign: -1.0 },
    { name: "5×", mult: 5.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "6×", mult: 6.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "7×", mult: 7.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "8×", mult: 8.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "9×", mult: 9.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "10×", mult: 10.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "11×", mult: 11.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "12×", mult: 12.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "13×", mult: 13.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "14×", mult: 14.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "16×", mult: 16.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "18×", mult: 18.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "20×", mult: 20.0, hzOffset: 0.0, amplitudeSign: 1.0 },
]);
Config.envelopes = toNameMap([
    { name: "none", type: 1, speed: 0.0 },
    { name: "note size", type: 0, speed: 0.0 },
    { name: "punch", type: 2, speed: 0.0 },
    { name: "flare -1", type: 3, speed: 128.0 },
    { name: "flare 1", type: 3, speed: 32.0 },
    { name: "flare 2", type: 3, speed: 8.0 },
    { name: "flare 3", type: 3, speed: 2.0 },
    { name: "twang -1", type: 4, speed: 128.0 },
    { name: "twang 1", type: 4, speed: 32.0 },
    { name: "twang 2", type: 4, speed: 8.0 },
    { name: "twang 3", type: 4, speed: 2.0 },
    { name: "swell -1", type: 5, speed: 128.0 },
    { name: "swell 1", type: 5, speed: 32.0 },
    { name: "swell 2", type: 5, speed: 8.0 },
    { name: "swell 3", type: 5, speed: 2.0 },
    { name: "tremolo0", type: 6, speed: 8.0 },
    { name: "tremolo1", type: 6, speed: 4.0 },
    { name: "tremolo2", type: 6, speed: 2.0 },
    { name: "tremolo3", type: 6, speed: 1.0 },
    { name: "tremolo4", type: 7, speed: 4.0 },
    { name: "tremolo5", type: 7, speed: 2.0 },
    { name: "tremolo6", type: 7, speed: 1.0 },
    { name: "decay -1", type: 8, speed: 40.0 },
    { name: "decay 1", type: 8, speed: 10.0 },
    { name: "decay 2", type: 8, speed: 7.0 },
    { name: "decay 3", type: 8, speed: 4.0 },
    { name: "wibble-1", type: 9, speed: 96.0 },
    { name: "wibble 1", type: 9, speed: 24.0 },
    { name: "wibble 2", type: 9, speed: 12.0 },
    { name: "wibble 3", type: 9, speed: 4.0 },
    { name: "linear-2", type: 11, speed: 256.0 },
    { name: "linear-1", type: 11, speed: 128.0 },
    { name: "linear 1", type: 11, speed: 32.0 },
    { name: "linear 2", type: 11, speed: 8.0 },
    { name: "linear 3", type: 11, speed: 2.0 },
    { name: "rise -2", type: 12, speed: 256.0 },
    { name: "rise -1", type: 12, speed: 128.0 },
    { name: "rise 1", type: 12, speed: 32.0 },
    { name: "rise 2", type: 12, speed: 8.0 },
    { name: "rise 3", type: 12, speed: 2.0 },
]);
Config.feedbacks = toNameMap([
    { name: "1⟲", indices: [[1], [], [], []] },
    { name: "2⟲", indices: [[], [2], [], []] },
    { name: "3⟲", indices: [[], [], [3], []] },
    { name: "4⟲", indices: [[], [], [], [4]] },
    { name: "1⟲ 2⟲", indices: [[1], [2], [], []] },
    { name: "3⟲ 4⟲", indices: [[], [], [3], [4]] },
    { name: "1⟲ 2⟲ 3⟲", indices: [[1], [2], [3], []] },
    { name: "2⟲ 3⟲ 4⟲", indices: [[], [2], [3], [4]] },
    { name: "1⟲ 2⟲ 3⟲ 4⟲", indices: [[1], [2], [3], [4]] },
    { name: "1→2", indices: [[], [1], [], []] },
    { name: "1→3", indices: [[], [], [1], []] },
    { name: "1→4", indices: [[], [], [], [1]] },
    { name: "2→3", indices: [[], [], [2], []] },
    { name: "2→4", indices: [[], [], [], [2]] },
    { name: "3→4", indices: [[], [], [], [3]] },
    { name: "1→3 2→4", indices: [[], [], [1], [2]] },
    { name: "1→4 2→3", indices: [[], [], [2], [1]] },
    { name: "1→2→3→4", indices: [[], [1], [2], [3]] },
    { name: "1↔2 3↔4", indices: [[2], [1], [4], [3]] },
    { name: "1↔4 2↔3", indices: [[4], [3], [2], [1]] },
    { name: "2→1→4→3→2", indices: [[2], [3], [4], [1]] },
    { name: "1→2→3→4→1", indices: [[4], [1], [2], [3]] },
    { name: "(1 2 3)→4", indices: [[], [], [], [1, 2, 3]] },
    { name: "ALL", indices: [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]] },
]);
Config.feedbacks6Op = toNameMap([
    { name: "Custom", indices: [[2, 3, 4, 5, 6], [], [], [], [], []] },
    { name: "1⟲", indices: [[1], [], [], [], [], []] },
    { name: "2⟲", indices: [[], [2], [], [], [], []] },
    { name: "3⟲", indices: [[], [], [3], [], [], []] },
    { name: "4⟲", indices: [[], [], [], [4], [], []] },
    { name: "4⟲", indices: [[], [], [], [], [5], []] },
    { name: "4⟲", indices: [[], [], [], [], [], [6]] },
    { name: "1⟲ 2⟲", indices: [[1], [2], [], [], [], []] },
    { name: "3⟲ 4⟲", indices: [[], [], [3], [4], [], []] },
    { name: "1⟲ 2⟲ 3⟲", indices: [[1], [2], [3], [], [], []] },
    { name: "2⟲ 3⟲ 4⟲", indices: [[], [2], [3], [4], [], []] },
    { name: "1⟲ 2⟲ 3⟲ 4⟲", indices: [[1], [2], [3], [4], [], []] },
    { name: "1⟲ 2⟲ 3⟲ 4⟲ 5⟲", indices: [[1], [2], [3], [4], [5], []] },
    { name: "1⟲ 2⟲ 3⟲ 4⟲ 5⟲ 6⟲", indices: [[1], [2], [3], [4], [5], [6]] },
    { name: "1→2", indices: [[], [1], [], [], [], []] },
    { name: "1→3", indices: [[], [], [1], [], [], []] },
    { name: "1→4", indices: [[], [], [], [1], [], []] },
    { name: "1→5", indices: [[], [], [], [], [1], []] },
    { name: "1→6", indices: [[], [], [], [], [], [1]] },
    { name: "2→3", indices: [[], [], [2], [], [], []] },
    { name: "2→4", indices: [[], [], [], [2], [], []] },
    { name: "3→4", indices: [[], [], [], [3], [], []] },
    { name: "4→5", indices: [[], [], [], [], [4], []] },
    { name: "1→4 2→5 3→6", indices: [[], [], [], [1], [2], [3]] },
    { name: "1→5 2→6 3→4", indices: [[], [], [], [3], [1], [2]] },
    { name: "1→2→3→4→5→6", indices: [[], [1], [2], [3], [4], [5]] },
    { name: "2→1→6→5→4→3→2", indices: [[2], [3], [4], [5], [6], [1]] },
    { name: "1→2→3→4→5→6→1", indices: [[6], [1], [2], [3], [4], [5]] },
    { name: "1↔2 3↔4 5↔6", indices: [[2], [1], [4], [3], [6], [5]] },
    { name: "1↔4 2↔5 3↔6", indices: [[4], [5], [6], [1], [2], [3]] },
    { name: "(1,2,3,4,5)→6", indices: [[], [], [], [], [], [1, 2, 3, 4, 5]] },
    { name: "ALL", indices: [[1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]] },
]);
Config.chipNoiseLength = 1 << 15;
Config.spectrumNoiseLength = 1 << 15;
Config.spectrumBasePitch = 24;
Config.spectrumControlPoints = 30;
Config.spectrumControlPointsPerOctave = 7;
Config.spectrumControlPointBits = 3;
Config.spectrumMax = (1 << Config.spectrumControlPointBits) - 1;
Config.harmonicsControlPoints = 28;
Config.harmonicsRendered = 64;
Config.harmonicsRenderedForPickedString = 1 << 8;
Config.harmonicsControlPointBits = 3;
Config.harmonicsMax = (1 << Config.harmonicsControlPointBits) - 1;
Config.harmonicsWavelength = 1 << 11;
Config.pulseWidthRange = 50;
Config.pulseWidthStepPower = 0.5;
Config.pitchChannelCountMin = 1;
Config.pitchChannelCountMax = 40;
Config.noiseChannelCountMin = 0;
Config.noiseChannelCountMax = 16;
Config.modChannelCountMin = 0;
Config.modChannelCountMax = 12;
Config.noiseInterval = 6;
Config.pitchesPerOctave = 12;
Config.drumCount = 12;
Config.pitchOctaves = 8;
Config.modCount = 6;
Config.maxPitch = Config.pitchOctaves * Config.pitchesPerOctave;
Config.maximumTonesPerChannel = Config.maxChordSize * 2;
Config.justIntonationSemitones = [1.0 / 2.0, 8.0 / 15.0, 9.0 / 16.0, 3.0 / 5.0, 5.0 / 8.0, 2.0 / 3.0, 32.0 / 45.0, 3.0 / 4.0, 4.0 / 5.0, 5.0 / 6.0, 8.0 / 9.0, 15.0 / 16.0, 1.0, 16.0 / 15.0, 9.0 / 8.0, 6.0 / 5.0, 5.0 / 4.0, 4.0 / 3.0, 45.0 / 32.0, 3.0 / 2.0, 8.0 / 5.0, 5.0 / 3.0, 16.0 / 9.0, 15.0 / 8.0, 2.0].map(x => Math.log2(x) * Config.pitchesPerOctave);
Config.pitchShiftRange = Config.justIntonationSemitones.length;
Config.pitchShiftCenter = Config.pitchShiftRange >> 1;
Config.detuneCenter = 200;
Config.detuneMax = 400;
Config.detuneMin = 0;
Config.songDetuneMin = 0;
Config.songDetuneMax = 500;
Config.sineWaveLength = 1 << 8;
Config.sineWaveMask = Config.sineWaveLength - 1;
Config.sineWave = generateSineWave();
Config.pickedStringDispersionCenterFreq = 6000.0;
Config.pickedStringDispersionFreqScale = 0.3;
Config.pickedStringDispersionFreqMult = 4.0;
Config.pickedStringShelfHz = 4000.0;
Config.distortionRange = 8;
Config.stringSustainRange = 15;
Config.stringDecayRate = 0.12;
Config.bitcrusherFreqRange = 14;
Config.bitcrusherOctaveStep = 0.5;
Config.bitcrusherQuantizationRange = 8;
Config.maxEnvelopeCount = 12;
Config.defaultAutomationRange = 13;
Config.instrumentAutomationTargets = toNameMap([
    { name: "none", computeIndex: null, displayName: "none", interleave: false, isFilter: false, maxCount: 1, effect: null, compatibleInstruments: null },
    { name: "noteVolume", computeIndex: 0, displayName: "note volume", interleave: false, isFilter: false, maxCount: 1, effect: null, compatibleInstruments: null },
    { name: "pulseWidth", computeIndex: 2, displayName: "pulse width", interleave: false, isFilter: false, maxCount: 1, effect: null, compatibleInstruments: [6] },
    { name: "stringSustain", computeIndex: 3, displayName: "sustain", interleave: false, isFilter: false, maxCount: 1, effect: null, compatibleInstruments: [7] },
    { name: "unison", computeIndex: 4, displayName: "unison", interleave: false, isFilter: false, maxCount: 1, effect: null, compatibleInstruments: [0, 5, 7] },
    { name: "operatorFrequency", computeIndex: 5, displayName: "fm# freq", interleave: true, isFilter: false, maxCount: Config.operatorCount + 2, effect: null, compatibleInstruments: [1, 10] },
    { name: "operatorAmplitude", computeIndex: 11, displayName: "fm# volume", interleave: false, isFilter: false, maxCount: Config.operatorCount + 2, effect: null, compatibleInstruments: [1, 10] },
    { name: "feedbackAmplitude", computeIndex: 17, displayName: "fm feedback", interleave: false, isFilter: false, maxCount: 1, effect: null, compatibleInstruments: [1, 10] },
    { name: "pitchShift", computeIndex: 18, displayName: "pitch shift", interleave: false, isFilter: false, maxCount: 1, effect: 7, compatibleInstruments: null },
    { name: "detune", computeIndex: 19, displayName: "detune", interleave: false, isFilter: false, maxCount: 1, effect: 8, compatibleInstruments: null },
    { name: "vibratoDepth", computeIndex: 20, displayName: "vibrato range", interleave: false, isFilter: false, maxCount: 1, effect: 9, compatibleInstruments: null },
    { name: "noteFilterAllFreqs", computeIndex: 1, displayName: "n. filter freqs", interleave: false, isFilter: true, maxCount: 1, effect: 5, compatibleInstruments: null },
    { name: "noteFilterFreq", computeIndex: 21, displayName: "n. filter # freq", interleave: false, isFilter: true, maxCount: Config.filterMaxPoints, effect: 5, compatibleInstruments: null },
]);
Config.operatorWaves = toNameMap([
    { name: "sine", samples: Config.sineWave },
    { name: "triangle", samples: generateTriWave() },
    { name: "pulse width", samples: generateSquareWave() },
    { name: "sawtooth", samples: generateSawWave() },
    { name: "ramp", samples: generateSawWave(true) },
    { name: "trapezoid", samples: generateTrapezoidWave(2) },
]);
Config.pwmOperatorWaves = toNameMap([
    { name: "1%", samples: generateSquareWave(0.01) },
    { name: "5%", samples: generateSquareWave(0.05) },
    { name: "12.5%", samples: generateSquareWave(0.125) },
    { name: "25%", samples: generateSquareWave(0.25) },
    { name: "33%", samples: generateSquareWave(1 / 3) },
    { name: "50%", samples: generateSquareWave(0.5) },
    { name: "66%", samples: generateSquareWave(2 / 3) },
    { name: "75%", samples: generateSquareWave(0.75) },
    { name: "87.5%", samples: generateSquareWave(0.875) },
    { name: "95%", samples: generateSquareWave(0.95) },
    { name: "99%", samples: generateSquareWave(0.99) },
]);
Config.barEditorHeight = 10;
Config.modulators = toNameMap([
    { name: "none", pianoName: "None", maxRawVol: 6, newNoteVol: 6, forSong: true, convertRealFactor: 0, associatedEffect: 12,
        promptName: "No Mod Setting", promptDesc: ["This modulator does not have the focus", "[$LO - $HI]"] },
    { name: "song volume", pianoName: "Volume", maxRawVol: 100, newNoteVol: 100, forSong: true, convertRealFactor: 0, associatedEffect: 12,
        promptName: "Song Volume", promptDesc: ["This setting affects the overall volume of the song, just like the main volume slider.", "At $HI, the volume will be unchanged from default, and it will get gradually quieter down to $LO.", "[MULTIPLICATIVE] [$LO - $HI] [%]"] },
    { name: "tempo", pianoName: "Tempo", maxRawVol: Config.tempoMax - Config.tempoMin, newNoteVol: Math.ceil((Config.tempoMax - Config.tempoMin) / 2), forSong: true, convertRealFactor: Config.tempoMin, associatedEffect: 12,
        promptName: "Song Tempo", promptDesc: ["This setting controls the speed your song plays at, just like the tempo slider.", "When you first make a note for this setting, it will default to your current tempo. Raising it speeds up the song, up to $HI BPM, and lowering it slows it down, to a minimum of $LO BPM.", "Note that you can make a 'swing' effect by rapidly changing between two tempo values.", "[OVERWRITING] [$LO - $HI] [BPM]"] },
    { name: "song reverb", pianoName: "Reverb", maxRawVol: Config.reverbRange * 2, newNoteVol: Config.reverbRange, forSong: true, convertRealFactor: -Config.reverbRange, associatedEffect: 12,
        promptName: "Song Reverb", promptDesc: ["This setting affects the overall reverb of your song. It works by multiplying existing reverb for instruments, so those with no reverb set will be unaffected.", "At $MID, all instruments' reverb will be unchanged from default. This increases up to double the reverb value at $HI, or down to no reverb at $LO.", "[MULTIPLICATIVE] [$LO - $HI]"] },
    { name: "next bar", pianoName: "Next Bar", maxRawVol: 1, newNoteVol: 1, forSong: true, convertRealFactor: 0, associatedEffect: 12,
        promptName: "Go To Next Bar", promptDesc: ["This setting functions a little different from most. Wherever a note is placed, the song will jump immediately to the next bar when it is encountered.", "This jump happens at the very start of the note, so the length of a next-bar note is irrelevant. Also, the note can be value 0 or 1, but the value is also irrelevant - wherever you place a note, the song will jump.", "You can make mixed-meter songs or intro sections by cutting off unneeded beats with a next-bar modulator.", "[$LO - $HI]"] },
    { name: "note volume", pianoName: "Note Vol.", maxRawVol: Config.volumeRange, newNoteVol: Math.ceil(Config.volumeRange / 2), forSong: false, convertRealFactor: Math.ceil(-Config.volumeRange / 2.0), associatedEffect: 12,
        promptName: "Note Volume", promptDesc: ["This setting affects the volume of your instrument as if its note size had been scaled.", "At $MID, an instrument's volume will be unchanged from default. This means you can still use the volume sliders to mix the base volume of instruments. The volume gradually increases up to $HI, or decreases down to mute at $LO.", "This setting was the default for volume modulation in JummBox for a long time. Due to some new effects like distortion and bitcrush, note volume doesn't always allow fine volume control. Also, this modulator affects the value of FM modulator waves instead of just carriers. This can distort the sound which may be useful, but also may be undesirable. In those cases, use the 'mix volume' modulator instead, which will always just scale the volume with no added effects.", "For display purposes, this mod will show up on the instrument volume slider, as long as there is not also an active 'mix volume' modulator anyhow. However, as mentioned, it works more like changing note volume.", "[MULTIPLICATIVE] [$LO - $HI]"] },
    { name: "pan", pianoName: "Pan", maxRawVol: Config.panMax, newNoteVol: Math.ceil(Config.panMax / 2), forSong: false, convertRealFactor: 0, associatedEffect: 2,
        promptName: "Instrument Panning", promptDesc: ["This setting controls the panning of your instrument, just like the panning slider.", "At $LO, your instrument will sound like it is coming fully from the left-ear side. At $MID it will be right in the middle, and at $HI, it will sound like it's on the right.", "[OVERWRITING] [$LO - $HI] [L-R]"] },
    { name: "reverb", pianoName: "Reverb", maxRawVol: Config.reverbRange, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 0,
        promptName: "Instrument Reverb", promptDesc: ["This setting controls the reverb of your insturment, just like the reverb slider.", "At $LO, your instrument will have no reverb. At $HI, it will be at maximum.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "distortion", pianoName: "Distortion", maxRawVol: Config.distortionRange - 1, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 3,
        promptName: "Instrument Distortion", promptDesc: ["This setting controls the amount of distortion for your instrument, just like the distortion slider.", "At $LO, your instrument will have no distortion. At $HI, it will be at maximum.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "fm slider 1", pianoName: "FM 1", maxRawVol: 15, newNoteVol: 15, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "FM Slider 1", promptDesc: ["This setting affects the strength of the first FM slider, just like the corresponding slider on your instrument.", "It works in a multiplicative way, so at $HI your slider will sound the same is its default value, and at $LO it will sound like it has been moved all the way to the left.", "For the full range of control with this mod, move your underlying slider all the way to the right.", "[MULTIPLICATIVE] [$LO - $HI] [%]"] },
    { name: "fm slider 2", pianoName: "FM 2", maxRawVol: 15, newNoteVol: 15, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "FM Slider 2", promptDesc: ["This setting affects the strength of the second FM slider, just like the corresponding slider on your instrument.", "It works in a multiplicative way, so at $HI your slider will sound the same is its default value, and at $LO it will sound like it has been moved all the way to the left.", "For the full range of control with this mod, move your underlying slider all the way to the right.", "[MULTIPLICATIVE] [$LO - $HI] [%]"] },
    { name: "fm slider 3", pianoName: "FM 3", maxRawVol: 15, newNoteVol: 15, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "FM Slider 3", promptDesc: ["This setting affects the strength of the third FM slider, just like the corresponding slider on your instrument.", "It works in a multiplicative way, so at $HI your slider will sound the same is its default value, and at $LO it will sound like it has been moved all the way to the left.", "For the full range of control with this mod, move your underlying slider all the way to the right.", "[MULTIPLICATIVE] [$LO - $HI] [%]"] },
    { name: "fm slider 4", pianoName: "FM 4", maxRawVol: 15, newNoteVol: 15, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "FM Slider 4", promptDesc: ["This setting affects the strength of the fourth FM slider, just like the corresponding slider on your instrument.", "It works in a multiplicative way, so at $HI your slider will sound the same is its default value, and at $LO it will sound like it has been moved all the way to the left.", "For the full range of control with this mod, move your underlying slider all the way to the right.", "[MULTIPLICATIVE] [$LO - $HI] [%]"] },
    { name: "fm feedback", pianoName: "FM Feedback", maxRawVol: 15, newNoteVol: 15, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "FM Feedback", promptDesc: ["This setting affects the strength of the FM feedback slider, just like the corresponding slider on your instrument.", "It works in a multiplicative way, so at $HI your slider will sound the same is its default value, and at $LO it will sound like it has been moved all the way to the left.", "For the full range of control with this mod, move your underlying slider all the way to the right.", "[MULTIPLICATIVE] [$LO - $HI] [%]"] },
    { name: "pulse width", pianoName: "Pulse Width", maxRawVol: Config.pulseWidthRange, newNoteVol: Config.pulseWidthRange, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "Pulse Width", promptDesc: ["This setting controls the width of this instrument's pulse wave, just like the pulse width slider.", "At $HI, your instrument will sound like a pure square wave (on 50% of the time). It will gradually sound narrower down to $LO, where it will be inaudible (as it is on 0% of the time).", "Changing pulse width randomly between a few values is a common strategy in chiptune music to lend some personality to a lead instrument.", "[OVERWRITING] [$LO - $HI] [%Duty]"] },
    { name: "detune", pianoName: "Detune", maxRawVol: Config.detuneMax - Config.detuneMin, newNoteVol: Config.detuneCenter, forSong: false, convertRealFactor: -Config.detuneCenter, associatedEffect: 8,
        promptName: "Instrument Detune", promptDesc: ["This setting controls the detune for this instrument, just like the detune slider.", "At $MID, your instrument will have no detune applied. Each tick corresponds to one cent, or one-hundredth of a pitch. Thus, each change of 100 ticks corresponds to one half-step of detune, up to two half-steps up at $HI, or two half-steps down at $LO.", "[OVERWRITING] [$LO - $HI] [cents]"] },
    { name: "vibrato depth", pianoName: "Vibrato Depth", maxRawVol: 50, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 9,
        promptName: "Vibrato Depth", promptDesc: ["This setting controls the amount that your pitch moves up and down by during vibrato, just like the vibrato depth slider.", "At $LO, your instrument will have no vibrato depth so its vibrato would be inaudible. This increases up to $HI, where an extreme pitch change will be noticeable.", "[OVERWRITING] [$LO - $HI] [pitch ÷25]"] },
    { name: "song detune", pianoName: "Detune", maxRawVol: Config.songDetuneMax - Config.songDetuneMin, newNoteVol: Math.ceil((Config.songDetuneMax - Config.songDetuneMin) / 2), forSong: true, convertRealFactor: -250, associatedEffect: 12,
        promptName: "Song Detune", promptDesc: ["This setting controls the overall detune of the entire song. There is no associated slider.", "At $MID, your song will have no extra detune applied and sound unchanged from default. Each tick corresponds to four cents, or four hundredths of a pitch. Thus, each change of 25 ticks corresponds to one half-step of detune, up to 10 half-steps up at $HI, or 10 half-steps down at $LO.", "[MULTIPLICATIVE] [$LO - $HI] [cents x4]"] },
    { name: "vibrato speed", pianoName: "Vibrato Speed", maxRawVol: 30, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 9,
        promptName: "Vibrato Speed", promptDesc: ["This setting controls the speed your instrument will vibrato at, just like the slider.", "A setting of $LO means there will be no oscillation, and vibrato will be disabled. Higher settings will increase the speed, up to a dramatic trill at the max value, $HI.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "vibrato delay", pianoName: "Vibrato Delay", maxRawVol: 50, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 9,
        promptName: "Vibrato Delay", promptDesc: ["This setting controls the amount of time vibrato will be held off for before triggering for every new note, just like the slider.", "A setting of $LO means there will be no delay. A setting of 24 corresponds to one full beat of delay. As a sole exception to this scale, setting delay to $HI will completely disable vibrato (as if it had infinite delay).", "[OVERWRITING] [$LO - $HI] [beats ÷24]"] },
    { name: "arp speed", pianoName: "Arp Speed", maxRawVol: 50, newNoteVol: 10, forSong: false, convertRealFactor: 0, associatedEffect: 11,
        promptName: "Arpeggio Speed", promptDesc: ["This setting controls the speed at which your instrument's chords arpeggiate, just like the arpeggio speed slider.", "Each setting corresponds to a different speed, from the slowest to the fastest. The speeds are listed below.",
            "[0-4]: x0, x1/16, x⅛, x⅕, x¼,", "[5-9]: x⅓, x⅖, x½, x⅔, x¾,", "[10-14]: x⅘, x0.9, x1, x1.1, x1.2,", "[15-19]: x1.3, x1.4, x1.5, x1.6, x1.7,", "[20-24]: x1.8, x1.9, x2, x2.1, x2.2,", "[25-29]: x2.3, x2.4, x2.5, x2.6, x2.7,", "[30-34]: x2.8, x2.9, x3, x3.1, x3.2,", "[35-39]: x3.3, x3.4, x3.5, x3.6, x3.7,", "[40-44]: x3.8, x3.9, x4, x4.15, x4.3,", "[45-50]: x4.5, x4.8, x5, x5.5, x6, x8", "[OVERWRITING] [$LO - $HI]"] },
    { name: "pan delay", pianoName: "Pan Delay", maxRawVol: 20, newNoteVol: 10, forSong: false, convertRealFactor: 0, associatedEffect: 2,
        promptName: "Panning Delay", promptDesc: ["This setting controls the delay applied to panning for your instrument, just like the pan delay slider.", "With more delay, the panning effect will generally be more pronounced. $MID is the default value, whereas $LO will remove any delay at all. No delay can be desirable for chiptune songs.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "reset arp", pianoName: "Reset Arp", maxRawVol: 1, newNoteVol: 1, forSong: false, convertRealFactor: 0, associatedEffect: 11,
        promptName: "Reset Arpeggio", promptDesc: ["This setting functions a little different from most. Wherever a note is placed, the arpeggio of this instrument will reset at the very start of that note. This is most noticeable with lower arpeggio speeds. The lengths and values of notes for this setting don't matter, just the note start times.", "This mod can be used to sync up your apreggios so that they always sound the same, even if you are using an odd-ratio arpeggio speed or modulating arpeggio speed.", "[$LO - $HI]"] },
    { name: "eq filter", pianoName: "EQFlt", maxRawVol: 10, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "EQ Filter", promptDesc: ["This setting controls a few separate things for your instrument's EQ filter.", "When the option 'morph' is selected, your modulator values will indicate a sub-filter index of your EQ filter to 'morph' to over time. For example, a change from 0 to 1 means your main filter (default) will morph to sub-filter 1 over the specified duration. You can shape the main filter and sub-filters in the large filter editor ('+' button). If your two filters' number, type, and order of filter dots all match up, the morph will happen smoothly and you'll be able to hear them changing. If they do not match up, the filters will simply jump between each other.", "Note that filters will morph based on endpoints in the pattern editor. So, if you specify a morph from sub-filter 1 to 4 but do not specifically drag in new endpoints for 2 and 3, it will morph directly between 1 and 4 without going through the others.", "If you target Dot X or Dot Y, you can finely tune the coordinates of a single dot for your filter. The number of available dots to choose is dependent on your main filter's dot count.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "note filter", pianoName: "N.Flt", maxRawVol: 10, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 5,
        promptName: "Note Filter", promptDesc: ["This setting controls a few separate things for your instrument's note filter.", "When the option 'morph' is selected, your modulator values will indicate a sub-filter index of your note filter to 'morph' to over time. For example, a change from 0 to 1 means your main filter (default) will morph to sub-filter 1 over the specified duration. You can shape the main filter and sub-filters in the large filter editor ('+' button). If your two filters' number, type, and order of filter dots all match up, the morph will happen smoothly and you'll be able to hear them changing. If they do not match up, the filters will simply jump between each other.", "Note that filters will morph based on endpoints in the pattern editor. So, if you specify a morph from sub-filter 1 to 4 but do not specifically drag in new endpoints for 2 and 3, it will morph directly between 1 and 4 without going through the others.", "If you target Dot X or Dot Y, you can finely tune the coordinates of a single dot for your filter. The number of available dots to choose is dependent on your main filter's dot count.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "bit crush", pianoName: "Bitcrush", maxRawVol: Config.bitcrusherQuantizationRange - 1, newNoteVol: Math.round(Config.bitcrusherQuantizationRange / 2), forSong: false, convertRealFactor: 0, associatedEffect: 4,
        promptName: "Instrument Bit Crush", promptDesc: ["This setting controls the bit crush of your instrument, just like the bit crush slider.", "At a value of $LO, no bit crush will be applied. This increases and the bit crush effect gets more noticeable up to the max value, $HI.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "freq crush", pianoName: "Freq Crush", maxRawVol: Config.bitcrusherFreqRange - 1, newNoteVol: Math.round(Config.bitcrusherFreqRange / 2), forSong: false, convertRealFactor: 0, associatedEffect: 4,
        promptName: "Instrument Frequency Crush", promptDesc: ["This setting controls the frequency crush of your instrument, just like the freq crush slider.", "At a value of $LO, no frequency crush will be applied. This increases and the frequency crush effect gets more noticeable up to the max value, $HI.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "echo", pianoName: "Echo", maxRawVol: Config.echoSustainRange - 1, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 6,
        promptName: "Instrument Echo Sustain", promptDesc: ["This setting controls the echo sustain (echo loudness) of your instrument, just like the echo slider.", "At $LO, your instrument will have no echo sustain and echo will not be audible. Echo sustain increases and the echo effect gets more noticeable up to the max value, $HI.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "echo delay", pianoName: "Echo Delay", maxRawVol: Config.echoDelayRange, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "Instrument Echo Delay", promptDesc: ["This setting controls the echo delay of your instrument, just like the echo delay slider.", "At $LO, your instrument will have very little echo delay, and this increases up to 2 beats of delay at $HI.", "[OVERWRITING] [$LO - $HI] [~beats ÷12]"]
    },
    { name: "chorus", pianoName: "Chorus", maxRawVol: Config.chorusRange, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 1,
        promptName: "Instrument Chorus", promptDesc: ["This setting controls the chorus strength of your instrument, just like the chorus slider.", "At $LO, the chorus effect will be disabled. The strength of the chorus effect increases up to the max value, $HI.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "eq filt cut", pianoName: "EQFlt Cut", maxRawVol: Config.filterSimpleCutRange - 1, newNoteVol: Config.filterSimpleCutRange - 1, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "EQ Filter Cutoff Frequency", promptDesc: ["This setting controls the filter cut position of your instrument, just like the filter cut slider.", "This setting is roughly analagous to the horizontal position of a single low-pass dot on the advanced filter editor. At lower values, a wider range of frequencies is cut off.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "eq filt peak", pianoName: "EQFlt Peak", maxRawVol: Config.filterSimplePeakRange - 1, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "EQ Filter Peak Gain", promptDesc: ["This setting controls the filter peak position of your instrument, just like the filter peak slider.", "This setting is roughly analagous to the vertical position of a single low-pass dot on the advanced filter editor. At lower values, the cutoff frequency will not be emphasized, and at higher values you will hear emphasis on the cutoff frequency.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "note filt cut", pianoName: "N.Flt Cut", maxRawVol: Config.filterSimpleCutRange - 1, newNoteVol: Config.filterSimpleCutRange - 1, forSong: false, convertRealFactor: 0, associatedEffect: 5,
        promptName: "Note Filter Cutoff Frequency", promptDesc: ["This setting controls the filter cut position of your instrument, just like the filter cut slider.", "This setting is roughly analagous to the horizontal position of a single low-pass dot on the advanced filter editor. At lower values, a wider range of frequencies is cut off.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "note filt peak", pianoName: "N.Flt Peak", maxRawVol: Config.filterSimplePeakRange - 1, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 5,
        promptName: "Note Filter Peak Gain", promptDesc: ["This setting controls the filter peak position of your instrument, just like the filter peak slider.", "This setting is roughly analagous to the vertical position of a single low-pass dot on the advanced filter editor. At lower values, the cutoff frequency will not be emphasized, and at higher values you will hear emphasis on the cutoff frequency.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "pitch shift", pianoName: "Pitch Shift", maxRawVol: Config.pitchShiftRange - 1, newNoteVol: Config.pitchShiftCenter, forSong: false, convertRealFactor: -Config.pitchShiftCenter, associatedEffect: 7,
        promptName: "Pitch Shift", promptDesc: ["This setting controls the pitch offset of your instrument, just like the pitch shift slider.", "At $MID your instrument will have no pitch shift. This increases as you decrease toward $LO pitches (half-steps) at the low end, or increases towards +$HI pitches at the high end.", "[OVERWRITING] [$LO - $HI] [pitch]"] },
    { name: "sustain", pianoName: "Sustain", maxRawVol: Config.stringSustainRange - 1, newNoteVol: 0, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "Picked String Sustain", promptDesc: ["This setting controls the sustain of your picked string instrument, just like the sustain slider.", "At $LO, your instrument will have minimum sustain and sound 'plucky'. This increases to a more held sound as your modulator approaches the maximum, $HI.", "[OVERWRITING] [$LO - $HI]"] },
    { name: "mix volume", pianoName: "Mix Vol.", maxRawVol: Config.volumeRange, newNoteVol: Math.ceil(Config.volumeRange / 2), forSong: false, convertRealFactor: Math.ceil(-Config.volumeRange / 2.0), associatedEffect: 12,
        promptName: "Mix Volume", promptDesc: ["This setting affects the volume of your instrument as if its volume slider had been moved.", "At $MID, an instrument's volume will be unchanged from default. This means you can still use the volume sliders to mix the base volume of instruments, since this setting and the default value work multiplicatively. The volume gradually increases up to $HI, or decreases down to mute at $LO.", "Unlike the 'note volume' setting, mix volume is very straightforward and simply affects the resultant instrument volume after all effects are applied.", "[MULTIPLICATIVE] [$LO - $HI]"] },
    { name: "fm slider 5", pianoName: "FM 5", maxRawVol: 15, newNoteVol: 15, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "FM Slider 5", promptDesc: ["This setting affects the strength of the fifth FM slider, just like the corresponding slider on your instrument.", "It works in a multiplicative way, so at $HI your slider will sound the same is its default value, and at $LO it will sound like it has been moved all the way to the left.", "For the full range of control with this mod, move your underlying slider all the way to the right.", "[MULTIPLICATIVE] [$LO - $HI] [%]"] },
    { name: "fm slider 6", pianoName: "FM 6", maxRawVol: 15, newNoteVol: 15, forSong: false, convertRealFactor: 0, associatedEffect: 12,
        promptName: "FM Slider 6", promptDesc: ["This setting affects the strength of the sixth FM slider, just like the corresponding slider on your instrument.", "It works in a multiplicative way, so at $HI your slider will sound the same is its default value, and at $LO it will sound like it has been moved all the way to the left.", "For the full range of control with this mod, move your underlying slider all the way to the right.", "[MULTIPLICATIVE] [$LO - $HI] [%]"] },
]);
function centerWave(wave) {
    let sum = 0.0;
    for (let i = 0; i < wave.length; i++)
        sum += wave[i];
    const average = sum / wave.length;
    for (let i = 0; i < wave.length; i++)
        wave[i] -= average;
    performIntegral(wave);
    wave.push(0);
    return new Float32Array(wave);
}
function centerAndNormalizeWave(wave) {
    let magn = 0.0;
    centerWave(wave);
    for (let i = 0; i < wave.length - 1; i++) {
        magn += Math.abs(wave[i]);
    }
    const magnAvg = magn / (wave.length - 1);
    for (let i = 0; i < wave.length - 1; i++) {
        wave[i] = wave[i] / magnAvg;
    }
    return new Float32Array(wave);
}
export function performIntegral(wave) {
    let cumulative = 0.0;
    let newWave = new Float32Array(wave.length);
    for (let i = 0; i < wave.length; i++) {
        newWave[i] = cumulative;
        cumulative += wave[i];
    }
    return newWave;
}
export function performIntegralOld(wave) {
    let cumulative = 0.0;
    for (let i = 0; i < wave.length; i++) {
        const temp = wave[i];
        wave[i] = cumulative;
        cumulative += temp;
    }
}
export function getPulseWidthRatio(pulseWidth) {
    return pulseWidth / (Config.pulseWidthRange * 2);
}
export function getDrumWave(index, inverseRealFourierTransform, scaleElementsByFactor) {
    let wave = Config.chipNoises[index].samples;
    if (wave == null) {
        wave = new Float32Array(Config.chipNoiseLength + 1);
        Config.chipNoises[index].samples = wave;
        if (index == 0) {
            let drumBuffer = 1;
            for (let i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                let newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 1 << 14;
                }
                drumBuffer = newBuffer;
            }
        }
        else if (index == 1) {
            for (let i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = Math.random() * 2.0 - 1.0;
            }
        }
        else if (index == 2) {
            let drumBuffer = 1;
            for (let i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                let newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 2 << 14;
                }
                drumBuffer = newBuffer;
            }
        }
        else if (index == 3) {
            let drumBuffer = 1;
            for (let i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                let newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 10 << 2;
                }
                drumBuffer = newBuffer;
            }
        }
        else if (index == 4) {
            drawNoiseSpectrum(wave, Config.chipNoiseLength, 10, 11, 1, 1, 0);
            drawNoiseSpectrum(wave, Config.chipNoiseLength, 11, 14, .6578, .6578, 0);
            inverseRealFourierTransform(wave, Config.chipNoiseLength);
            scaleElementsByFactor(wave, 1.0 / Math.sqrt(Config.chipNoiseLength));
        }
        else if (index == 5) {
            var drumBuffer = 1;
            for (var i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                var newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 10 << 2;
                }
                drumBuffer = newBuffer;
            }
        }
        else if (index == 6) {
            drawNoiseSpectrum(wave, Config.chipNoiseLength, 1, 10, 1, 1, 0);
            drawNoiseSpectrum(wave, Config.chipNoiseLength, 20, 14, -2, -2, 0);
            inverseRealFourierTransform(wave, Config.chipNoiseLength);
            scaleElementsByFactor(wave, 1.0 / Math.sqrt(Config.chipNoiseLength));
        }
        else if (index == 7) {
            var drumBuffer = 1;
            for (var i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 4.0 * (Math.random() * 14 + 1);
                var newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 15 << 2;
                }
                drumBuffer = newBuffer;
            }
        }
        else if (index == 8) {
            var drumBuffer = 1;
            for (var i = 0; i < 32768; i++) {
                wave[i] = (drumBuffer & 1) / 2.0 + 0.5;
                var newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer -= 10 << 2;
                }
                drumBuffer = newBuffer;
            }
        }
        else if (index == 9) {
            let drumBuffer = 1;
            for (let i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 2.0 - 1.1;
                let newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 8 ^ 2 << 16;
                }
                drumBuffer = newBuffer;
            }
        }
        else {
            throw new Error("Unrecognized drum index: " + index);
        }
        wave[Config.chipNoiseLength] = wave[0];
    }
    return wave;
}
export function drawNoiseSpectrum(wave, waveLength, lowOctave, highOctave, lowPower, highPower, overallSlope) {
    const referenceOctave = 11;
    const referenceIndex = 1 << referenceOctave;
    const lowIndex = Math.pow(2, lowOctave) | 0;
    const highIndex = Math.min(waveLength >> 1, Math.pow(2, highOctave) | 0);
    const retroWave = getDrumWave(0, null, null);
    let combinedAmplitude = 0.0;
    for (let i = lowIndex; i < highIndex; i++) {
        let lerped = lowPower + (highPower - lowPower) * (Math.log2(i) - lowOctave) / (highOctave - lowOctave);
        let amplitude = Math.pow(2, (lerped - 1) * 7 + 1) * lerped;
        amplitude *= Math.pow(i / referenceIndex, overallSlope);
        combinedAmplitude += amplitude;
        amplitude *= retroWave[i];
        const radians = 0.61803398875 * i * i * Math.PI * 2.0;
        wave[i] = Math.cos(radians) * amplitude;
        wave[waveLength - i] = Math.sin(radians) * amplitude;
    }
    return combinedAmplitude;
}
function generateSineWave() {
    const wave = new Float32Array(Config.sineWaveLength + 1);
    for (let i = 0; i < Config.sineWaveLength + 1; i++) {
        wave[i] = Math.sin(i * Math.PI * 2.0 / Config.sineWaveLength);
    }
    return wave;
}
function generateTriWave() {
    const wave = new Float32Array(Config.sineWaveLength + 1);
    for (let i = 0; i < Config.sineWaveLength + 1; i++) {
        wave[i] = Math.asin(Math.sin(i * Math.PI * 2.0 / Config.sineWaveLength)) / (Math.PI / 2);
    }
    return wave;
}
function generateTrapezoidWave(drive = 2) {
    const wave = new Float32Array(Config.sineWaveLength + 1);
    for (let i = 0; i < Config.sineWaveLength + 1; i++) {
        wave[i] = Math.max(-1.0, Math.min(1.0, Math.asin(Math.sin(i * Math.PI * 2.0 / Config.sineWaveLength)) * drive));
    }
    return wave;
}
function generateSquareWave(phaseWidth = 0) {
    const wave = new Float32Array(Config.sineWaveLength + 1);
    const centerPoint = Config.sineWaveLength / 4;
    for (let i = 0; i < Config.sineWaveLength + 1; i++) {
        wave[i] = +((Math.abs(i - centerPoint) < phaseWidth * Config.sineWaveLength / 2)
            || ((Math.abs(i - Config.sineWaveLength - centerPoint) < phaseWidth * Config.sineWaveLength / 2))) * 2 - 1;
    }
    return wave;
}
function generateSawWave(inverse = false) {
    const wave = new Float32Array(Config.sineWaveLength + 1);
    for (let i = 0; i < Config.sineWaveLength + 1; i++) {
        wave[i] = ((i + (Config.sineWaveLength / 4.0)) * 2.0 / Config.sineWaveLength) % 2 - 1;
        wave[i] = inverse ? -wave[i] : wave[i];
    }
    return wave;
}
export function getArpeggioPitchIndex(pitchCount, useFastTwoNoteArp, arpeggio) {
    let arpeggioPattern = Config.arpeggioPatterns[pitchCount - 1];
    if (arpeggioPattern != null) {
        if (pitchCount == 2 && useFastTwoNoteArp == false) {
            arpeggioPattern = [0, 0, 1, 1];
        }
        return arpeggioPattern[arpeggio % arpeggioPattern.length];
    }
    else {
        return arpeggio % pitchCount;
    }
}
export function toNameMap(array) {
    const dictionary = {};
    for (let i = 0; i < array.length; i++) {
        const value = array[i];
        value.index = i;
        dictionary[value.name] = value;
    }
    const result = array;
    result.dictionary = dictionary;
    return result;
}
export function effectsIncludeTransition(effects) {
    return (effects & (1 << 10)) != 0;
}
export function effectsIncludeChord(effects) {
    return (effects & (1 << 11)) != 0;
}
export function effectsIncludePitchShift(effects) {
    return (effects & (1 << 7)) != 0;
}
export function effectsIncludeDetune(effects) {
    return (effects & (1 << 8)) != 0;
}
export function effectsIncludeVibrato(effects) {
    return (effects & (1 << 9)) != 0;
}
export function effectsIncludeNoteFilter(effects) {
    return (effects & (1 << 5)) != 0;
}
export function effectsIncludeDistortion(effects) {
    return (effects & (1 << 3)) != 0;
}
export function effectsIncludeBitcrusher(effects) {
    return (effects & (1 << 4)) != 0;
}
export function effectsIncludePanning(effects) {
    return (effects & (1 << 2)) != 0;
}
export function effectsIncludeChorus(effects) {
    return (effects & (1 << 1)) != 0;
}
export function effectsIncludeEcho(effects) {
    return (effects & (1 << 6)) != 0;
}
export function effectsIncludeReverb(effects) {
    return (effects & (1 << 0)) != 0;
}
export function rawChipToIntegrated(raw) {
    const newArray = new Array(raw.length);
    const dictionary = {};
    for (let i = 0; i < newArray.length; i++) {
        newArray[i] = Object.assign([], raw[i]);
        const value = newArray[i];
        value.index = i;
        dictionary[value.name] = value;
    }
    for (let key in dictionary) {
        dictionary[key].samples = performIntegral(dictionary[key].samples);
    }
    const result = newArray;
    result.dictionary = dictionary;
    return result;
}
//# sourceMappingURL=SynthConfig.js.map