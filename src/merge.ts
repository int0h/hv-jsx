import {HvNode, ContextMeta} from './blocks/abstract';
import {flatArray} from './utils';

export interface MergeHandlers {
    appendChild(child: HvNode): void;
    removeChild(child: HvNode): void;
    replaceChild(oldChild: HvNode, newChild: HvNode): void;
}

export function mergeChildren(meta: ContextMeta, oldChildren: HvNode[], newChildren: HvNode[]) {
    const preparedChildren: HvNode[] = newChildren.map((newChild, index) => {
        return newChild;

        const oldChild = oldChildren[index];

        if (!oldChild) {
            return newChild;
        }

        if (oldChild.hash === newChild.hash) {
            return oldChild;
        }

        if (oldChild.constructor !== newChild.constructor) {
            return newChild;
        }

        return oldChild.merge(meta, newChild);
    });

    const [oldNodes, newNodes] = [oldChildren, preparedChildren].map(children => {
        return flatArray(children.map(child => child.targetNodes || child.targetRender(meta)));
    });

    for (let i = 0; i < Math.min(oldNodes.length, newNodes.length); i++) {
        if (oldNodes[i] !== newNodes[i]) {
            meta.target.replaceSequence(meta.targetMeta, oldNodes.slice(i), newNodes.slice(i));
            return;
        }
    }
}
