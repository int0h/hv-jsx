import {AbstractElement, ContextMeta, TargetNode} from './abstract';

export class PlaceholderElm extends AbstractElement {
    targetRender(meta: ContextMeta): TargetNode[] {
        const t = meta.target;
        this.targetNodes = [t.createPlaceholder(meta.targetMeta)];
        return this.targetNodes;
    }
}
