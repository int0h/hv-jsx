import {HyperValue, scopes} from 'hv';
import {FSType} from 'hv/types/scopes/full';

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
            const isPatternProp = refPropPatterns
                .some(({matcher}) => patternMatch(matcher, name));
            if (name in refProps || isPatternProp) {
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
            })
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


export function registerGlobalProp<T>(matcher: string | RefPropPattern, handler: RefHandler<T>) {
    if (typeof matcher === 'string') {
        refProps[matcher] = handler;
        return;
    }

    refPropPatterns.push({matcher, handler});
}
