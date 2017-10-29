import {HyperValue} from 'hv';
import {Dict} from '../utils';
import {HyperElm} from './element';
import {StringElm} from './string';
import {HyperZone} from './zone';
import {PlaceholderElm} from './placeholder';
import {Target} from '../target';

export declare class As<S extends string> {
    private as: S;
}

export type Props = Dict<any>;

export type PropType = HyperValue<any> | any;

export type PropsAbstract = Dict<any>;

export type HvNode = AbstractElement;

export type ChildNode = HvNode | string | number | HyperValue<HvNode | string | number>;

export type TargetNode = {} & As<'target-node'>;

export type TargetMeta = {} & As<'target-meta'>;

export type TargetPosition = {} & As<'target-position'>;

export type TargetData = As<'target-position'> & {
    compId?: number;
};

export type TargetMock = Target<TargetNode, TargetMeta, TargetPosition, TargetData>;

export interface ContextMeta {
    mapAttrs?: (attrs: PropsAbstract) => PropsAbstract;
    targetMeta: TargetMeta;
    target: TargetMock;
}

export interface AbstractElement {
    targetNode: TargetNode;
    targetRender(meta: ContextMeta): TargetNode;
}

export interface Ref {
    (elm: HyperElm): void;
}

export function normalizeNode(child: ChildNode): HvNode {
    if (child === null) {
        return new PlaceholderElm();
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

export function render(node: HvNode, meta: ContextMeta) {
    return node.targetRender(meta);
}
