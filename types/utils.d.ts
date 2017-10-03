export interface Dict<T> {
    [key: string]: T;
}
export declare function most<T>(array: T[], fn: (value: T, id: number) => number): [T | null, number];
export declare function spaceArray<T, Stuff>(array: T[], fillWith: Stuff): (T | Stuff)[];
export interface LaterFn {
    (...args: any[]): any;
    resolve: ((impl: (...args: any[]) => any) => any);
}
export declare function later(): LaterFn;
