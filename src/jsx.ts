import {h, Node, Props} from './dom';

declare global {
    namespace JSX {
        type Element<P> = any;
        type IntrinsicElements = {
            [key: string]: any
        };
    }
}

export function jsx(what: string, props: Props, ...children: Node[]) {
    return h(what, props, ...children);
}
