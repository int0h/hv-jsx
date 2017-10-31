export function flatArray(arr: any[]): any[] {
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
