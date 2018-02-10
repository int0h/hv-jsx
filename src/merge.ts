import {HvNode, ContextMeta, AbstractElement} from './blocks/abstract';
import {flatArray} from './utils';

export interface MergeHandlers {
    appendChild(child: HvNode): void;
    removeChild(child: HvNode): void;
    replaceChild(oldChild: HvNode, newChild: HvNode): void;
}

export function mergeChildren(meta: ContextMeta, oldChildren: HvNode[], newChildren: HvNode[]): AbstractElement[] {
    const preparedChildren: HvNode[] = newChildren.map((newChild, index) => {
        const oldChild = oldChildren[index];

        if (!oldChild) {
            return newChild;
        }

        if (oldChild.constructor !== newChild.constructor) {
            return newChild;
        }

        return oldChild.merge(meta, newChild);
    });

    const [oldNodes, newNodes] = [oldChildren, preparedChildren].map(children => {
        return flatArray(children.map(child => child.targetNodes || child.targetRender(meta)));
    });

    meta.target.replaceSequence(meta.targetMeta, oldNodes, newNodes);

    return preparedChildren;
}
