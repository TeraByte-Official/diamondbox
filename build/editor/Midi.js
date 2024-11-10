export const defaultMidiExpression = 0x7F;
export const defaultMidiPitchBend = 0x2000;
export const analogousDrumMap = {
    35: { frequency: 0, duration: 2, volume: 3 },
    36: { frequency: 0, duration: 2, volume: 3 },
    37: { frequency: 5, duration: 1, volume: 3 },
    38: { frequency: 4, duration: 2, volume: 3 },
    39: { frequency: 5, duration: 2, volume: 3 },
    40: { frequency: 4, duration: 2, volume: 3 },
    41: { frequency: 1, duration: 2, volume: 3 },
    42: { frequency: 8, duration: 1, volume: 3 },
    43: { frequency: 1, duration: 2, volume: 3 },
    44: { frequency: 8, duration: 1, volume: 2 },
    45: { frequency: 2, duration: 2, volume: 3 },
    46: { frequency: 8, duration: 4, volume: 3 },
    47: { frequency: 2, duration: 2, volume: 3 },
    48: { frequency: 3, duration: 2, volume: 3 },
    49: { frequency: 7, duration: 4, volume: 3 },
    50: { frequency: 3, duration: 2, volume: 3 },
    51: { frequency: 6, duration: 4, volume: 2 },
    52: { frequency: 7, duration: 4, volume: 3 },
    53: { frequency: 6, duration: 2, volume: 3 },
    54: { frequency: 11, duration: 2, volume: 3 },
    55: { frequency: 9, duration: 4, volume: 3 },
    56: { frequency: 7, duration: 1, volume: 2 },
    57: { frequency: 7, duration: 4, volume: 3 },
    58: { frequency: 10, duration: 2, volume: 2 },
    59: { frequency: 6, duration: 4, volume: 3 },
    69: { frequency: 10, duration: 2, volume: 3 },
    70: { frequency: 10, duration: 2, volume: 3 },
    73: { frequency: 10, duration: 1, volume: 2 },
    74: { frequency: 10, duration: 2, volume: 2 },
};
export function midiVolumeToVolumeMult(volume) {
    return Math.pow(volume / 127, 4.0) / 0.3844015376046128;
}
export function volumeMultToMidiVolume(volumeMult) {
    return Math.pow(volumeMult * 0.3844015376046128, 0.25) * 127;
}
export function midiExpressionToVolumeMult(expression) {
    return Math.pow(expression / 127, 4.0);
}
export function volumeMultToMidiExpression(volumeMult) {
    return Math.pow(volumeMult, 0.25) * 127;
}
//# sourceMappingURL=Midi.js.map