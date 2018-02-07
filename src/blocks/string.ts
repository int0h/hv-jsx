import {AbstractElement, ContextMeta, TargetNode} from './abstract';

export class StringElm extends AbstractElement {
    text: string;

    constructor (text: string) {
        super();
        this.text = text;
    }

    targetRender(meta: ContextMeta): TargetNode[] {
        const t = meta.target;
        this.targetNodes = [t.createTextNode(meta.targetMeta, this.text)];
        return this.targetNodes;
    }
}
