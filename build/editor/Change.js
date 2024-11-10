export class Change {
    constructor() {
        this._noop = true;
    }
    _didSomething() {
        this._noop = false;
    }
    isNoop() {
        return this._noop;
    }
    commit() { }
}
export class UndoableChange extends Change {
    constructor(reversed) {
        super();
        this._reversed = reversed;
        this._doneForwards = !reversed;
    }
    undo() {
        if (this._reversed) {
            this._doForwards();
            this._doneForwards = true;
        }
        else {
            this._doBackwards();
            this._doneForwards = false;
        }
    }
    redo() {
        if (this._reversed) {
            this._doBackwards();
            this._doneForwards = false;
        }
        else {
            this._doForwards();
            this._doneForwards = true;
        }
    }
    _isDoneForwards() {
        return this._doneForwards;
    }
    _doForwards() {
        throw new Error("Change.doForwards(): Override me.");
    }
    _doBackwards() {
        throw new Error("Change.doBackwards(): Override me.");
    }
}
export class ChangeGroup extends Change {
    constructor() {
        super();
    }
    append(change) {
        if (change.isNoop())
            return;
        this._didSomething();
    }
}
export class ChangeSequence extends UndoableChange {
    constructor(changes) {
        super(false);
        if (changes == undefined) {
            this._changes = [];
        }
        else {
            this._changes = changes.concat();
        }
    }
    append(change) {
        if (change.isNoop())
            return;
        this._changes[this._changes.length] = change;
        this._didSomething();
    }
    _doForwards() {
        for (let i = 0; i < this._changes.length; i++) {
            this._changes[i].redo();
        }
    }
    _doBackwards() {
        for (let i = this._changes.length - 1; i >= 0; i--) {
            this._changes[i].undo();
        }
    }
}
//# sourceMappingURL=Change.js.map