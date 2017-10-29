import {HvNode, Props, Ref} from './blocks/common';
import {HyperElm} from './blocks/element';
import {component, CustomComponent, Component} from './blocks/component';
// import {HyperStyle} from './style';

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
            [key: string]: {
                [name: string]: any;
                // style?: HyperStyle;
                ref?: Ref;
            };
        }
    }
}

export function jsx<P extends Props>(what: string | CustomComponent<P>, props: P, ...children: HvNode[]): Component<P> | HvNode {
    if (props === null) {
        props = {} as P;
    }

    if (typeof what === 'string') {
        return new HyperElm(what, props, children);
    }

    return component(what, props, ...children);
}

export type JsxFn = typeof jsx;

