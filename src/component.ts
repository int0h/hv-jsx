import {HyperValue} from './hv';
import {PropsAbstract, normalizeNode, ZoneResult, Node, ContextMeta} from './dom';
import {DomNode} from './domHelpers';
import {jsx, bindMeta, JsxFn} from './jsx';
import {flatArray} from './utils';

let componentClassTable: typeof Component[] = [];

function injectId(id: string) {
    return (attrs: PropsAbstract) => {
        if (!('id' in attrs)) {
            return attrs;
        }
        let classes = attrs.class
            ? attrs.class.split(' ')
            : [];
        classes.push('foo');
        const newAttrs: PropsAbstract = {
            ...attrs,
            class: classes.join(' ')
        };
        delete newAttrs.id;
        return newAttrs;
    }
}

export abstract class Component {
    hv: HyperValue<ZoneResult>;
    children: Node[];
    props: PropsAbstract;
    static id: number;

    constructor (props: PropsAbstract, children: (Node | string)[]) {
        children = flatArray(children);
        this.children = children.map(child => normalizeNode(child));
        this.props = props;
    }

    getDom(): DomNode {
        const localJsx = bindMeta({
            mapAttrs: injectId('')
        });
        const rendered = this.render(localJsx);
        return rendered.getDom();
    }

    abstract render(jsx: JsxFn): Node;

    private static getId() {
        if (this.id) {
            return this.id;
        }
        this.id = componentClassTable.length;
        componentClassTable.push(this);
    }
}

export type CustomComponent = {
    new (props: PropsAbstract, children: (Node | string)[]): Component;
}

export function component(
    meta: ContextMeta,
    componentClass: CustomComponent,
    props: PropsAbstract,
    ...children: (Node | string)[]
) {
    return new componentClass(props, children);
}
