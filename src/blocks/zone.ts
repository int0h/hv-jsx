import {HyperValue, scopes} from 'hv';
import {normalizeNodeSet} from './common';
import {AbstractElement, HvNode, ContextMeta, TargetNode, Children} from './abstract';
import {flatArray} from '../utils';
import {renderDebug} from '../debug';

export class HyperZone extends AbstractElement {
    content: HyperValue<HvNode[]>;
    targetNodes: TargetNode[];
    private hs = new scopes.FullScope();

    constructor (content: HyperValue<Children>) {
        super();
        this.content = this.hs.proxy(content, content => normalizeNodeSet(this.hs, content));
    }

    @renderDebug
    private getTargetNodes(meta: ContextMeta, elems: HvNode[], needRender: boolean): TargetNode[] {
        return flatArray<TargetNode>(elems.map(elem => {
            return needRender
                ? elem.targetRender(meta)
                : elem.targetNodes;
        }));
    }

    targetRender(meta: ContextMeta): TargetNode[] {
        const t = meta.target;

        this.hs.watch(this.content, (newElems, oldElems) => {
            const oldContent = this.getTargetNodes(meta, oldElems, false);
            let i = oldElems.length;
            while (i--) {
                oldElems[i].free();
            }
            const newContent = this.getTargetNodes(meta, newElems, true);
            t.replaceSequence(meta.targetMeta, oldContent, newContent);
        });

        this.targetNodes = this.getTargetNodes(meta, this.content.g(), true);
        return this.targetNodes;
    }

    free() {
        this.hs.free();
        this.content.$.forEach(child => child.free());
    }
}
