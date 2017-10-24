import {HyperValue, hvWrap} from 'hv';
import {AbstractElement, normalizeNode, render, HvNode, ContextMeta} from './common';
import {replaceDom, DomNode} from '../domHelpers';

export type ZoneResult = HvNode | string | number;

export class HyperZone implements AbstractElement {
    content: HyperValue<HvNode>;
    dom: DomNode;

    constructor (content: HyperValue<ZoneResult>) {
        this.content = hvWrap(content, normalizeNode);
    }

    renderDom(meta: ContextMeta): DomNode {
        this.content.watch((newElm, oldElm) => {
            replaceDom(render(newElm, meta), oldElm.getDom());
        })
        this.dom = render(this.content.g(), meta);
        return this.dom;
    }

    getDom(): DomNode {
        return this.dom;
    }
}
