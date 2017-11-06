
import {HyperValue, hvWrap} from 'hv';
import {AbstractElement, HvNode, Children} from './abstract';
import {flatArray} from '../utils';
import {StringElm} from './string';
import {HyperZone} from './zone';
import {PlaceholderElm} from './placeholder';

export function normalizeNodeSet(children: Children): HvNode[] {
    if (children === null) {
        return [new PlaceholderElm()];
    }
    if (children === false) {
        return [new PlaceholderElm()];
    }
    if (typeof children === 'string') {
        return [new StringElm(children)];
    }
    if (typeof children === 'number') {
        return [new StringElm(String(children))];
    }
    if (children instanceof AbstractElement) {
        return [children];
    }
    if (Array.isArray(children)) {
        const array = flatArray<HvNode>(children.map(normalizeNodeSet));
        return array.length > 0
            ? array
            : [new PlaceholderElm()];
    }
    if (children instanceof HyperValue) {
        const content = hvWrap(children, normalizeNodeSet);
        return [new HyperZone(content)];
    }
    throw new Error('invalid child');
}
