
import {HyperValue, scopes} from 'hyper-value';
import {AbstractElement, HvNode, Children, TargetNode, ContextMeta} from './abstract';
import {flatArray} from '../utils';
import {StringElm} from './string';
import {HyperZone} from './zone';
import {PlaceholderElm} from './placeholder';

export function normalizeNodeSet(hs: scopes.ProxyScope, children: Children): HvNode[] {
    if (typeof children === 'string') {
        return [new StringElm(children)];
    }
    if (typeof children === 'number') {
        return [new StringElm(String(children))];
    }
    if (!children) {
        return [new PlaceholderElm()];
    }
    if (children instanceof AbstractElement) {
        return [children];
    }

    const normalize = (children: Children) => normalizeNodeSet(hs, children);

    if (Array.isArray(children)) {
        const array = flatArray<HvNode>(children.map(normalize));
        return array.length > 0
            ? array
            : [new PlaceholderElm()];
    }
    if (children instanceof HyperValue) {
        const content = hs.proxy(children, normalize);
        return [new HyperZone(content)];
    }
    throw new Error('invalid child');
}

export function targetRenderChildren(meta: ContextMeta, children: Children): TargetNode[] {
    const hs = new scopes.ProxyScope();

    return flatArray(
        normalizeNodeSet(hs, children)
            .map(node => node.targetRender(meta)
        )
    );
}
