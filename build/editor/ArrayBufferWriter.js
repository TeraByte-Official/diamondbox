function transfer(source, length) {
    const dest = new ArrayBuffer(length);
    let nextOffset = 0;
    let leftBytes = Math.min(source.byteLength, dest.byteLength);
    const wordSizes = [8, 4, 2, 1];
    for (const wordSize of wordSizes) {
        if (leftBytes >= wordSize) {
            const done = transferWith(wordSize, source, dest, nextOffset, leftBytes);
            nextOffset = done.nextOffset;
            leftBytes = done.leftBytes;
        }
    }
    return dest;
    function transferWith(wordSize, source, dest, nextOffset, leftBytes) {
        let ViewClass = Uint8Array;
        switch (wordSize) {
            case 8:
                ViewClass = Float64Array;
                break;
            case 4:
                ViewClass = Float32Array;
                break;
            case 2:
                ViewClass = Uint16Array;
                break;
            case 1:
                ViewClass = Uint8Array;
                break;
            default:
                ViewClass = Uint8Array;
                break;
        }
        const view_source = new ViewClass(source, nextOffset, (leftBytes / wordSize) | 0);
        const view_dest = new ViewClass(dest, nextOffset, (leftBytes / wordSize) | 0);
        for (let i = 0; i < view_dest.length; i++) {
            view_dest[i] = view_source[i];
        }
        return {
            nextOffset: view_source.byteOffset + view_source.byteLength,
            leftBytes: leftBytes - view_dest.length * wordSize,
        };
    }
}
export class ArrayBufferWriter {
    constructor(initialCapacity) {
        this._writeIndex = 0;
        this._fileSize = 0;
        this._arrayBuffer = new ArrayBuffer(initialCapacity);
        this._data = new DataView(this._arrayBuffer);
    }
    _addBytes(numBytes) {
        this._fileSize += numBytes;
        if (this._fileSize > this._arrayBuffer.byteLength) {
            this._arrayBuffer = transfer(this._arrayBuffer, Math.max(this._arrayBuffer.byteLength * 2, this._fileSize));
            this._data = new DataView(this._arrayBuffer);
        }
    }
    getWriteIndex() {
        return this._writeIndex;
    }
    rewriteUint32(index, value) {
        this._data.setUint32(index, value >>> 0, false);
    }
    writeUint32(value) {
        value = value >>> 0;
        this._addBytes(4);
        this._data.setUint32(this._writeIndex, value, false);
        this._writeIndex = this._fileSize;
    }
    writeUint24(value) {
        value = value >>> 0;
        this._addBytes(3);
        this._data.setUint8(this._writeIndex, (value >> 16) & 0xff);
        this._data.setUint8(this._writeIndex + 1, (value >> 8) & 0xff);
        this._data.setUint8(this._writeIndex + 2, (value) & 0xff);
        this._writeIndex = this._fileSize;
    }
    writeUint16(value) {
        value = value >>> 0;
        this._addBytes(2);
        this._data.setUint16(this._writeIndex, value, false);
        this._writeIndex = this._fileSize;
    }
    writeUint8(value) {
        value = value >>> 0;
        this._addBytes(1);
        this._data.setUint8(this._writeIndex, value);
        this._writeIndex = this._fileSize;
    }
    writeInt8(value) {
        value = value | 0;
        this._addBytes(1);
        this._data.setInt8(this._writeIndex, value);
        this._writeIndex = this._fileSize;
    }
    writeMidi7Bits(value) {
        value = value >>> 0;
        if (value >= 0x80)
            throw new Error("7 bit value contained 8th bit!");
        this._addBytes(1);
        this._data.setUint8(this._writeIndex, value);
        this._writeIndex = this._fileSize;
    }
    writeMidiVariableLength(value) {
        value = value >>> 0;
        if (value > 0x0fffffff)
            throw new Error("writeVariableLength value too big.");
        let startWriting = false;
        for (let i = 0; i < 4; i++) {
            const shift = 21 - i * 7;
            const bits = (value >>> shift) & 0x7f;
            if (bits != 0 || i == 3)
                startWriting = true;
            if (startWriting)
                this.writeUint8((i == 3 ? 0x00 : 0x80) | bits);
        }
    }
    writeMidiAscii(string) {
        this.writeMidiVariableLength(string.length);
        for (let i = 0; i < string.length; i++) {
            const charCode = string.charCodeAt(i);
            if (charCode > 0x7f)
                throw new Error("Trying to write unicode character as ascii.");
            this.writeUint8(charCode);
        }
    }
    toCompactArrayBuffer() {
        return transfer(this._arrayBuffer, this._fileSize);
    }
}
//# sourceMappingURL=ArrayBufferWriter.js.map