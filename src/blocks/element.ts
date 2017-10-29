import {HyperValue} from 'hv';

import {
    normalizeNode,
    render
} from './common';

import {
    AbstractElement,
    ContextMeta,
    PropsAbstract,
    Ref,
    ChildNode,
    TargetNode
} from './common';

import {flatArray} from '../utils';

interface RefProps {
    [name: string]: (value: any, target: HyperElm) => void;
};

const refProps: RefProps = {
}

export class HyperElm implements AbstractElement {
    tagName: string;
    props: PropsAbstract;
    children: ChildNode[];
    ref: Ref;
    targetNode: TargetNode;

    constructor (tagName: string, props: PropsAbstract, children: ChildNode[]) {
        this.tagName = tagName;
        this.props = props || {};
        this.children = children;
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
                value.watch(newValue => {
                    t.setProp(meta.targetMeta, this.targetNode, name, newValue);
                });
                value = value.g(true);
            }
            t.setProp(meta.targetMeta, this.targetNode, name, value);
        }
    }

    private setChildren(meta: ContextMeta, nestedMeta: ContextMeta) {
        const t = meta.target;
        this.children = flatArray(this.children);
        for (let child of this.children) {
            const elem = render(normalizeNode(child), nestedMeta);
            t.append(meta.targetMeta, nestedMeta.targetMeta, this.targetNode, elem);
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

    targetRender(meta: ContextMeta): TargetNode {
        const t = meta.target;
        const [elem, nestedTargetMeta] = t.create(meta.targetMeta, this.tagName);
        const nestedMeta = {
            ...meta,
            targetMeta: nestedTargetMeta
        };

        this.targetNode = elem;
        this.setAttrs(meta);
        this.setChildren(meta, nestedMeta);
        this.handleRefProps();
        if (this.ref) {
            this.ref(this);
        }
        return this.targetNode;
    }
}
