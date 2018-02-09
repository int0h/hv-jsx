import {AbstractElement, ContextMeta, TargetNode} from './abstract';
import {hashBlock} from '../hash';

export class PlaceholderElm extends AbstractElement {
    hash = hashBlock({
        type: 'placeholder'
    });

    targetRender(meta: ContextMeta): TargetNode[] {
        const t = meta.target;
        this.targetNodes = [t.createPlaceholder(meta.targetMeta)];
        return this.targetNodes;
    }

    merge(meta: ContextMeta, newPlaceholder: PlaceholderElm): PlaceholderElm {
        return newPlaceholder;
    }
}
