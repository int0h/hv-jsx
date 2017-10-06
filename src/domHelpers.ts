export type DomNode = Text | Element;

export function replaceDom(newElm: DomNode, oldElm: DomNode | null) {
    if (!oldElm) {
        newElm.remove();
    }
    oldElm.parentElement.replaceChild(newElm, oldElm);
}

export function appendChild(parent: DomNode, elm: DomNode | null) {
    if (elm === null) {
        return;
    }
    parent.appendChild(elm);
}
