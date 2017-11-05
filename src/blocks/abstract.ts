import {HyperValue} from 'hv';
import {Dict} from '../utils';
import {Target} from '../target';

export abstract class AbstractElement {
    targetNodes: TargetNode[];
    abstract targetRender(meta: ContextMeta): TargetNode[];
}

export declare class As<S extends string> {
    private as: S;
}

export type Props = Dict<any>;

export type PropsAbstract = Dict<any>;

export type HvNode = AbstractElement;

export type HvNodeSet = HvNode | HvNode[];

// child types:

export type ChildNodePrimitive = HvNode | string | number;

export interface ChildHvNode extends HyperValue<ChildHvNode | ChildNodePrimitive> {}

export type ChildNode = ChildNodePrimitive | ChildHvNode;

export interface ChildNodeArray extends Array<ChildNode> {}

export type Children = ChildNode | ChildNodeArray | HyperValue<ChildNodeArray>;

// target types:

export type TargetNode = any;

export type TargetMeta = any;

export type TargetPosition = any;

export type TargetData = {
    compId?: number;
};

export type TargetMock = Target<TargetNode, TargetMeta, TargetPosition, TargetData>;

// etc:

export interface ContextMeta {
    mapAttrs?: (attrs: PropsAbstract) => PropsAbstract;
    targetMeta: TargetMeta;
    target: TargetMock;
}

export interface Ref {
    (elm: AbstractElement): void;
}
