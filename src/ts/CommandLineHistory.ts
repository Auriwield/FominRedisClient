export class CommandLineHistory {
    private static emptyCache = "EmptyCache";
    private _current: number = 0;
    private history: string[] = [];
    private _cache: string = CommandLineHistory.emptyCache;

    save(row: string) {
        if (this.history[this.current] === row) {
            return;
        }

        this.history.push(row);
        this.current++;
    }

    next(): string {
        if (this._cache != CommandLineHistory.emptyCache) {
            return this.cache;
        }
        return this.history[this.current++];
    }

    previous(): string {
        return this.history[this.current--]
    }

    isOnLastPosition(): boolean {
        return this.current === this.history.length - 1;
    }

    get current(): number {
        return this._current;
    }

    set current(value: number) {
        if (value < 0 || value >= this.history.length)
            return;

        this._current = value;
    }

    get cache(): string {
        let cache = this._cache;
        this._cache = CommandLineHistory.emptyCache;
        return cache;
    }

    set cache(value: string) {
        if (this._cache == CommandLineHistory.emptyCache)
            this._cache = value;
    }
}