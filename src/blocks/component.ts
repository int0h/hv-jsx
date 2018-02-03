import {HyperValue, scopes} from 'hv';
import {FSType} from 'hv/types/scopes/full';

import {renderDebug} from '../debug';

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

import {
    normalizeNodeSet,
} from './common';

import {HyperZone} from './zone';

export let componentTable: Component<any>[] = [];

export interface FunctionComponent<P extends PropsAbstract> {
    (props: P, children: Children): Children;
}

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
    static hvComponent = true;

    targetNodes: TargetNode[];
    private renderHs: FSType = new scopes.FullScope();
    hs: FSType = new scopes.FullScope();
    hv: HyperValue<Children>;
    children: HvNode[];
    props: P;
    id: number;
    // domEe: DomEventEmitter;

    constructor (props: P, children: Children) {
        super();
        this.children = normalizeNodeSet(this.hs, children);
        this.props = props;
        this.id = componentTable.length;
        componentTable.push(this);
        // this.domEe = new DomEventEmitter();
    }

    init() {}

    free() {
        this.hs.free();
        this.children.forEach(child => child.free());
    }

    private mockHs<T>(fn: () => T): T {
        this.renderHs.free();
        this.renderHs = new scopes.FullScope();
        const hsBackup = this.hs;
        this.hs = this.renderHs;
        const result = fn();
        this.hs = hsBackup;
        return result;
    }

    @renderDebug
    targetRender(meta: ContextMeta): TargetNode[] {
        this.init();
        const t = meta.target;
        const domHv = this.hs.auto(() => {
            return this.mockHs(() => this.render());
        });
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

export function isComponentClass(fn: CustomComponent<any>): boolean {
    return (fn as any).hvComponent === true;
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
