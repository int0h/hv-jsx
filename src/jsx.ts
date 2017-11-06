import {HvNode, Props, Ref, Children} from './blocks/abstract';
import {HyperElm} from './blocks/element';
import {CustomComponent, Component} from './blocks/component';
// import {HyperStyle} from './style';

declare global {
    namespace JSX {
        type Element<P> = HvNode;
        interface ElementClass<P> {
            render: () => Children;
        }
        interface ElementAttributesProperty {
            props: any;
        }
        interface IntrinsicElements {
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

    return new what(props, children);
}

export type JsxFn = typeof jsx;

