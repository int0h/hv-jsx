import {AbstractElement, ContextMeta, TargetNode} from './abstract';
import {hashBlock} from '../hash';

export class StringElm extends AbstractElement {
    text: string;

    constructor (text: string) {
        super();
        this.text = text;
        this.hash = hashBlock({
            type: 'text',
            text
        });
    }

    targetRender(meta: ContextMeta): TargetNode[] {
        const t = meta.target;
        this.targetNodes = [t.createTextNode(meta.targetMeta, this.text)];
        return this.targetNodes;
    }

    merge(meta: ContextMeta, newString: StringElm): StringElm {
        return newString;
    }
}
