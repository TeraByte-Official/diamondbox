export class ChangeNotifier {
    constructor() {
        this._watchers = [];
        this._dirty = false;
    }
    watch(watcher) {
        if (this._watchers.indexOf(watcher) == -1) {
            this._watchers.push(watcher);
        }
    }
    unwatch(watcher) {
        const index = this._watchers.indexOf(watcher);
        if (index != -1) {
            this._watchers.splice(index, 1);
        }
    }
    changed() {
        this._dirty = true;
    }
    notifyWatchers() {
        if (!this._dirty)
            return;
        this._dirty = false;
        for (const watcher of this._watchers.concat()) {
            watcher();
        }
    }
}
//# sourceMappingURL=ChangeNotifier.js.map