import {HyperValue} from './hv';
import {PropsAbstract, normalizeNode, ZoneResult, Node, ContextMeta} from './dom';
import {DomNode} from './domHelpers';
import {jsx, bindMeta, JsxFn} from './jsx';
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

    getDom(): DomNode {
        const localJsx = bindMeta({
            mapAttrs: injectId(this.id)
        });
        const rendered = this.render(localJsx);
        return rendered.getDom();
    }

    on(eventType: string, targetId: string, handler: DomEventHandler) {
        this.domEe.listen(eventType, targetId, handler);

    }

    abstract render(jsx: JsxFn): Node;

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
    meta: ContextMeta,
    componentClass: CustomComponent<P>,
    props: P,
    ...children: (Node | string)[]
) {
    return new componentClass(props, children);
}
