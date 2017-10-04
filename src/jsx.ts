import {h, Node, Props, ContextMeta} from './dom';
import {component, CustomComponent} from './component';

declare global {
    namespace JSX {
        type Element<P> = any;
        type IntrinsicElements = {
            [key: string]: any
        };
    }
}

function metaJsx<P>(meta: ContextMeta, what: string | CustomComponent<P>, props: Props, ...children: Node[]) {
    if (typeof what === 'string') {
        return h(meta, what, props, ...children);
    }
    return component(meta, what, props, ...children);
}

export function jsx<P>(what: string | CustomComponent<P>, props: Props, ...children: Node[]) {
    return metaJsx({}, what, props, ...children);
}

export function bindMeta(meta: ContextMeta): typeof jsx {
    return (what: string, props: Props, ...children: Node[]) => {
        return metaJsx(meta, what, props, ...children);;
    }
}

export type JsxFn = typeof jsx;

