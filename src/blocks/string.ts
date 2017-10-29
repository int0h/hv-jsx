import {AbstractElement, ContextMeta, TargetNode} from './common';

export class StringElm implements AbstractElement {
    text: string;
    targetNode: TargetNode;

    constructor (text: string) {
        this.text = text;
    }

    targetRender(meta: ContextMeta): TargetNode {
        const t = meta.target;
        this.targetNode = t.createTextNode(meta.targetMeta, this.text);
        return this.targetNode;
    }
}
