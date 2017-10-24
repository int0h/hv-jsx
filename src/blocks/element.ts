import {HyperValue} from 'hv';
import {AbstractElement, ContextMeta, PropsAbstract, Ref, normalizeNode, render, ChildNode} from './common';
import {styleMapper} from '../style';
import {flatArray} from '../utils';
import {DomNode, appendChild, createElm, guessNs, setAttr} from '../domHelpers';

interface RefProps {
    [name: string]: (value: any, target: HyperElm) => void;
};

const refProps: RefProps = {
    style: styleMapper
}


export class HyperElm implements AbstractElement {
    elm: Element;
    tagName: string;
    props: PropsAbstract;
    children: ChildNode[];
    ref: Ref;

    constructor (tagName: string, props: PropsAbstract, children: ChildNode[]) {
        this.tagName = tagName;
        this.props = props || {};
        this.children = children;
    }

    private setAttrs(meta: ContextMeta) {
        let props = this.props;
        if (props.ref) {
            props = {...this.props};
            this.ref = props.ref;
            delete props.ref;
        }
        if (meta.mapAttrs) {
            props = meta.mapAttrs(props);
        }
        for (let name in props) {
            if (name in refProps) {
                continue;
            }
            let value = props[name];
            if (value instanceof HyperValue) {
                value.watch(newValue => {
                    setAttr(this.elm, name, newValue, meta.ns);
                });
                value = value.g(true);
            }
            setAttr(this.elm, name, value, meta.ns);
        }
    }

    private setChildren(meta: ContextMeta) {
        this.children = flatArray(this.children);
        for (let child of this.children) {
            const dom = render(normalizeNode(child), meta);
            appendChild(this.elm, dom);
        }
    }

    private handleRefProps() {
        for (let key in this.props) {
            if (key in refProps) {
                const value = this.props[key];
                refProps[key](value, this);
            }
        }
    }

    renderDom(meta: ContextMeta) {
        const {selfNs, childNs} = guessNs(this.tagName, meta.ns);
        const nestedMeta = {...meta, ns: childNs};
        meta = {...meta, ns: selfNs};
        this.elm = createElm(meta.ns, this.tagName);
        this.setAttrs(meta);
        this.setChildren(nestedMeta);
        this.handleRefProps();
        if (this.ref) {
            this.ref(this);
        }
        return this.elm;
    }

    getDom(): DomNode {
        return this.elm;
    }
}
