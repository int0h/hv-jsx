export interface NestedArray<T> extends Array<T | NestedArray<T>> {}

export function flatArray<T>(arr: NestedArray<T>): T[] {
    let res: any[] = [];
    arr.forEach(item => {
        if (!Array.isArray(item)) {
            res.push(item);
            return;
        }
        res = res.concat(flatArray(item));
    });
    return res;
}

export interface Dict<T> {
    [key: string]: T;
}
