import {HyperValue, hvAuto} from 'hv';

import {
    normalizeNodeSet,
} from './common';

import {
    PropsAbstract,
    HvNode,
    ContextMeta,
    TargetNode,
    TargetMock,
    TargetMeta,
    AbstractElement,
    Children
} from './abstract';

import {HyperZone} from './zone';

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
    };
}

export abstract class Component<P extends PropsAbstract> extends AbstractElement {
    targetNodes: TargetNode[];
    hv: HyperValue<Children>;
    children: HvNode[];
    props: P;
    id: number;
    // domEe: DomEventEmitter;

    constructor (props: P, children: Children) {
        super();
        this.children = normalizeNodeSet(children);
        this.props = props;
        this.id = componentTable.length;
        componentTable.push(this);
        // this.domEe = new DomEventEmitter();
        this.init();
    }

    init() {}

    targetRender(meta: ContextMeta): TargetNode[] {
        const t = meta.target;
        const domHv = hvAuto(() => this.render());
        const domZone = new HyperZone(domHv);
        this.targetNodes = domZone.targetRender({
            ...meta,
            mapAttrs: injectId(this.id)
        });
        for (let elem of this.targetNodes) {
            t.setData(meta.targetMeta, elem, {
                compId: this.id
            });
        }
        return this.targetNodes;
    }

    // on(eventType: string, targetId: string, handler: DomEventHandler) {
    //     this.domEe.listen(eventType, targetId, handler);

    // }

    abstract render(): Children;
}

export type CustomComponent<P> = {
    new (props: PropsAbstract, children: (HvNode | string)[]): Component<P>;
};

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
