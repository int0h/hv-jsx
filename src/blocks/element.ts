import {HyperValue, scopes} from 'hyper-value';
import {FSType} from 'hyper-value/types/scopes/full';
import {hashBlock, hashDict, stringify, hashArray} from '../hash';
import {mergeChildren} from '../merge';

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

export interface RefHandler<T> {
    ({value, name, owner, hs}: {value: T, name: string, owner: HyperElm, hs: FSType}): void;
}

interface RefProps {
    [name: string]: RefHandler<any>;
}

const refProps: RefProps = {};

export class HyperElm extends AbstractElement {
    targetNode: TargetNode;
    tagName: string;
    props: PropsAbstract;
    children: HvNode[];
    childrenHash: string;
    propHash: string;
    private hs = new scopes.FullScope();
    private propHv: HyperValue<PropsAbstract> | null = null;

    constructor (tagName: string, props: PropsAbstract, children: Children) {
        super();
        this.tagName = tagName;
        this.props = props || {};
        this.children = normalizeNodeSet(this.hs, children);
        this.childrenHash = stringify(hashArray(this.children.map(child => child.hash)));
        this.propHash = stringify(hashDict(props));
        this.hash = hashBlock({
            type: 'element',
            tagName: tagName,
            attrs: this.propHash,
            children: this.childrenHash
        });
    }

    private initAttrs(meta: ContextMeta) {
        this.propHv = new HyperValue({});

        this.hs.watch(this.propHv, (newAttrs, oldAttrs) => {
            const diff: PropsAbstract = {};
            for (const name in newAttrs) {
                diff[name] = newAttrs[name];
            }

            for (const name in oldAttrs) {
                if (!(name in newAttrs)) {
                    diff[name] = null;
                }
            }

            for (const name in diff) {
                if (name in refProps) {
                    continue;
                }
                meta.target.setProp(meta.targetMeta, this.targetNode, name, diff[name]);
            }

            for (const name in diff) {
                if (name in refProps) {
                    refProps[name]({
                        name,
                        value: diff[name],
                        hs: this.hs,
                        owner: this
                    });
                }
            }
        });

        this.hs.bind(this.propHv, () => {
            const propObj: PropsAbstract = {};

            for (const name in this.props) {
                propObj[name] = this.hs.read(this.props[name]);
            }

            return propObj;
        });
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

    private mergeProps(meta: ContextMeta, newProps: PropsAbstract) {
        if (!this.propHv) {
            throw new Error('merge before render');
        }

        this.propHv.$ = newProps;
    }

    merge(meta: ContextMeta, newElem: HyperElm): HyperElm {
        if (newElem.hash === this.hash) {
            newElem.targetNodes = this.targetNodes;
            newElem.props = this.props;
            newElem.children = this.children;
            return newElem;
        }

        if (newElem.tagName !== this.tagName) {
            return newElem;
        }

        newElem.targetNode = this.targetNode;
        newElem.targetNodes = this.targetNodes;
        newElem.propHv = this.propHv;

        if (newElem.propHash !== this.propHash) {
            this.mergeProps(meta, newElem.props);
        }

        if (newElem.childrenHash !== this.childrenHash) {
            mergeChildren(meta, this.children, newElem.children);
        }

        return newElem;
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
        this.initAttrs(selfMeta);
        this.setChildren(selfMeta, nestedMeta);
        this.targetNodes = [this.targetNode];
        return this.targetNodes;
    }

    free() {
        this.hs.free();
        this.children.forEach(child => child.free());
    }
}


export function registerGlobalProp<T>(matcher: string, handler: RefHandler<T>) {
    refProps[matcher] = handler;
}

registerGlobalProp('ref', ({owner, value}) => {
    (value as Ref)(owner);
});
