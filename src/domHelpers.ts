export type DomNode = Text | Element;
export type XmlNamespace = 'html' | 'svg';

const nsTable = {
    html: 'http://www.w3.org/1999/xhtml',
    svg: 'http://www.w3.org/2000/svg'
};

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

export function setAttr(dom: Element, name: string, value: any, ns: XmlNamespace) {
    switch (ns) {
        case 'html':
            if (typeof value === 'string' || typeof value === 'number') {
                dom.setAttribute(name, String(value));
            }
            (dom as any)[name] = value;
            return;
        case 'svg':
            dom.setAttribute(name, value);
            return;
    }
}

export function createElm(ns: XmlNamespace, tagName: string) {
    return document.createElementNS(nsTable[ns], tagName);
}

export function guessNs(tagName: string, currentNs: XmlNamespace): XmlNamespace {
    if (tagName === 'svg') {
        return 'svg';
    }
    if (tagName === 'foreignObject') {
        return 'html';
    }
    return currentNs;
}
