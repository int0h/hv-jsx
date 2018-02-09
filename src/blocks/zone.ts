import {HyperValue, scopes} from 'hv';
import {normalizeNodeSet} from './common';
import {AbstractElement, HvNode, ContextMeta, TargetNode, Children} from './abstract';
import {flatArray} from '../utils';
import {renderDebug} from '../debug';
import {mergeChildren} from '../merge';
import {hashBlock, hash} from '../hash';

export class HyperZone extends AbstractElement {
    content: HyperValue<HvNode[]>;
    private hs = new scopes.FullScope();

    constructor (content: HyperValue<Children>) {
        super();
        this.content = this.hs.proxy(content, content => normalizeNodeSet(this.hs, content));
        this.hash = hashBlock({
            type: 'HyperZone',
            content: hash(content)
        });
    }

    @renderDebug
    private getTargetNodes(meta: ContextMeta, elems: HvNode[], needRender: boolean): TargetNode[] {
        return flatArray<TargetNode>(elems.map(elem => {
            return needRender
                ? elem.targetRender(meta)
                : elem.targetNodes;
        }));
    }

    private mergeChildren(meta: ContextMeta, newElems: HvNode[], oldElems: HvNode[]) {
        mergeChildren(meta, oldElems, newElems);
    }

    targetRender(meta: ContextMeta): TargetNode[] {
        // const t = meta.target;

        this.hs.watch(this.content, (newElems, oldElems) => {
            this.mergeChildren(meta, newElems, oldElems);
            // const oldContent = this.getTargetNodes(meta, oldElems, false);
            // let i = oldElems.length;
            // while (i--) {
            //     oldElems[i].free();
            // }
            // const newContent = this.getTargetNodes(meta, newElems, true);
            // t.replaceSequence(meta.targetMeta, oldContent, newContent);
        });

        this.targetNodes = this.getTargetNodes(meta, this.content.g(), true);
        return this.targetNodes;
    }

    free() {
        this.hs.free();
        this.content.$.forEach(child => child.free());
    }

    merge(meta: ContextMeta, newZone: HyperZone): HyperZone {
        if (this.hash === newZone.hash) {
            return this;
        }

        return newZone;
    }
}
