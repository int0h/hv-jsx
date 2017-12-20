import {HyperValue, scopes} from 'hv';

import {
    normalizeNodeSet
} from './common';

import {
    AbstractElement,
    ContextMeta,
    PropsAbstract,
    Ref,
    HvNode,
    Children,
    TargetNode
} from './abstract';

interface RefProps {
    [name: string]: (value: any, target: HyperElm) => void;
}

const refProps: RefProps = {};

export class HyperElm extends AbstractElement {
    targetNode: TargetNode;
    targetNodes: TargetNode[];
    tagName: string;
    props: PropsAbstract;
    children: HvNode[];
    ref: Ref;
    private hs = new scopes.FullScope();

    constructor (tagName: string, props: PropsAbstract, children: Children) {
        super();
        this.tagName = tagName;
        this.props = props || {};
        this.children = normalizeNodeSet(this.hs, children);
    }

    private setAttrs(meta: ContextMeta) {
        const t = meta.target;
        let props = this.props;
        if (props.ref) {
            props = {...this.props};
            this.ref = props.ref;
            delete props.ref;
        }
        if (meta.mapAttrs) {
            props = meta.mapAttrs(props);
        }
        for (let name in props) {
            if (name in refProps) {
                continue;
            }
            let value = props[name];
            if (value instanceof HyperValue) {
                this.hs.watch(value, newValue => {
                    t.setProp(meta.targetMeta, this.targetNode, name, newValue);
                });
                value = value.g(true);
            }
            t.setProp(meta.targetMeta, this.targetNode, name, value);
        }
    }

    private setChildren(meta: ContextMeta, nestedMeta: ContextMeta) {
        const t = meta.target;
        for (let child of this.children) {
            const elems = child.targetRender(meta);
            for (let elem of elems) {
                t.append(meta.targetMeta, nestedMeta.targetMeta, this.targetNode, elem);
            }
        }
    }

    private handleRefProps() {
        for (let key in this.props) {
            if (key in refProps) {
                const value = this.props[key];
                refProps[key](value, this);
            }
        }
    }

    targetRender(meta: ContextMeta): TargetNode[] {
        const t = meta.target;
        const [
            elem,
            selfTargetMeta,
            nestedTargetMeta
        ] = t.create(meta.targetMeta, this.tagName);
        const nestedMeta = {
            ...meta,
            targetMeta: nestedTargetMeta
        };
        const selfMeta = {
            ...meta,
            targetMeta: selfTargetMeta
        };
        this.targetNode = elem;
        this.setAttrs(selfMeta);
        this.setChildren(selfMeta, nestedMeta);
        this.handleRefProps();
        if (this.ref) {
            this.ref(this);
        }
        this.targetNodes = [this.targetNode];
        return this.targetNodes;
    }

    free() {
        this.hs.free();
        this.children.forEach(child => child.free());
    }
}
