import {HyperValue, hvAuto} from 'hv';

import {
    normalizeNode,

    PropsAbstract,
    HvNode,
    ContextMeta,
    TargetNode,
    TargetMock,
    TargetMeta,
    TargetData,
    AbstractElement
} from './common';

import {ZoneResult, HyperZone} from './zone';
import {flatArray} from '../utils';

export let componentTable: Component<any>[] = [];

function injectId(id: number) {
    return (attrs: PropsAbstract) => {
        if (!('id' in attrs)) {
            return attrs;
        }
        const newAttrs: PropsAbstract = {
            ...attrs,
            'data-hv-id': id + ':' + attrs.id
        };
        // todo consider me
        // delete newAttrs.id;
        return newAttrs;
    }
}

export abstract class Component<P extends PropsAbstract> implements AbstractElement {
    targetNode: TargetNode;
    hv: HyperValue<ZoneResult>;
    children: HvNode[];
    props: P;
    id: number;
    // domEe: DomEventEmitter;

    constructor (props: P, children: (HvNode | string)[]) {
        children = flatArray(children);
        this.children = children.map(child => normalizeNode(child));
        this.props = props;
        this.id = componentTable.length;
        componentTable.push(this);
        // this.domEe = new DomEventEmitter();
        this.init();
    }

    init() {};

    targetRender(meta: ContextMeta): TargetNode {
        const t = meta.target;
        const domHv = hvAuto(() => this.render());
        const domZone = new HyperZone(domHv);
        this.targetNode = domZone.targetRender({
            ...meta,
            mapAttrs: injectId(this.id)
        });
        t.setData(meta.targetMeta, this.targetNode, {
            compId: this.id
        } as TargetData);
        return this.targetNode;
    }

    // on(eventType: string, targetId: string, handler: DomEventHandler) {
    //     this.domEe.listen(eventType, targetId, handler);

    // }

    abstract render(): HvNode;
}

export type CustomComponent<P> = {
    new (props: PropsAbstract, children: (HvNode | string)[]): Component<P>;
}

export function closestComponent<T extends Component<any>>(targetMeta: TargetMeta, target: TargetMock, node: TargetNode): T | null {
    const found = target.closest(targetMeta, node, node => {
        const data = target.getData(targetMeta, node);
        return data.compId !== undefined;
    });

    if (!found) {
        return null;
    }

    const id = target.getData(targetMeta, found).compId;
    return componentTable[Number(id)] as T;
}
