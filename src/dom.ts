import {HyperValue, hvWrap} from 'hv';
import {DomNode, appendChild, replaceDom, createElm, guessNs, setAttr, XmlNamespace} from './domHelpers';
import {flatArray, Dict} from './utils';

export type Props = Dict<any>;

export type PropType = HyperValue<any> | any;

export type PropsAbstract = Dict<any>;

export type HvNode = AbstractElement;

export type ChildNode = HvNode | string | number | HyperValue<HvNode | string | number>;

export interface ContextMeta {
    mapAttrs?: (attrs: PropsAbstract) => PropsAbstract;
    ns: XmlNamespace;
}

export interface AbstractElement {
    getDom(): DomNode;
    renderDom(meta: ContextMeta): DomNode;
}

export class HyperElm implements AbstractElement {
    elm: Element;
    tagName: string;
    props: PropsAbstract;
    children: ChildNode[];

    constructor (tagName: string, props: PropsAbstract, children: ChildNode[]) {
        this.tagName = tagName;
        this.props = props || {};
        this.children = children;
    }

    private setAttrs(meta: ContextMeta) {
        let props = this.props;
        if (meta.mapAttrs) {
            props = meta.mapAttrs(props);
        }
        for (let name in props) {
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

    renderDom(meta: ContextMeta) {
        const ns = guessNs(this.tagName, meta.ns);
        meta = {...meta, ns};
        this.elm = createElm(ns, this.tagName);
        this.setAttrs(meta);
        this.setChildren(meta);
        return this.elm;
    }

    getDom(): DomNode {
        return this.elm;
    }
}

export class StringElm implements AbstractElement {
    text: string;
    node: Text;

    constructor (text: string) {
        this.text = text;
    }

    renderDom(meta: ContextMeta) {
        this.node = document.createTextNode(this.text);
        return this.node;
    }

    getDom(): DomNode {
        return this.node;
    }
}

export type ZoneResult = HvNode | string | number;

export class HyperZone implements AbstractElement {
    content: HyperValue<HvNode>;
    dom: DomNode;

    constructor (content: HyperValue<ZoneResult>) {
        this.content = hvWrap(content, normalizeNode);
    }

    renderDom(meta: ContextMeta): DomNode {
        this.content.watch((newElm, oldElm) => {
            replaceDom(render(newElm, meta), oldElm.getDom());
        })
        this.dom = render(this.content.g(), meta);
        return this.dom;
    }

    getDom(): DomNode {
        return this.dom;
    }
}

export function normalizeNode(child: ChildNode): HvNode {
    if (child === null) {
        const scriptNode = new HyperElm('script', {}, []);
        return scriptNode;
    }
    if (typeof child === 'string') {
        return new StringElm(child);
    }
    if (typeof child === 'number') {
        return new StringElm(String(child));
    }
    if (child instanceof HyperValue) {
        return new HyperZone(child);
    }
    return child;
}

export function getDom(node: HvNode) {
    return node.getDom();
}

export function render(node: HvNode, meta: ContextMeta) {
    return node.renderDom(meta);
}

export function h(tagName: string, props: Dict<any>, ...children: (HvNode | string)[]): HyperElm {
    return new HyperElm(tagName, props, children);
}
