import {HvNode, Props, Ref, Children} from './blocks/abstract';
import {HyperElm} from './blocks/element';
import {CustomComponent, Component, isComponentClass, FunctionComponent} from './blocks/component';

declare global {
    namespace JSX {
        interface Element extends HvNode {}

        interface ElementClass<P> {
            render: () => Children;
        }

        interface ElementAttributesProperty {
            props: any;
        }

        interface IntrinsicProps extends GlobalProps {
            ref?: Ref;
        }

        interface IntrinsicElements {
        }

        interface GlobalProps {

        }
    }
}

export function jsx<P extends Props>(what: string | CustomComponent<P> | FunctionComponent<P>, props: P, ...children: HvNode[]): Component<P> | HvNode {
    if (props === null) {
        props = {} as P;
    }

    if (typeof what === 'string') {
        const globalElem = globalElems[what];
        if (globalElem) {
            return jsx(globalElem, props, ...children);
        }
        return new HyperElm(what, props, children);
    }

    if (isComponentClass(what as CustomComponent<P>)) {
        const ComponentClass = what as CustomComponent<P>;
        return new ComponentClass(props, children);
    }

    const fc = what as FunctionComponent<P>;
    return jsx(class FC extends Component<P> {
        render() {
            return fc(this.props, this.children);
        }
    }, props, ...children);
}

export type JsxFn = typeof jsx;

let globalElems: {[key: string]: CustomComponent<any>} = {};

export function registerGlobalElem<N extends keyof JSX.IntrinsicElements>(name: N, comp: CustomComponent<JSX.IntrinsicElements[N]>) {
    globalElems[name] = comp;
}

