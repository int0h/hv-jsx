import {HyperValue} from 'hv';
import {PropsAbstract, normalizeNode, ZoneResult, Node, ContextMeta} from './dom';
import {DomNode} from './domHelpers';
import {jsx, JsxFn} from './jsx';
import {flatArray} from './utils';
import {DomEventEmitter, DomEventHandler} from './events';

let componentClassTable: typeof Component[] = [];
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
        delete newAttrs.id;
        return newAttrs;
    }
}

export abstract class Component<P extends PropsAbstract> {
    dom: DomNode;
    hv: HyperValue<ZoneResult>;
    children: Node[];
    props: P;
    id: number;
    domEe: DomEventEmitter;

    constructor (props: P, children: (Node | string)[]) {
        children = flatArray(children);
        this.children = children.map(child => normalizeNode(child));
        this.props = props;
        this.id = componentTable.length;
        componentTable.push(this);
        this.domEe = new DomEventEmitter();
        this.init();
    }

    init() {};

    renderDom(): DomNode {
        this.dom = this.render().renderDom({
            mapAttrs: injectId(this.id)
        });
        return this.dom;
    }

    getDom(): DomNode {
        return this.dom;
    }

    on(eventType: string, targetId: string, handler: DomEventHandler) {
        this.domEe.listen(eventType, targetId, handler);

    }

    abstract render(): Node;

    // private static getId() {
    //     if (this.id) {
    //         return this.id;
    //     }
    //     this.id = componentClassTable.length;
    //     componentClassTable.push(this);
    // }
}

export type CustomComponent<P> = {
    new (props: PropsAbstract, children: (Node | string)[]): Component<P>;
}

export function component<P>(
    componentClass: CustomComponent<P>,
    props: P,
    ...children: (Node | string)[]
) {
    return new componentClass(props, children);
}
