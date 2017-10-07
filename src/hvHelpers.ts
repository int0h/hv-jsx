import {HyperValue, $hv, $autoHv, $hc} from './hv';

type IterationFunc<T, R> = (value: T, index: number) => R | HyperValue<R>;
type IterationFuncStrict<T, R> = (value: HyperValue<T>, index: number) => R;
type ReduceFunc<T> = (acc: any, value: T, index: number) => any;

function injectGet<T, R>(fn: IterationFunc<T, R>): IterationFuncStrict<T, R> {
    return function(hv: HyperValue<T>, index) {
        let result = fn(hv.g(), index);
        if (result instanceof HyperValue) {
            result = result.g();
        }
        return result;
    };
}

export class HvArray<T> extends HyperValue<HyperValue<T>[]> {

    constructor (sourceArray: HyperValue<T>[]) {
        super(sourceArray);
    }

    static fromHv<T>(hv: HyperValue<HyperValue<T>[]>): HvArray<T> {
        let hvArray = new HvArray<T>([]);
        hvArray.bind([hv], () => hv.g());
        return hvArray;
    }

    private getItems(): T[] {
        return this.g().map(item => item.g());
    }

    getLength (): HyperValue<number> {
        return $autoHv(() => {
            return this.g().length
        });
    }

    // mutators:

    private applyMutatorMethod(name: string, args: any[]): any {
        let listCopy = this.g();
        const result = (listCopy as any)[name].apply(listCopy, args);
        this.s(listCopy);
        return result;
    }

    pop(): HyperValue<T> {
        return this.applyMutatorMethod('pop', []);
    }

    push(...items: HyperValue<T>[]): number {
        return this.applyMutatorMethod('push', items);
    }

    reverse(): HyperValue<T>[] {
        return this.applyMutatorMethod('reverse', []);
    }

    shift(): HyperValue<T> {
        return this.applyMutatorMethod('shift', []);
    }

    unshift(...items: HyperValue<T>[]): number {
        return this.applyMutatorMethod('unshift', items);
    }

    splice(start: number, deleteCount?: number, ...items: HyperValue<T>[]): HvArray<T> {
        return this.applyMutatorMethod('unshift', [start, deleteCount, ...items]);
    }

    // accessors:

    concat(hvArray: HvArray<T> | HyperValue<T>[]): HvArray<T> {
        if (!(hvArray instanceof HvArray)) {
            hvArray = new HvArray(hvArray);
        }
        const newHv = new HvArray<T>([]);
        newHv.bind([hvArray], ([hvArray]) => {
            return this.g().concat(hvArray.g());
        });
        newHv.calc();
        return newHv;
    }

    slice(start?: number | HyperValue<number>, end?: number | HyperValue<number>): HvArray<T> {
        if (!(start instanceof HyperValue)) {
            start = $hv(start);
        }
        if (!(end instanceof HyperValue)) {
            end = $hv(end);
        }
        const newHv = new HvArray<T>([]);
        newHv.bind([this, start, end], ([self, start, end]) => {
            return self.g().slice(start.g(), end.g());
        });
        newHv.calc();
        return newHv;
    }

    // iterators:

    private applyIteratorMethod<R>(name: string, fn: IterationFunc<T, R>, thisArg?: any): any {
        let listCopy = this.g();
        const result = (listCopy as any)[name].call(listCopy, fn, thisArg);
        return result;
    }

    every(fn: IterationFunc<T, boolean>, thisArg?: any): HyperValue<boolean> {
        return $autoHv(() => this.g().every(injectGet(fn), thisArg));
    }

    some(fn: IterationFunc<T, boolean>, thisArg?: any): HyperValue<boolean> {
        return $autoHv(() => this.g().some(injectGet(fn), thisArg));
    }

    filter(fn: IterationFunc<T, boolean>, thisArg?: any): HvArray<T> {
        const hv = $autoHv(() => this.g().filter(injectGet(fn), thisArg));
        return HvArray.fromHv(hv);
    }

    map<R>(fn: IterationFunc<T, R>, thisArg?: any): HyperValue<R[]> {
        return $autoHv(() => this.g().map(injectGet(fn), thisArg));
    }

    reduce(fn: ReduceFunc<T>, initialValue?: any): HyperValue<any> {
        return $autoHv(() => {
            return this.g().reduce((acc, curHv, index) => {
                const val = curHv.g();
                return fn(acc, val, index);
            }, initialValue);
        });
    }

    find(fn: IterationFunc<T, boolean>, thisArg?: any): HyperValue<T> {
        return $autoHv(() => this.g().find(injectGet(fn), thisArg).g());
    }

    findIndex(fn: IterationFunc<T, boolean>, thisArg?: any): HyperValue<number> {
        return $autoHv(() => this.g().findIndex(injectGet(fn), thisArg));
    }

}
