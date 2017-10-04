export type DomNode = Text | Element;

export function replaceDom(newElm: DomNode, withElm: DomNode | null) {
    if (!withElm) {
        newElm.remove();
    }
    withElm.parentElement.replaceChild(newElm, withElm);
}

export function appendChild(parent: DomNode, elm: DomNode | null) {
    if (elm === null) {
        return;
    }
    parent.appendChild(elm);
}
