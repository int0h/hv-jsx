import {HyperValue, hvWrap} from 'hv';
import {AbstractElement, normalizeNode, render, HvNode, ContextMeta, TargetNode} from './common';

export type ZoneResult = HvNode | string | number;

export class HyperZone implements AbstractElement {
    content: HyperValue<HvNode>;
    targetNode: TargetNode;

    constructor (content: HyperValue<ZoneResult>) {
        this.content = hvWrap(content, normalizeNode);
    }

    targetRender(meta: ContextMeta): TargetNode {
        const t = meta.target;

        this.content.watch((newElm, oldElm) => {
            const newContent = render(newElm, meta);
            t.replace(meta.targetMeta, oldElm.targetNode, newContent);
        })

        this.targetNode = render(this.content.g(), meta);
        return this.targetNode;
    }
}
