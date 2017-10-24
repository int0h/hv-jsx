import {HyperValue} from 'hv';
import {DomNode, XmlNamespace} from '../domHelpers';
import {Dict} from '../utils';
import {HyperElm} from './element';
import {StringElm} from './literal';
import {HyperZone} from './zone';

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

export interface Ref {
    (elm: HyperElm): void;
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
