import {h, Node, ChildNode, Props, ContextMeta} from './dom';
import {component, CustomComponent} from './component';

declare global {
    namespace JSX {
        type Element<P> = Node;
        type IntrinsicElements = {
            [key: string]: any
        };
    }
}

export function jsx<P>(what: string | CustomComponent<P>, props: Props, ...children: Node[]) {
    if (typeof what === 'string') {
        return h(what, props, ...children);
    }
    return component(what, props, ...children);
}

export type JsxFn = typeof jsx;

