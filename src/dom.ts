import {HyperValue, hvMake, hvAuto, wrapHv} from 'hv';
import {DomNode, appendChild, replaceDom} from './domHelpers';
import {flatArray, Dict} from './utils';

export type Props = Dict<any> | null;

export type PropType = HyperValue<any> | any;

export type PropsAbstract = Dict<any>;

export type Node = StringElm | HyperElm | HyperZone;

export type ChildNode = Node | string | number | HyperValue<Node | string | number>;

export interface ContextMeta {
    mapAttrs?: (attrs: PropsAbstract) => PropsAbstract;
}

interface AbstractElement {
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
        for (let [name, value] of Object.entries(props)) {
            if (value instanceof HyperValue) {
                value.watch(newValue => {
                    this.elm.setAttribute(name, newValue);
                });
                value = value.g(true);
            }
            this.elm.setAttribute(name, value);
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
        this.elm = document.createElement(this.tagName);
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

export type ZoneResult = Node | string | number;

export class HyperZone implements AbstractElement {
    content: HyperValue<Node>;
    dom: DomNode;

    constructor (content: HyperValue<ZoneResult>) {
        this.content = wrapHv(content, normalizeNode);
    }

    renderDom(meta: ContextMeta): DomNode {
        this.content.watch((newElm, oldElm: Node) => {
            replaceDom(render(newElm, meta), oldElm.getDom());
        })
        this.dom = render(this.content.g(), meta);
        return this.dom;
    }

    getDom(): DomNode {
        return this.dom;
    }
}

export function normalizeNode(child: ChildNode): Node {
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

export function getDom(node: Node) {
    if (node === null) {
        return null;
    }
    return node.getDom();
}

export function render(node: Node, meta: ContextMeta) {
    if (node === null) {
        return null;
    }
    return node.renderDom(meta);
}

export function h(tagName: string, props: Dict<any>, ...children: (Node | string)[]): HyperElm {
    return new HyperElm(tagName, props, children);
}



