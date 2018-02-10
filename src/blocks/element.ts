import {HyperValue, scopes} from 'hv';
import {FSType} from 'hv/types/scopes/full';
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

export type RefPropPattern = RegExp;

export const refPropPatterns = [] as Array<{
    matcher: RefPropPattern;
    handler: RefHandler<any>;
}>;

function patternMatch(matcher: RefPropPattern, str: string): boolean {
    return matcher.test(str);
}

export class HyperElm extends AbstractElement {
    targetNode: TargetNode;
    tagName: string;
    props: PropsAbstract;
    children: HvNode[];
    ref?: Ref;
    childrenHash: string;
    propHash: string;
    private hs = new scopes.FullScope();
    private propWatchers: {[k: string]: number} = {};

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

    private setAttr(meta: ContextMeta, name: string, value: any) {
        const t = meta.target;
        const isPatternProp = refPropPatterns
            .some(({matcher}) => patternMatch(matcher, name));

        if (name in refProps || isPatternProp) {
            return;
        }

        if (value instanceof HyperValue) {
            this.propWatchers[name] = this.hs.watch(value, newValue => {
                t.setProp(meta.targetMeta, this.targetNode, name, newValue);
            });
            value = value.g(true);
        }

        t.setProp(meta.targetMeta, this.targetNode, name, value);
    }

    private delAttr(meta: ContextMeta, name: string) {
        meta.target.setProp(meta.targetMeta, this.targetNode, name, null);
        const watcher = this.propWatchers[name];
        if (watcher) {
            this.hs.unwatch(this.props[name], watcher);
            delete this.propWatchers[name];
        }
    }

    private setAttrs(meta: ContextMeta) {
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
            let value = props[name];
            this.setAttr(meta, name, value);
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
        const owner = this;
        const hs = this.hs;

        for (let name in this.props) {
            const value = this.props[name];

            if (name in refProps) {
                refProps[name]({value, name, owner, hs});
            }

            refPropPatterns.forEach(({handler, matcher}) => {
                if (patternMatch(matcher, name)) {
                    handler({value, name, owner, hs});
                }
            });
        }
    }

    private mergeProps(meta: ContextMeta, newProps: PropsAbstract) {
        for (const name in newProps) {
            if (name in this.props) {
                this.delAttr(meta, name);
            }
            this.setAttr(meta, name, newProps[name]);
        }
        for (const name in this.props) {
            if (!(name in newProps)) {
                this.delAttr(meta, name);
            }
        }
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

        newElem.targetNodes = this.targetNodes;

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


export function registerGlobalProp<T>(matcher: string | RefPropPattern, handler: RefHandler<T>) {
    if (typeof matcher === 'string') {
        refProps[matcher] = handler;
        return;
    }

    refPropPatterns.push({matcher, handler});
}
