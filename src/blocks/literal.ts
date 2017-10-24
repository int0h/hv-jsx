import {DomNode} from '../domHelpers';
import {AbstractElement, ContextMeta} from './common';

export class StringElm implements AbstractElement {
    text: string;
    node: Text;

    constructor (text: string) {
        this.text = text;
    }

    renderDom(meta: ContextMeta) {
        this.node = document.createTextNode(this.text);
        return this.node;
    }

    getDom(): DomNode {
        return this.node;
    }
}
