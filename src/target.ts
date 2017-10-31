export interface Target<T, M, P, D> {
    create: (meta: M, type: string) => [T, M];
    append: (meta: M, parentMeta: M, parent: T, child: T) => void;
    // insert: (meta: M, parentMeta: M, parent: T, child: T, position?: P) => void;
    // remove: (meta: M, elem: T) => void;
    setProp: (meta: M, elem: T, propPath: string, value: any) => void;
    // listen: (meta: M, elem: T, eventType: string, handler: Function) => void;
    // getPosition: (meta: M, parent: T, elem: T) => P;
    replace: (meta: M, oldElem: T, newElem: T) => void;
    createTextNode: (meta: M, text: string) => T;
    createPlaceholder: (meta: M) => T;
    setData: (meta: M, elem: T, data: D) => void;
    getData: (meta: M, elem: T) => D;
    closest: (meta: M, from: T, matcher: (elem: T) => boolean) => T;
}
