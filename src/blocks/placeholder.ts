import {AbstractElement, ContextMeta, TargetNode} from './common';

export class PlaceholderElm implements AbstractElement {
    targetNode: TargetNode;

    targetRender(meta: ContextMeta): TargetNode {
        const t = meta.target;
        this.targetNode = t.createPlaceholder(meta.targetMeta);
        return this.targetNode;
    }
}
