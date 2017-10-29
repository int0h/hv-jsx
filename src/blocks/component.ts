import {HyperValue, hvAuto} from 'hv';
import {PropsAbstract, normalizeNode, HvNode, ContextMeta, TargetNode, TargetMock, TargetMeta, TargetData} from './common';
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

export abstract class Component<P extends PropsAbstract> {
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

    renderTarget(meta: ContextMeta): TargetNode {
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

export function component<P>(
    componentClass: CustomComponent<P>,
    props: P,
    ...children: (HvNode | string)[]
) {
    return new componentClass(props, children);
}

export function closestComponent<T extends Component<any>>(meta: TargetMeta, target: TargetMock, node: TargetNode): T | null {
    const found = target.closest(meta, node, node => {
        const data = target.getData(meta, node);
        return data.compId !== undefined;
    });

    if (!found) {
        return null;
    }

    const id = target.getData(meta, found).compId;
    return componentTable[Number(id)] as T;
}
