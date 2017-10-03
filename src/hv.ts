
interface Watcher<T> {
    (newValue: T, oldValue: T): void;
}

let settingHvs: HyperValue<any>[] = [];

type HvArray<T> = Array<HyperValue<T>>;

type DepFn<T> = (params: HyperValue<any>[]) => T;

export class HyperValue<T> {
    watchers: Watcher<T>[] = [];
    value: T;
    newValue: T;
    updating = false;
    deps: HyperValue<T>[];
    depFn: DepFn<T> = null;

    constructor(initialValue?: T) {
        this.value = initialValue;
    }

    g(): T {
        if (recordingHv) {
            recordedHv.push(this);
        }
        if (this.updating) {
            return this.newValue;
        }
        return this.value;
    }

    s(newValue: T) {
        if (this.updating) {
            return;
        }
        this.updating = true;
        this.newValue = newValue;
        for (let watcher of this.watchers) {
            watcher(newValue, this.value);
        }
        this.value = newValue;
        this.updating = false;
    }

    watch(watcher: Watcher<T>) {
        this.watchers.push(watcher);
    }

    unwatch(watcher: Watcher<T>) {
        let index = this.watchers.indexOf(watcher);
        if (index === -1) {
            return;
        }
        this.watchers.splice(index, 1);
    }

    calc() {
        if (this.depFn) {
            this.s(
                this.depFn(
                    this.deps
                )
            );
        }
    }

    bind(deps: HyperValue<any>[], fn: (params: HyperValue<any>[]) => T) {
        this.deps = deps;
        this.depFn = fn;
        for (let dep of deps) {
            dep.watch(() => {
                this.calc()
            });
        }
    }
}

export function $hv<T>(value?: T): HyperValue<T> {
    return new HyperValue(value);
}

export function $hc<T>(deps: HyperValue<any>[], fn: (params: HyperValue<any>[]) => T): HyperValue<T> {
    const hv = $hv<T>();
    hv.bind(deps, fn);
    hv.calc();
    return hv;
}

let recordedHv: HyperValue<any>[] = [];
let recordingHv = false;

function hvRecordStart() {
    recordedHv = [];
    recordingHv = true;
}

function hvRecordStop() {
    recordingHv = false;
    return recordedHv;
}

export function noRecord(fn: () => void) {
    recordingHv = false;
    fn();
    recordingHv = true;
}

export function $autoHv<T>(fn: () => T): HyperValue<T> {
    hvRecordStart();
    const value = fn();
    const hv = $hv(value);
    const deps = hvRecordStop();
    for (let dep of deps) {
        dep.watch(() => {
            hv.s(fn());
        });
    }
    return hv;
}

