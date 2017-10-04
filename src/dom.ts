import {HyperValue, $hv, $autoHv, noRecord} from './hv';
import {DomNode, appendChild, replaceDom} from './domHelpers';
import {flatArray} from './utils';

type Elm = {
    name: string;
}

interface Dict<T> {
    [key: string]: T;
}

export type Props = Dict<any> | null;

export type PropType = HyperValue<any> | any;

export type PropsAbstract = Dict<any>;

export type Node = StringElm | HyperElm | HyperZone;

export type ChildNode = Node | string;

export interface ContextMeta {
    mapAttrs?: (attrs: PropsAbstract) => PropsAbstract;
}

interface AbstractElement {
    getDom(): DomNode;
}

export class HyperElm implements AbstractElement {
    elm: Element;

    constructor (meta: ContextMeta, tagName: string, props: PropsAbstract, children: ChildNode[]) {
        this.elm = document.createElement(tagName);
        props = props || {};
        if (meta.mapAttrs) {
            props = meta.mapAttrs(props);
        }
        for (let [name, value] of Object.entries(props)) {
            if (value instanceof HyperValue) {
                value.watch(newValue => {
                    this.elm.setAttribute(name, newValue);
                });
                noRecord(() => {
                    value = value.g()
                });
            }
            this.elm.setAttribute(name, value);
        }
        children = flatArray(children);
        for (let child of children) {
            const dom = getDom(normalizeNode(child));
            appendChild(this.elm, dom);
        }
    }

    getDom(): DomNode {
        return this.elm;
    }
}

export class StringElm implements AbstractElement {
    node: Text;

    constructor (text: string) {
        this.node = document.createTextNode(text);
    }

    getDom(): DomNode {
        return this.node;
    }
}

export type ZoneResult = Node | string;

export class HyperZone implements AbstractElement {
    hv: HyperValue<ZoneResult>;

    constructor (content: () => ZoneResult) {
        const notNullableContent = () => {
            const res: ZoneResult = content();
            return normalizeNode(res);
        }
        this.hv = $autoHv(notNullableContent);
        this.hv.watch((newElm, oldElm: Node) => {
            replaceDom(getDom(normalizeNode(newElm)), oldElm.getDom());
        })
    }

    getDom(): DomNode {
        return getDom(normalizeNode(this.hv.g()));
    }
}

export function normalizeNode(child: ChildNode): Node {
    if (child === null) {
        const scriptNode = new HyperElm({}, 'script', {}, []);
        return scriptNode;
    }
    if (typeof child === 'string') {
        return new StringElm(child);
    }
    return child;
}

export function getDom(node: Node) {
    if (node === null) {
        return null;
    }
    return node.getDom();
}

export function zone(content: () => ZoneResult): HyperZone {
    return new HyperZone(content);
}

export function h(meta: ContextMeta, tagName: string, props: Dict<any>, ...children: (Node | string)[]): HyperElm {
    return new HyperElm(meta, tagName, props, children);
}



