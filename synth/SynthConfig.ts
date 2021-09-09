/*!
Copyright (C) 2020 John Nesky

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

//namespace beepbox {
export interface Dictionary<T> {
	[K: string]: T;
}

export interface DictionaryArray<T> extends ReadonlyArray<T> {
	dictionary: Dictionary<T>;
}

export const enum EnvelopeType {
	custom,
	steady,
	punch,
	flare,
	twang,
	swell,
	tremolo,
	tremolo2,
    decay,
    wibble,
    hard,
    linear,
    rise,
}

export const enum InstrumentType {
	chip = 0,
	fm = 1,
	noise = 2,
	spectrum = 3,
	drumset = 4,
	harmonics = 5,
	pwm = 6,
	customChipWave = 7,
    mod = 8,
    fm6op = 9,
	length,
}

export const enum DropdownID {
	Vibrato = 0,
	Pan = 1,
	Chord = 2,
	Transition = 3,
	FM = 4,

}

export interface BeepBoxOption {
	readonly index: number;
	readonly name: string;
}

export interface Scale extends BeepBoxOption {
	readonly flags: ReadonlyArray<boolean>;
	readonly realName: string;
}

export interface Key extends BeepBoxOption {
	readonly isWhiteKey: boolean;
	readonly basePitch: number;
}

export interface Rhythm extends BeepBoxOption {
	readonly stepsPerBeat: number;
	//readonly ticksPerArpeggio: number;
	//readonly arpeggioPatterns: ReadonlyArray<ReadonlyArray<number>>;
	readonly roundUpThresholds: number[] | null;
}

export interface ChipWave extends BeepBoxOption {
	readonly volume: number;
	samples: Float64Array;
}

export interface OperatorWave extends BeepBoxOption {
	samples: Float64Array;
}

export interface OperatorWave extends BeepBoxOption {
    samples: Float64Array;
}

export interface ChipNoise extends BeepBoxOption {
	readonly volume: number;
	readonly basePitch: number;
	readonly pitchFilterMult: number;
	readonly isSoft: boolean;
	samples: Float32Array | null;
}

export interface Transition extends BeepBoxOption {
	readonly isSeamless: boolean;
	readonly attackSeconds: number;
	readonly releases: boolean;
	readonly releaseTicks: number;
	readonly slides: boolean;
	readonly slideTicks: number;
}

export interface Vibrato extends BeepBoxOption {
	readonly amplitude: number;
	readonly type: number;
	readonly delayParts: number;
}

export interface VibratoType extends BeepBoxOption {
	readonly periodsSeconds: number[];
	readonly period: number;
}

export interface Interval extends BeepBoxOption {
	readonly spread: number;
	readonly offset: number;
	readonly volume: number;
	readonly sign: number;
}

export interface Chord extends BeepBoxOption {
	readonly harmonizes: boolean;
	readonly customInterval: boolean;
	readonly arpeggiates: boolean;
	readonly isCustomInterval: boolean;
	readonly strumParts: number;
}

export interface Algorithm extends BeepBoxOption {
	readonly carrierCount: number;
	readonly associatedCarrier: ReadonlyArray<number>;
	readonly modulatedBy: ReadonlyArray<ReadonlyArray<number>>;
}

export interface OperatorFrequency extends BeepBoxOption {
	readonly mult: number;
	readonly hzOffset: number;
	readonly amplitudeSign: number;
}

export interface Envelope extends BeepBoxOption {
	readonly type: EnvelopeType;
	readonly speed: number;
}

export interface Feedback extends BeepBoxOption {
	readonly indices: ReadonlyArray<ReadonlyArray<number>>;
}

export class Config {
	// Params for post-processing compressor
	public static thresholdVal: number = -10;
	public static kneeVal: number = 40;
	public static ratioVal: number = 12;
	public static attackVal: number = 0;
	public static releaseVal: number = 0.25;

	public static readonly scales: DictionaryArray<Scale> = toNameMap([

		//   C     Db      D     Eb      E      F     F#      G     Ab      A     Bb      B      C
		{ name: "Free", realName: "chromatic", flags:                       [true, true, true, true, true, true, true, true, true, true, true, true] }, // Free
		{ name: "Major", realName: "ionian", flags:                         [true, false, true, false, true, true, false, true, false, true, false, true] }, // Major
		{ name: "Minor", realName: "aeolian", flags:                        [true, false, true, true, false, true, false, true, true, false, true, false] }, // Minor
		{ name: "Mixolydian", realName: "mixolydian", flags:                [true, false, true, false, true, true, false, true, false, true, true, false] }, // Mixolydian
		{ name: "Lydian", realName: "lydian", flags:                        [true, false, true, false, true, false, true, true, false, true, false, true] }, // Lydian
		{ name: "Dorian", realName: "dorian", flags:                        [true, false, true, true, false, true, false, true, false, true, true, false] }, // Dorian
		{ name: "Phrygian", realName: "phrygian", flags:                    [true, true, false, true, false, true, false, true, true, false, true, false] }, // Phrygian
		{ name: "Locrian", realName: "locrian", flags:                      [true, true, false, true, false, true, true, false, true, false, true, false] }, // Locrian
		{ name: "Lydian Dominant", realName: "lydian dominant", flags:      [true, false, true, false, true, false, true, true, false, true, true, false] }, // Lydian Dominant
		{ name: "Phrygian Dominant", realName: "phrygian dominant", flags:  [true, true, false, false, true, true, false, true, true, false, true, false] }, // Phrygian Dominant
		{ name: "Harmonic Major", realName: "harmonic major", flags:        [true, false, true, false, true, true, false, true, true, false, false, true] }, // Harmonic Major
		{ name: "Harmonic Minor", realName: "harmonic minor", flags:        [true, false, true, true, false, true, false, true, true, false, false, true] }, // Harmonic Minor
		{ name: "Melodic Minor", realName: "melodic minor", flags:          [true, false, true, true, false, true, false, true, false, true, false, true] }, // Melodic Minor
		{ name: "Blues", realName: "blues", flags:                          [true, false, false, true, false, true, true, true, false, false, true, false] }, // Blues
		{ name: "Altered", realName: "altered", flags:                      [true, true, false, true, true, false, true, false, true, false, true, false] }, // Altered
		{ name: "Major Pentatonic", realName: "major pentatonic", flags:    [true, false, true, false, true, false, false, true, false, true, false, false] }, // Major Pentatonic
		{ name: "Minor Pentatonic", realName: "minor pentatonic", flags:    [true, false, false, true, false, true, false, true, false, false, true, false] }, // Minor Pentatonic
		{ name: "Whole Tone", realName: "whole tone", flags:                [true, false, true, false, true, false, true, false, true, false, true, false] }, // Whole Tone
		{ name: "Octatonic", realName: "octatonic", flags:                  [true, false, true, true, false, true, true, false, true, true, false, true] }, // Octatonic
        { name: "Hexatonic", realName: "hexatonic", flags:                  [true, false, false, true, true, false, false, true, true, false, false, true] }, // Hexatonic
        { name: "Custom", realName: "custom", flags:                        [true, false, true, true, false, false, false, true, true, false, true, true] }, // Custom? considering allowing this one to be be completely configurable
	]);
	public static readonly keys: DictionaryArray<Key> = toNameMap([
		{ name: "C", isWhiteKey: true, basePitch: 12 }, // C0 has index 12 on the MIDI scale. C7 is 96, and C9 is 120. C10 is barely in the audible range.
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
	public static readonly blackKeyNameParents: ReadonlyArray<number> = [-1, 1, -1, 1, -1, 1, -1, -1, 1, -1, 1, -1];
	public static readonly tempoMin: number = 30;
	public static readonly tempoMax: number = 320;
	public static readonly reverbRange: number = 32;
	public static readonly beatsPerBarMin: number = 2;
	public static readonly beatsPerBarMax: number = 16;
	public static readonly barCountMin: number = 1;
	public static readonly barCountMax: number = 256;
	public static readonly instrumentsPerChannelMin: number = 1;
	public static readonly instrumentsPerChannelMax: number = 10;
	public static readonly partsPerBeat: number = 24;
	public static readonly ticksPerPart: number = 2;
	public static readonly ticksPerArpeggio: number = 3;
	public static readonly arpeggioPatterns: ReadonlyArray<ReadonlyArray<number>> = [[0], [0, 1], [0, 1, 2, 1], [0, 1, 2, 3], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5, 6], [0, 1, 2, 3, 4, 5, 6, 7] ];
	public static readonly rhythms: DictionaryArray<Rhythm> = toNameMap([
		{ name: "÷3 (triplets)", stepsPerBeat: 3, /*ticksPerArpeggio: 4, arpeggioPatterns: [[0], [0, 0, 1, 1], [0, 1, 2, 1], [0, 1, 2, 3]]*/ roundUpThresholds: [/*0*/ 5, /*8*/ 12, /*16*/ 18 /*24*/] },
		{ name: "÷4 (standard)", stepsPerBeat: 4, /*ticksPerArpeggio: 3, arpeggioPatterns: [[0], [0, 0, 1, 1], [0, 1, 2, 1], [0, 1, 2, 3]]*/ roundUpThresholds: [/*0*/ 3, /*6*/ 9, /*12*/ 17, /*18*/ 21 /*24*/] },
		{ name: "÷6", stepsPerBeat: 6, /*ticksPerArpeggio: 4, arpeggioPatterns: [[0], [0, 1], [0, 1, 2, 1], [0, 1, 2, 3]]*/ roundUpThresholds: null },
		{ name: "÷8", stepsPerBeat: 8, /*ticksPerArpeggio: 3, arpeggioPatterns: [[0], [0, 1], [0, 1, 2, 1], [0, 1, 2, 3]]*/ roundUpThresholds: null },
		{ name: "freehand", stepsPerBeat: 24, /*ticksPerArpeggio: 3, arpeggioPatterns: [[0], [0, 1], [0, 1, 2, 1], [0, 1, 2, 3]]*/ roundUpThresholds: null },
	]);

    public static readonly instrumentTypeNames: ReadonlyArray<string> = ["chip", "FM", "noise", "spectrum", "drumset", "harmonics", "PWM", "custom chip", "mod", "FM6op"];
	public static readonly instrumentTypeHasSpecialInterval: ReadonlyArray<boolean> = [true, true, false, false, false, true, false, true, true, true];
	public static readonly rawChipWaves: DictionaryArray<ChipWave> = toNameMap([
		{ name: "rounded", volume: 0.94, samples: centerWave([0.0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.0, -0.2, -0.4, -0.5, -0.6, -0.7, -0.8, -0.85, -0.9, -0.95, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -0.95, -0.9, -0.85, -0.8, -0.7, -0.6, -0.5, -0.4, -0.2]) },
		{ name: "triangle", volume: 1.0, samples: centerWave([1.0 / 15.0, 3.0 / 15.0, 5.0 / 15.0, 7.0 / 15.0, 9.0 / 15.0, 11.0 / 15.0, 13.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 13.0 / 15.0, 11.0 / 15.0, 9.0 / 15.0, 7.0 / 15.0, 5.0 / 15.0, 3.0 / 15.0, 1.0 / 15.0, -1.0 / 15.0, -3.0 / 15.0, -5.0 / 15.0, -7.0 / 15.0, -9.0 / 15.0, -11.0 / 15.0, -13.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -13.0 / 15.0, -11.0 / 15.0, -9.0 / 15.0, -7.0 / 15.0, -5.0 / 15.0, -3.0 / 15.0, -1.0 / 15.0]) },
		{ name: "square", volume: 0.5, samples: centerWave([1.0, -1.0]) },
		{ name: "1/4 pulse", volume: 0.5, samples: centerWave([1.0, -1.0, -1.0, -1.0]) },
		{ name: "1/8 pulse", volume: 0.5, samples: centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]) },
		{ name: "sawtooth", volume: 0.65, samples: centerWave([1.0 / 31.0, 3.0 / 31.0, 5.0 / 31.0, 7.0 / 31.0, 9.0 / 31.0, 11.0 / 31.0, 13.0 / 31.0, 15.0 / 31.0, 17.0 / 31.0, 19.0 / 31.0, 21.0 / 31.0, 23.0 / 31.0, 25.0 / 31.0, 27.0 / 31.0, 29.0 / 31.0, 31.0 / 31.0, -31.0 / 31.0, -29.0 / 31.0, -27.0 / 31.0, -25.0 / 31.0, -23.0 / 31.0, -21.0 / 31.0, -19.0 / 31.0, -17.0 / 31.0, -15.0 / 31.0, -13.0 / 31.0, -11.0 / 31.0, -9.0 / 31.0, -7.0 / 31.0, -5.0 / 31.0, -3.0 / 31.0, -1.0 / 31.0]) },
		{ name: "double saw", volume: 0.5, samples: centerWave([0.0, -0.2, -0.4, -0.6, -0.8, -1.0, 1.0, -0.8, -0.6, -0.4, -0.2, 1.0, 0.8, 0.6, 0.4, 0.2]) },
		{ name: "double pulse", volume: 0.4, samples: centerWave([1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0]) },
		{ name: "spiky", volume: 0.4, samples: centerWave([1.0, -1.0, 1.0, -1.0, 1.0, 0.0]) },
		{ name: "sine", volume: 0.88, samples: centerAndNormalizeWave([8.0, 9.0, 11.0, 12.0, 13.0, 14.0, 15.0, 15.0, 15.0, 15.0, 14.0, 14.0, 13.0, 11.0, 10.0, 9.0, 7.0, 6.0, 4.0, 3.0, 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 2.0, 4.0, 5.0, 6.0]) },
		{ name: "flute", volume: 0.8, samples: centerAndNormalizeWave([3.0, 4.0, 6.0, 8.0, 10.0, 11.0, 13.0, 14.0, 15.0, 15.0, 14.0, 13.0, 11.0, 8.0, 5.0, 3.0]) },
		{ name: "harp", volume: 0.8, samples: centerAndNormalizeWave([0.0, 3.0, 3.0, 3.0, 4.0, 5.0, 5.0, 6.0, 7.0, 8.0, 9.0, 11.0, 11.0, 13.0, 13.0, 15.0, 15.0, 14.0, 12.0, 11.0, 10.0, 9.0, 8.0, 7.0, 7.0, 5.0, 4.0, 3.0, 2.0, 1.0, 0.0, 0.0]) },
		{ name: "sharp clarinet", volume: 0.38, samples: centerAndNormalizeWave([0.0, 0.0, 0.0, 1.0, 1.0, 8.0, 8.0, 9.0, 9.0, 9.0, 8.0, 8.0, 8.0, 8.0, 8.0, 9.0, 9.0, 7.0, 9.0, 9.0, 10.0, 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]) },
		{ name: "soft clarinet", volume: 0.45, samples: centerAndNormalizeWave([0.0, 1.0, 5.0, 8.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 11.0, 11.0, 12.0, 13.0, 12.0, 10.0, 9.0, 7.0, 6.0, 4.0, 3.0, 3.0, 3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]) },
		{ name: "alto sax", volume: 0.3, samples: centerAndNormalizeWave([5.0, 5.0, 6.0, 4.0, 3.0, 6.0, 8.0, 7.0, 2.0, 1.0, 5.0, 6.0, 5.0, 4.0, 5.0, 7.0, 9.0, 11.0, 13.0, 14.0, 14.0, 14.0, 14.0, 13.0, 10.0, 8.0, 7.0, 7.0, 4.0, 3.0, 4.0, 2.0]) },
		{ name: "bassoon", volume: 0.35, samples: centerAndNormalizeWave([9.0, 9.0, 7.0, 6.0, 5.0, 4.0, 4.0, 4.0, 4.0, 5.0, 7.0, 8.0, 9.0, 10.0, 11.0, 13.0, 13.0, 11.0, 10.0, 9.0, 7.0, 6.0, 4.0, 2.0, 1.0, 1.0, 1.0, 2.0, 2.0, 5.0, 11.0, 14.0]) },
		{ name: "trumpet", volume: 0.22, samples: centerAndNormalizeWave([10.0, 11.0, 8.0, 6.0, 5.0, 5.0, 5.0, 6.0, 7.0, 7.0, 7.0, 7.0, 6.0, 6.0, 7.0, 7.0, 7.0, 7.0, 7.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 7.0, 8.0, 9.0, 11.0, 14.0]) },
		{ name: "electric guitar", volume: 0.2, samples: centerAndNormalizeWave([11.0, 12.0, 12.0, 10.0, 6.0, 6.0, 8.0, 0.0, 2.0, 4.0, 8.0, 10.0, 9.0, 10.0, 1.0, 7.0, 11.0, 3.0, 6.0, 6.0, 8.0, 13.0, 14.0, 2.0, 0.0, 12.0, 8.0, 4.0, 13.0, 11.0, 10.0, 13.0]) },
		{ name: "organ", volume: 0.2, samples: centerAndNormalizeWave([11.0, 10.0, 12.0, 11.0, 14.0, 7.0, 5.0, 5.0, 12.0, 10.0, 10.0, 9.0, 12.0, 6.0, 4.0, 5.0, 13.0, 12.0, 12.0, 10.0, 12.0, 5.0, 2.0, 2.0, 8.0, 6.0, 6.0, 5.0, 8.0, 3.0, 2.0, 1.0]) },
		{ name: "pan flute", volume: 0.35, samples: centerAndNormalizeWave([1.0, 4.0, 7.0, 6.0, 7.0, 9.0, 7.0, 7.0, 11.0, 12.0, 13.0, 15.0, 13.0, 11.0, 11.0, 12.0, 13.0, 10.0, 7.0, 5.0, 3.0, 6.0, 10.0, 7.0, 3.0, 3.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0]) },
        { name: "glitch", volume: 0.5, samples: centerWave([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0]) },
        { name: "trapezoid", volume: 1.0, samples: centerWave([1.0 / 15.0, 6.0 / 15.0, 10.0 / 15.0, 14.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 14.0 / 15.0, 10.0 / 15.0, 6.0 / 15.0, 1.0 / 15.0, -1.0 / 15.0, -6.0 / 15.0, -10.0 / 15.0, -14.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -14.0 / 15.0, -10.0 / 15.0, -6.0 / 15.0, -1.0 / 15.0,])},
    ]); 
	public static readonly chipWaves: DictionaryArray<ChipWave> = rawChipToIntegrated(Config.rawChipWaves);
	// Noise waves have too many samples to write by hand, they're generated on-demand by getDrumWave instead.
	public static readonly chipNoises: DictionaryArray<ChipNoise> = toNameMap([
		{ name: "retro", volume: 0.25, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
		{ name: "white", volume: 1.0, basePitch: 69, pitchFilterMult: 8.0, isSoft: true, samples: null },
		// The "clang" and "buzz" noises are based on similar noises in the modded beepbox! :D
		{ name: "clang", volume: 0.4, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
		{ name: "buzz", volume: 0.3, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
		{ name: "hollow", volume: 1.5, basePitch: 96, pitchFilterMult: 1.0, isSoft: true, samples: null },
		{ name: "shine", volume: 1.0, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
		{ name: "deep", volume: 1.5, basePitch: 120, pitchFilterMult: 1024.0, isSoft: true, samples: null },
		{ name: "cutter", volume: 0.005, basePitch: 96, pitchFilterMult: 1024.0, isSoft: false, samples: null },
        { name: "metallic", volume: 1.0, basePitch: 96, pitchFilterMult: 1024.0, isSoft: false, samples: null },
        { name: "static", volume: 1.0, basePitch: 96, pitchFilterMult: 1024.0, isSoft: false, samples: null },
	]);
	public static readonly filterCutoffMaxHz: number = 8000; // This is carefully calculated to correspond to no change when filtering at 48000 samples per second.
	public static readonly filterCutoffMinHz: number = 1;
	public static readonly filterMax: number = 0.95;
	public static readonly filterMaxResonance: number = 0.95;
	public static readonly filterCutoffRange: number = 11;
	public static readonly filterResonanceRange: number = 8;
	public static readonly transitions: DictionaryArray<Transition> = toNameMap([
		{ name: "seamless", isSeamless: true, attackSeconds: 0.0, releases: false, releaseTicks: 1, slides: false, slideTicks: 3 },
		{ name: "hard", isSeamless: false, attackSeconds: 0.0, releases: false, releaseTicks: 3, slides: false, slideTicks: 3 },
		{ name: "soft", isSeamless: false, attackSeconds: 0.025, releases: false, releaseTicks: 3, slides: false, slideTicks: 3 },
		{ name: "slide", isSeamless: true, attackSeconds: 0.025, releases: false, releaseTicks: 3, slides: true, slideTicks: 3 },
		{ name: "cross fade", isSeamless: false, attackSeconds: 0.04, releases: true, releaseTicks: 6, slides: false, slideTicks: 3 },
		{ name: "hard fade", isSeamless: false, attackSeconds: 0.0, releases: true, releaseTicks: 48, slides: false, slideTicks: 3 },
		{ name: "medium fade", isSeamless: false, attackSeconds: 0.0125, releases: true, releaseTicks: 72, slides: false, slideTicks: 3 },
        { name: "soft fade", isSeamless: false, attackSeconds: 0.06, releases: true, releaseTicks: 96, slides: false, slideTicks: 6 },
        { name: "sliding fade", isSeamless: false, attackSeconds: 0.08, releases: true, releaseTicks: 96, slides: true, slideTicks: 6 },
	]);
	public static readonly vibratos: DictionaryArray<Vibrato> = toNameMap([
		{ name: "none", amplitude: 0.0, type: 0, delayParts: 0 },
		{ name: "light", amplitude: 0.15, type: 0, delayParts: 0 },
		{ name: "delayed", amplitude: 0.3, type: 0, delayParts: 18 },
		{ name: "heavy", amplitude: 0.45, type: 0, delayParts: 0 },
		{ name: "shaky", amplitude: 0.1, type: 1, delayParts: 0 },
	]);
	public static readonly vibratoTypes: DictionaryArray<VibratoType> = toNameMap([
		{ name: "normal", periodsSeconds: [0.14], period: 0.14 },
		{ name: "shaky", periodsSeconds: [0.11, 1.618 * 0.11, 3 * 0.11], period: 266.97 }, // LCM of all periods
	]);
	// This array is more or less a linear step by 0.1 but there's a bit of range added at the start to hit specific ratios, and the end starts to grow faster.
	//                                                             0       1      2    3     4      5    6    7      8     9   10   11 12   13   14   15   16   17   18   19   20   21 22   23   24   25   26   27   28   29   30   31 32   33   34   35   36   37   38    39  40   41 42    43   44   45   46 47   48 49 50
	public static readonly arpSpeedScale: ReadonlyArray<number> = [0, 0.0625, 0.125, 0.2, 0.25, 1 / 3, 0.4, 0.5, 2 / 3, 0.75, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.15, 4.3, 4.5, 4.8, 5, 5.5, 6, 8];
	public static readonly intervals: DictionaryArray<Interval> = toNameMap([
		{ name: "union", spread: 0.0, offset: 0.0, volume: 0.7, sign: 1.0 },
		{ name: "shimmer", spread: 0.018, offset: 0.0, volume: 0.8, sign: 1.0 },
		{ name: "hum", spread: 0.045, offset: 0.0, volume: 1.0, sign: 1.0 },
		{ name: "honky tonk", spread: 0.09, offset: 0.0, volume: 1.0, sign: 1.0 },
		{ name: "dissonant", spread: 0.25, offset: 0.0, volume: 0.9, sign: 1.0 },
		{ name: "fifth", spread: 3.5, offset: 3.5, volume: 0.9, sign: 1.0 },
		{ name: "octave", spread: 6.0, offset: 6.0, volume: 0.8, sign: 1.0 },
		{ name: "bowed", spread: 0.02, offset: 0.0, volume: 1.0, sign: -1.0 },
        { name: "piano", spread: 0.01, offset: 0.0, volume: 1.0, sign: 0.7 },
        { name: "warbled", spread: 0.25, offset: 0.05, volume: 0.9, sign: -0.8 },
        { name: "hecking gosh", spread: 6.25, offset: -6.0, volume: 0.8, sign: -0.7 },
	]);
	public static readonly effectsNames: ReadonlyArray<string> = ["none", "reverb", "chorus", "chorus & reverb"];
	public static readonly volumeRange: number = 50;
	// Beepbox's old volume scale used factor -0.5 and was [0~7] had roughly value 6 = 0.125 power. This new value is chosen to have -21 be the same,
	// given that the new scale is [-25~25]. This is such that conversion between the scales is roughly equivalent by satisfying (0.5*6 = 0.1428*21)
	public static readonly volumeLogScale: number = 0.1428;
	public static readonly panCenter: number = 50;
	public static readonly panMax: number = Config.panCenter * 2;
	public static readonly detuneMin: number = -50;
	public static readonly detuneMax: number = 50;
	public static readonly songDetuneMin: number = -250;
	public static readonly songDetuneMax: number = 250;
	public static readonly chords: DictionaryArray<Chord> = toNameMap([
		{ name: "harmony", harmonizes: true, customInterval: false, arpeggiates: false, isCustomInterval: false, strumParts: 0 },
		{ name: "strum", harmonizes: true, customInterval: false, arpeggiates: false, isCustomInterval: false, strumParts: 1 },
        { name: "arpeggio", harmonizes: false, customInterval: false, arpeggiates: true, isCustomInterval: false, strumParts: 0 },
        { name: "custom interval", harmonizes: true, customInterval: true, arpeggiates: true, isCustomInterval: true, strumParts: 0 },
	]);
	public static readonly maxChordSize: number = 9; // Pandora's box...
	public static readonly operatorCount: number = 4;
	public static readonly algorithms: DictionaryArray<Algorithm> = toNameMap([
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
    public static readonly algorithms6Op: DictionaryArray<Algorithm> = toNameMap([
        //placeholder makes life easier for later
        { name: "Custom", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4, 5, 6], [], [], [], [], []] },
        //yoinked from SynthBox
        //algortihm Section 1
        { name: "1←2←3←4←5←6", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2], [3], [4], [5], [6], []] },
        { name: "1←3 2←4←5←6", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4], [], [5], [6], []] },
        { name: "1←3←4 2←5←6", carrierCount: 2, associatedCarrier: [1, 1, 1, 2, 2, 2], modulatedBy: [[3], [5], [4], [], [6], []] },
        { name: "1←4 2←5 3←6", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[4], [5], [6], [], [], []] },
        //Algorithm Section 2
        { name: "1←3 2←(4 5←6)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4, 5], [], [], [6], []] },
        { name: "1←(3 4) 2←5←6", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3, 4], [5], [], [], [6], []] },
        { name: "1←3 2←(4 5 6)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4, 5, 6], [], [], [], []] },
        { name: "1←3 2←(4 5)←6", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4, 5], [], [6], [6], []] },
        { name: "1←3 2←4←(5 6)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3], [4], [], [5, 6], [], []] },
        { name: "1←(2 3 4 5 6)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4, 5, 6], [], [], [], [], []] },
        { name: "1←(2 3←5 4←6)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4], [], [5], [6], [], []] },
        { name: "1←(2 3 4←5←6)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4], [], [], [5], [6], []] },
        //Algorithm Section 3
        { name: "1←4←5 (2 3)←6", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[4], [6], [6], [5], [], []] },
        { name: "1←(3 4)←5 2←6", carrierCount: 2, associatedCarrier: [1, 2, 2, 2, 2, 2], modulatedBy: [[3, 4], [6], [5], [5], [], []] },
        { name: "(1 2)←4 3←(5 6)", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[4], [4], [5, 6], [], [], []] },
        { name: "(1 2)←5 (3 4)←6", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[5], [5], [6], [6], [], []] },
        { name: "(1 2 3)←(4 5 6)", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[4, 5, 6], [4, 5, 6], [4, 5, 6], [], [], []] },
        { name: "1←5 (2 3 4)←6", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[5], [6], [6], [6], [], []] },
        { name: "1 2←5 (3 4)←6", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[], [5], [6], [6], [], []] },
        { name: "1 2 (3 4 5)←6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[], [], [6], [6], [6], []] },
        { name: "1 2 3 (4 5)←6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[], [], [], [6], [6], []] },
        //Algorithm Section 3
        { name: "1 2←4 3←(5 6)", carrierCount: 3, associatedCarrier: [1, 2, 3, 3, 3, 3], modulatedBy: [[], [4], [5, 6], [], [], []] },
        { name: "1←4 2←(5 6) 3", carrierCount: 3, associatedCarrier: [1, 2, 3, 3, 3, 3,], modulatedBy: [[4], [5, 6], [], [], [], []] },
        { name: "1 2 3←5 4←6", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[], [], [5], [6], [], []] },
        { name: "1 (2 3)←5←6 4", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4,], modulatedBy: [[], [5], [5], [], [6], []] },
        { name: "1 2 3←5←6 4", carrierCount: 4, associatedCarrier: [1, 2, 3, 4, 4, 4], modulatedBy: [[], [], [5, 6], [], [], []] },
        { name: "(1 2 3 4 5)←6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[6], [6], [6], [6], [6], []] },
        { name: "1 2 3 4 5←6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[], [], [], [], [6], []] },
        { name: "1 2 3 4 5 6", carrierCount: 6, associatedCarrier: [1, 2, 3, 4, 5, 6], modulatedBy: [[], [], [], [], [], []] },
        //Section 4 where we take our own previous ones for 4op and it gets weird
        { name: "1←(2 (3 (4 (5 (6", carrierCount: 5, associatedCarrier: [1, 2, 3, 4, 5, 5], modulatedBy: [[2, 3, 4, 5, 6], [3, 4, 5, 6], [4, 5, 6], [5, 6], [6], []] },
        { name: "1←(2(3(4(5(6", carrierCount: 1, associatedCarrier: [1, 1, 1, 1, 1, 1], modulatedBy: [[2, 3, 4, 5, 6], [3, 4, 5, 6], [4, 5, 6], [5, 6], [6], []] },
        { name: "1←4(2←5(3←6", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[2, 3, 4], [3, 5], [6], [], [], []] },
        { name: "1←4(2←5 3←6", carrierCount: 3, associatedCarrier: [1, 2, 3, 1, 2, 3], modulatedBy: [[2, 3, 4], [5], [6], [], [], []] },
    ]);
    public static readonly operatorCarrierInterval: ReadonlyArray<number> = [0.0, 0.04, -0.073, 0.091, 0.061, 0.024];
	public static readonly operatorAmplitudeMax: number = 15;
    public static readonly operatorFrequencies: DictionaryArray<OperatorFrequency> = toNameMap([
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
        { name: "~4x", mult: 4.0, hzOffset: -2.4, amplitudeSign: -1.0 },
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

    public static readonly envelopes: DictionaryArray<Envelope> = toNameMap([
        { name: "custom", type: EnvelopeType.custom, speed: 0.0 },
        { name: "steady", type: EnvelopeType.steady, speed: 0.0 },
        { name: "punch", type: EnvelopeType.punch, speed: 0.0 },
        { name: "flare -1", type: EnvelopeType.flare, speed: 128.0 },
        { name: "flare 1", type: EnvelopeType.flare, speed: 32.0 },
        { name: "flare 2", type: EnvelopeType.flare, speed: 8.0 },
        { name: "flare 3", type: EnvelopeType.flare, speed: 2.0 },
        { name: "twang -1", type: EnvelopeType.twang, speed: 128.0 },
        { name: "twang 1", type: EnvelopeType.twang, speed: 32.0 },
        { name: "twang 2", type: EnvelopeType.twang, speed: 8.0 },
        { name: "twang 3", type: EnvelopeType.twang, speed: 2.0 },
        { name: "swell -1", type: EnvelopeType.swell, speed: 128.0 },
        { name: "swell 1", type: EnvelopeType.swell, speed: 32.0 },
        { name: "swell 2", type: EnvelopeType.swell, speed: 8.0 },
        { name: "swell 3", type: EnvelopeType.swell, speed: 2.0 },
        { name: "tremolo0", type: EnvelopeType.tremolo, speed: 8.0 },
        { name: "tremolo1", type: EnvelopeType.tremolo, speed: 4.0 },
        { name: "tremolo2", type: EnvelopeType.tremolo, speed: 2.0 },
        { name: "tremolo3", type: EnvelopeType.tremolo, speed: 1.0 },
        { name: "tremolo4", type: EnvelopeType.tremolo2, speed: 4.0 },
        { name: "tremolo5", type: EnvelopeType.tremolo2, speed: 2.0 },
        { name: "tremolo6", type: EnvelopeType.tremolo2, speed: 1.0 },
        { name: "decay -1", type: EnvelopeType.decay, speed: 40.0 },
        { name: "decay 1", type: EnvelopeType.decay, speed: 10.0 },
        { name: "decay 2", type: EnvelopeType.decay, speed: 7.0 },
        { name: "decay 3", type: EnvelopeType.decay, speed: 4.0 },
        { name: "wibble-1", type: EnvelopeType.wibble, speed: 96.0 },
        { name: "wibble 1", type: EnvelopeType.wibble, speed: 24.0 },
        { name: "wibble 2", type: EnvelopeType.wibble, speed: 12.0 },
        { name: "wibble 3", type: EnvelopeType.wibble, speed: 4.0 },
        { name: "linear-2", type: EnvelopeType.linear, speed: 256.0 },
        { name: "linear-1", type: EnvelopeType.linear, speed: 128.0 },
        { name: "linear 1", type: EnvelopeType.linear, speed: 32.0 },
        { name: "linear 2", type: EnvelopeType.linear, speed: 8.0 },
        { name: "linear 3", type: EnvelopeType.linear, speed: 2.0 },
        { name: "rise -2", type: EnvelopeType.rise, speed: 256.0 },
        { name: "rise -1", type: EnvelopeType.rise, speed: 128.0 },
        { name: "rise 1", type: EnvelopeType.rise, speed: 32.0 },
        { name: "rise 2", type: EnvelopeType.rise, speed: 8.0 },
        { name: "rise 3", type: EnvelopeType.rise, speed: 2.0 },
    ]);
	public static readonly feedbacks: DictionaryArray<Feedback> = toNameMap([
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
        { name: "ALL", indices: [[1,2,3,4], [1,2,3,4], [1,2,3,4], [1, 2, 3,4]] },
    ]);
    public static readonly feedbacks6Op: DictionaryArray<Feedback> = toNameMap([
        //placeholder makes life easier for later
        { name: "Custom", indices: [[2, 3, 4, 5, 6], [], [], [], [], []] },

        { name: "1⟲", indices: [[1], [], [], [], [], []] },
        { name: "2⟲", indices: [[], [2], [], [], [], []] },
        { name: "3⟲", indices: [[], [], [3], [], [], []] },
        { name: "4⟲", indices: [[], [], [], [4], [], []] },
        { name: "4⟲", indices: [[], [], [], [], [5], []] },
        { name: "4⟲", indices: [[], [], [], [], [], [6]] },
        { name: "1⟲ 2⟲", indices: [[1], [2], [], [], [], []] },
        { name: "3⟲ 4⟲", indices: [[], [], [3], [4], [], []] },
        { name: "1⟲ 2⟲ 3⟲", indices: [[1], [2], [3], [], [], []] },
        { name: "2⟲ 3⟲ 4⟲", indices: [[], [2], [3], [4], [], []] },
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
        { name: "1→4 2→5 3→6", indices: [[], [], [], [1], [2], [3]] },
        { name: "1→5 2→6 3→4", indices: [[], [], [], [3], [1], [2]] },
        { name: "1→2→3→4→5→6", indices: [[], [1], [2], [3], [4], [5]] },
        { name: "2→1→6→5→4→3→2", indices: [[2], [3], [4], [5], [6], [1]] },
        { name: "1→2→3→4→5→6→1", indices: [[6], [1], [2], [3], [4], [5]] },
        { name: "1↔2 3↔4 5↔6", indices: [[2], [1], [4], [3], [6], [5]] },
        { name: "1↔4 2↔5 3↔6", indices: [[4], [5], [6], [1], [2], [3]] },
        { name: "(1,2,3,4,5)→6", indices: [[], [], [], [], [], [1, 2, 3, 4, 5]] },
        { name: "ALL", indices: [[1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]] },
    ]);
	public static readonly chipNoiseLength: number = 1 << 15; // 32768
	public static readonly spectrumBasePitch: number = 24;
	public static readonly spectrumControlPoints: number = 30;
	public static readonly spectrumControlPointsPerOctave: number = 7;
	public static readonly spectrumControlPointBits: number = 3;
	public static readonly spectrumMax: number = (1 << Config.spectrumControlPointBits) - 1;
	public static readonly harmonicsControlPoints: number = 28;
	public static readonly harmonicsRendered: number = 64;
	public static readonly harmonicsControlPointBits: number = 3;
	public static readonly harmonicsMax: number = (1 << Config.harmonicsControlPointBits) - 1;
	public static readonly harmonicsWavelength: number = 1 << 11; // 2048
	public static readonly pulseWidthRange: number = 50;
	public static readonly pitchChannelCountMin: number = 1;
	public static readonly pitchChannelCountMax: number = 40;
	public static readonly noiseChannelCountMin: number = 0;
	public static readonly noiseChannelCountMax: number = 8;
	public static readonly modChannelCountMin: number = 0;
	public static readonly modChannelCountMax: number = 8;
	public static readonly noiseInterval: number = 6;
	public static readonly pitchesPerOctave: number = 12; // TODO: Use this for converting pitch to frequency.
	public static readonly drumCount: number = 12;
	public static readonly modCount: number = 6;
	public static readonly pitchOctaves: number = 8;
	public static readonly maxScrollableOctaves: number = 5; // Largest number possible with any config setting
	public static readonly maxPitch: number = Config.pitchOctaves * Config.pitchesPerOctave;
	public static readonly maximumTonesPerChannel: number = Config.maxChordSize * 2;
	public static readonly sineWaveLength: number = 1 << 8; // 256
	public static readonly sineWaveMask: number = Config.sineWaveLength - 1;
	public static readonly sineWave: Float64Array = generateSineWave();
	public static readonly operatorWaves: DictionaryArray<OperatorWave> = toNameMap([
		{ name: "sine", samples: Config.sineWave },
		{ name: "triangle", samples: generateTriWave() },
		{ name: "pulse width", samples: generateSquareWave() },
		{ name: "sawtooth", samples: generateSawWave() },
		{ name: "ramp", samples: generateSawWave(true) },
		{ name: "trapezoid", samples: generateTrapezoidWave(2) },
	]);
	public static readonly pwmOperatorWaves: DictionaryArray<OperatorWave> = toNameMap([
		{ name: "1%", samples: generateSquareWave(0.01) },
		{ name: "5%", samples: generateSquareWave(0.05) },
		{ name: "12.5%", samples: generateSquareWave(0.125) },
		{ name: "25%", samples: generateSquareWave(0.25) },
		{ name: "33%", samples: generateSquareWave(1/3) },
		{ name: "50%", samples: generateSquareWave(0.5) },
		{ name: "66%", samples: generateSquareWave(2/3) },
		{ name: "75%", samples: generateSquareWave(0.75) },
		{ name: "87.5%", samples: generateSquareWave(0.875) },
		{ name: "95%", samples: generateSquareWave(0.95) },
		{ name: "99%", samples: generateSquareWave(0.99) },
	]);


	// Height of the small editor column for inserting/deleting rows, in pixels.
	public static readonly barEditorHeight: number = 10;

}

function centerWave(wave: Array<number>): Float64Array {
	let sum: number = 0.0;
	for (let i: number = 0; i < wave.length; i++) {
		sum += wave[i];
	}
	const average: number = sum / wave.length;

	for (let i: number = 0; i < wave.length; i++) {
		wave[i] -= average;
	}

	return new Float64Array(wave);
}

function centerAndNormalizeWave(wave: Array<number>): Float64Array {
	let sum: number = 0.0;
	let magn: number = 0.0;
	for (let i: number = 0; i < wave.length; i++) {
		sum += wave[i];
		magn += Math.abs(wave[i]);
	}
	const average: number = sum / wave.length;
	const magnAvg: number = magn / wave.length;

	for (let i: number = 0; i < wave.length; i++) {
		wave[i] = (wave[i] - average) / magnAvg;
	}

	return new Float64Array(wave);

}

function integrateWave(wave: Float64Array): Float64Array {
	// Perform the integral on the wave. The chipSynth will perform the derivative to get the original wave back but with antialiasing.
	let cumulative: number = 0;
	let wavePrev: number = 0;
	// The first sample should be zero, and we'll duplicate it at the end for easier interpolation.
	let newWave: Float64Array = new Float64Array(wave.length + 1);
	for (let i: number = 0; i < wave.length; i++) {
		newWave[i] = wave[i];
	}
	newWave[wave.length] = 0.0;

	for (let i: number = 0; i < wave.length; i++) {
		cumulative += wavePrev;
		wavePrev = newWave[i];
		newWave[i] = cumulative;
	}
	return newWave;
}


// The function arguments will be defined in FFT.ts, but I want
// SynthConfig.ts to be at the top of the compiled JS so I won't directly
// depend on FFT here. synth.ts will take care of importing FFT.ts.
//function inverseRealFourierTransform(array: {length: number, [index: number]: number}, fullArrayLength: number): void;
//function scaleElementsByFactor(array: {length: number, [index: number]: number}, factor: number): void;
export function getDrumWave(index: number, inverseRealFourierTransform: Function | null = null, scaleElementsByFactor: Function | null = null): Float32Array {
	let wave: Float32Array | null = Config.chipNoises[index].samples;
	if (wave == null) {
		wave = new Float32Array(Config.chipNoiseLength + 1);
		Config.chipNoises[index].samples = wave;

		if (index == 0) {
			// The "retro" drum uses a "Linear Feedback Shift Register" similar to the NES noise channel.
			let drumBuffer: number = 1;
			for (let i: number = 0; i < Config.chipNoiseLength; i++) {
				wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
				let newBuffer: number = drumBuffer >> 1;
				if (((drumBuffer + newBuffer) & 1) == 1) {
					newBuffer += 1 << 14;
				}
				drumBuffer = newBuffer;
			}
		} else if (index == 1) {
			// White noise is just random values for each sample.
			for (let i: number = 0; i < Config.chipNoiseLength; i++) {
				wave[i] = Math.random() * 2.0 - 1.0;
			}
		} else if (index == 2) {
			// The "clang" noise wave is based on a similar noise wave in the modded beepbox made by DAzombieRE.
			let drumBuffer: number = 1;
			for (let i: number = 0; i < Config.chipNoiseLength; i++) {
				wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
				let newBuffer: number = drumBuffer >> 1;
				if (((drumBuffer + newBuffer) & 1) == 1) {
					newBuffer += 2 << 14;
				}
				drumBuffer = newBuffer;
			}
		} else if (index == 3) {
			// The "buzz" noise wave is based on a similar noise wave in the modded beepbox made by DAzombieRE.
			let drumBuffer: number = 1;
			for (let i: number = 0; i < Config.chipNoiseLength; i++) {
				wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
				let newBuffer: number = drumBuffer >> 1;
				if (((drumBuffer + newBuffer) & 1) == 1) {
					newBuffer += 10 << 2;
				}
				drumBuffer = newBuffer;
			}
		} else if (index == 4) {
			// "hollow" drums, designed in frequency space and then converted via FFT:
			drawNoiseSpectrum(wave, 10, 11, 1, 1, 0);
			drawNoiseSpectrum(wave, 11, 14, .6578, .6578, 0);
			inverseRealFourierTransform!(wave, Config.chipNoiseLength);
			scaleElementsByFactor!(wave, 1.0 / Math.sqrt(Config.chipNoiseLength));
		} else if (index == 5) {
			// "Shine" drums from modbox!
			var drumBuffer = 1;
			for (var i = 0; i < Config.chipNoiseLength; i++) {
				wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
				var newBuffer = drumBuffer >> 1;
				if (((drumBuffer + newBuffer) & 1) == 1) {
					newBuffer += 10 << 2;
				}
				drumBuffer = newBuffer;
			}
		} else if (index == 6) {
			// "Deep" drums from modbox!
			drawNoiseSpectrum(wave, 1, 10, 1, 1, 0);
			drawNoiseSpectrum(wave, 20, 14, -2, -2, 0);
			inverseRealFourierTransform!(wave, Config.chipNoiseLength);
			scaleElementsByFactor!(wave, 1.0 / Math.sqrt(Config.chipNoiseLength));
		} else if (index == 7) {
			// "Cutter" drums from modbox!
			var drumBuffer = 1;
			for (var i = 0; i < Config.chipNoiseLength; i++) {
				wave[i] = (drumBuffer & 1) * 4.0 * (Math.random() * 14 + 1);
				var newBuffer = drumBuffer >> 1;
				if (((drumBuffer + newBuffer) & 1) == 1) {
					newBuffer += 15 << 2;
				}
				drumBuffer = newBuffer;
			}
		} else if (index == 8) {
			// "Metallic" drums from modbox!
			var drumBuffer = 1;
			for (var i = 0; i < 32768; i++) {
				wave[i] = (drumBuffer & 1) / 2.0 + 0.5;
				var newBuffer = drumBuffer >> 1;
				if (((drumBuffer + newBuffer) & 1) == 1) {
					newBuffer -= 10 << 2;
				}
				drumBuffer = newBuffer;
            }
        } else if (index == 9) {
            // a noise more like old static than white noise
            let drumBuffer: number = 1;
            for (let i: number = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 2.0 - 1.1;
                let newBuffer: number = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 8 ^ 2 << 16;
                }
                drumBuffer = newBuffer;
            }
		} else {
			throw new Error("Unrecognized drum index: " + index);
		}

		wave[Config.chipNoiseLength] = wave[0];
	}

	return wave;
}

export function drawNoiseSpectrum(wave: Float32Array, lowOctave: number, highOctave: number, lowPower: number, highPower: number, overallSlope: number): number {
	const referenceOctave: number = 11;
	const referenceIndex: number = 1 << referenceOctave;
	const lowIndex: number = Math.pow(2, lowOctave) | 0;
	const highIndex: number = Math.min(Config.chipNoiseLength >> 1, Math.pow(2, highOctave) | 0);
	const retroWave: Float32Array = getDrumWave(0);
	let combinedAmplitude: number = 0.0;
	for (let i: number = lowIndex; i < highIndex; i++) {

		let lerped: number = lowPower + (highPower - lowPower) * (Math.log(i) / Math.LN2 - lowOctave) / (highOctave - lowOctave);
		//let amplitude: number = Math.pow(2, lerped);
		//let amplitude: number = Math.pow((lerped + 5) / 7, 4);
		let amplitude: number = Math.pow(2, (lerped - 1) * Config.spectrumMax + 1) * lerped;

		amplitude *= Math.pow(i / referenceIndex, overallSlope);

		combinedAmplitude += amplitude;

		// Add two different sources of psuedo-randomness to the noise
		// (individually they aren't random enough) but in a deterministic
		// way so that live spectrum editing doesn't result in audible pops.
		// Multiple all the sine wave amplitudes by 1 or -1 based on the 
		// LFSR retro wave (effectively random), and also rotate the phase
		// of each sine wave based on the golden angle to disrupt the symmetry.
		amplitude *= retroWave[i];
		const radians: number = 0.61803398875 * i * i * Math.PI * 2.0;

		wave[i] = Math.cos(radians) * amplitude;
		wave[Config.chipNoiseLength - i] = Math.sin(radians) * amplitude;
	}

	return combinedAmplitude;
}

function generateSineWave(): Float64Array {
	const wave: Float64Array = new Float64Array(Config.sineWaveLength + 1);
	for (let i: number = 0; i < Config.sineWaveLength + 1; i++) {
		wave[i] = Math.sin(i * Math.PI * 2.0 / Config.sineWaveLength);
	}
	return wave;
}

function generateTriWave(): Float64Array {
	const wave: Float64Array = new Float64Array(Config.sineWaveLength + 1);
	for (let i: number = 0; i < Config.sineWaveLength + 1; i++) {
		wave[i] = Math.asin(Math.sin(i * Math.PI * 2.0 / Config.sineWaveLength)) / (Math.PI / 2);
	}
	return wave;
}

function generateTrapezoidWave(drive: number = 2): Float64Array {
	const wave: Float64Array = new Float64Array(Config.sineWaveLength + 1);
	for (let i: number = 0; i < Config.sineWaveLength + 1; i++) {
		wave[i] = Math.max( -1.0, Math.min( 1.0, Math.asin(Math.sin(i * Math.PI * 2.0 / Config.sineWaveLength)) * drive ) );
	}
	return wave;
}

function generateSquareWave(phaseWidth: number = 0): Float64Array {
	const wave: Float64Array = new Float64Array(Config.sineWaveLength + 1);
	const centerPoint: number = Config.sineWaveLength / 4;
	for (let i: number = 0; i < Config.sineWaveLength + 1; i++) {
		wave[i] = +((Math.abs(i - centerPoint) < phaseWidth * Config.sineWaveLength / 2)
			|| ((Math.abs(i - Config.sineWaveLength - centerPoint) < phaseWidth * Config.sineWaveLength / 2))) * 2 - 1;
	}
	return wave;
}

function generateSawWave(inverse: boolean = false): Float64Array {
	const wave: Float64Array = new Float64Array(Config.sineWaveLength + 1);
	for (let i: number = 0; i < Config.sineWaveLength + 1; i++) {
		wave[i] = ((i + (Config.sineWaveLength / 4.0)) * 2.0 / Config.sineWaveLength) % 2 - 1;
		wave[i] = inverse ? -wave[i] : wave[i];
	}
	return wave;
}

export function getArpeggioPitchIndex(pitchCount: number, useFastTwoNoteArp: boolean, arpeggio: number): number {
	let arpeggioPattern: ReadonlyArray<number> = Config.arpeggioPatterns[pitchCount - 1];
	if (arpeggioPattern != null) {
		if (pitchCount == 2 && useFastTwoNoteArp == false) {
			arpeggioPattern = [0, 0, 1, 1];
		}
		return arpeggioPattern[arpeggio % arpeggioPattern.length];
	} else {
		return arpeggio % pitchCount;
	}
}

// Pardon the messy type casting. This allows accessing array members by numerical index or string name.
export function toNameMap<T extends BeepBoxOption>(array: Array<Pick<T, Exclude<keyof T, "index">>>): DictionaryArray<T> {
	const dictionary: Dictionary<T> = {};
	for (let i: number = 0; i < array.length; i++) {
		const value: any = array[i];
		value.index = i;
		dictionary[value.name] = <T>value;
	}
	const result: DictionaryArray<T> = <DictionaryArray<T>><any>array;
	result.dictionary = dictionary;
	return result;
}

export function rawChipToIntegrated(raw: DictionaryArray<ChipWave>): DictionaryArray<ChipWave> {
	const newArray: Array<ChipWave> = new Array<ChipWave>(raw.length);
	const dictionary: Dictionary<ChipWave> = {};
	for (let i: number = 0; i < newArray.length; i++) {
		newArray[i] = Object.assign([], raw[i]);
		const value: any = newArray[i];
		value.index = i;
		dictionary[value.name] = <ChipWave>value;
    }
	for (let key in dictionary) {
		dictionary[key].samples = integrateWave(dictionary[key].samples);
	}
	const result: DictionaryArray<ChipWave> = <DictionaryArray<ChipWave>><any>newArray;
	result.dictionary = dictionary;
	return result;
}
//}
