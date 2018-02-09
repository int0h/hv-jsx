const uniqObjects = new WeakMap();
let currentId = 0;

export type HashResult = boolean | number | string | {null: true} | {undefined: true} | {o: number};

export function hash(obj: any): HashResult {
    if (obj === null || obj === undefined) {
        return {[String(obj)]: true} as HashResult;
    }
    if (
        typeof obj === 'boolean' ||
        typeof obj === 'string' ||
        typeof obj === 'number'
    ) {
        return obj;
    }
    const cached = uniqObjects.get(obj);
    if (cached !== undefined) {
        return cached;
    }
    const id = currentId;
    currentId++;
    const result = {o: id};
    uniqObjects.set(obj, result);
    return result;
}

export function stringify(hr: HashResult | any): string {
    return JSON.stringify(hr);
}

export function hashDict(obj: {[key: string]: any}): {[key: string]: HashResult} {
    const res: any = {};
    const keys = Object.keys(obj).sort();
    for (const name of keys) {
        res[name] = hash(obj[name]);
    }
    return res;
}

export function hashArray(arr: any[]): HashResult[] {
    return arr.map(item => hash(item));
}

export interface HashParams {
    type: string;
    [key: string]: HashResult | {[key: string]: HashResult} | HashResult[];
}

export function hashBlock(params: HashParams): string {
    return JSON.stringify(params);
}
