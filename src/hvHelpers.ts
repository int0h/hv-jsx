import {HyperValue, $hv, $autoHv, $hc} from './hv';

type IterationFunc<T, R> = (value: T, index: number, array: T[]) => R;

class HvArray<T> extends HyperValue<HyperValue<T>[]> {

    constructor (sourceArray: HyperValue<T>[]) {
        super();
    }

    private getItems(): T[] {
        return this.g().map(item => item.g());
    }

    get length () {
        return this.g().length;
    }

    set length (newLength: number) {
        throw new Error('not supported');
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

    includes(value: HyperValue<T>, fromIndex?: number): HyperValue<boolean> {
        return $hc([this], () => this.g().includes(value, fromIndex));
    }

    indexOf(value: HyperValue<T>, fromIndex?: number): HyperValue<number> {
        return $hc([this], () => this.g().indexOf(value, fromIndex));
    }

    lastIndexOf(value: HyperValue<T>, fromIndex?: number): HyperValue<number> {
        return $hc([this], () => this.g().lastIndexOf(value, fromIndex));
    }

    slice(start?: number, end?: number): HvArray<T> {
        const newHv = new HvArray<T>([]);
        newHv.bind([this], () => {
            return this.g().slice(start, end);
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

    every(fn: IterationFunc<HyperValue<T>, boolean>, thisArg?: any): HyperValue<boolean> {
        return $autoHv(() => this.g().every(fn, thisArg));
    }

    some(fn: IterationFunc<HyperValue<T>, boolean>, thisArg?: any): HyperValue<boolean> {
        return $autoHv(() => this.g().some(fn, thisArg));
    }

    filter(fn: IterationFunc<HyperValue<T>, boolean>, thisArg?: any): HvArray<T> {
        const filtred = this.g().filter(fn, thisArg);
        return new HvArray(filtred);
    }



}
