import {HyperValue, hvAuto} from 'hv';
import {PropsAbstract, normalizeNode, ZoneResult, HvNode, ContextMeta, HyperZone} from './dom';
import {DomNode, setAttr} from './domHelpers';
import {flatArray} from './utils';
import {DomEventEmitter, DomEventHandler} from './events';

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
    dom: DomNode;
    hv: HyperValue<ZoneResult>;
    children: HvNode[];
    props: P;
    id: number;
    domEe: DomEventEmitter;

    constructor (props: P, children: (HvNode | string)[]) {
        children = flatArray(children);
        this.children = children.map(child => normalizeNode(child));
        this.props = props;
        this.id = componentTable.length;
        componentTable.push(this);
        this.domEe = new DomEventEmitter();
        this.init();
    }

    init() {};

    renderDom(meta: ContextMeta): DomNode {
        const domHv = hvAuto(() => this.render());
        const domZone = new HyperZone(domHv);
        this.dom = domZone.renderDom({
            ns: meta.ns,
            mapAttrs: injectId(this.id)
        });
        setAttr(this.dom as Element, 'data-hv-comp-id', this.id, meta.ns);
        return this.dom;
    }

    getDom(): DomNode {
        return this.dom;
    }

    on(eventType: string, targetId: string, handler: DomEventHandler) {
        this.domEe.listen(eventType, targetId, handler);

    }

    abstract render(): HvNode;

    // private static getId() {
    //     if (this.id) {
    //         return this.id;
    //     }
    //     this.id = componentClassTable.length;
    //     componentClassTable.push(this);
    // }
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

export function closestComponent<T extends Component<any>>(dom: DomNode): T | null {
    let elem = (dom as HTMLElement | null);
    while (true) {
        if (!elem) {
            return null;
        }
        const id = elem.dataset && elem.dataset.hvCompId;
        if (id !== undefined) {
            return componentTable[Number(id)] as T;
        }
        elem = elem.parentElement;
    }
}
