import {hvAuto} from 'hv';
import {HvNode, Props, Ref, Children} from './blocks/abstract';
import {HyperElm} from './blocks/element';
import {CustomComponent, Component, isComponentClass, FunctionComponent} from './blocks/component';
import {HyperZone} from './blocks/zone';

declare global {
    namespace JSX {
        type Element = Children;

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

export function jsx<P extends Props>(what: string | CustomComponent<P> | FunctionComponent<P>, props: P, ...children: HvNode[]): Component<P> | HvNode {
    if (props === null) {
        props = {} as P;
    }

    if (typeof what === 'string') {
        return new HyperElm(what, props, children);
    }

    if (isComponentClass(what as CustomComponent<P>)) {
        const ComponentClass = what as CustomComponent<P>;
        return new ComponentClass(props, children);
    }

    const fc = what as FunctionComponent<P>;
    return new HyperZone(hvAuto(() => fc(props, children)));
}

export type JsxFn = typeof jsx;

