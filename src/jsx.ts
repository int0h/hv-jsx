import {h, HvNode, Props} from './dom';
import {component, CustomComponent, Component} from './component';

declare global {
    namespace JSX {
        type Element<P> = HvNode;
        interface ElementClass<P> {
            render: () => HvNode;
        }
        interface ElementAttributesProperty {
            props: any;
        }
        type IntrinsicElements = {
            [key: string]: any
        }
    }
}

export function jsx<P extends Props>(what: string | CustomComponent<P>, props: P, ...children: HvNode[]): Component<P> | HvNode {
    if (props === null) {
        props = {} as P;
    }

    if (typeof what === 'string') {
        return h(what, props, ...children);
    }

    return component(what, props, ...children);
}

export type JsxFn = typeof jsx;

