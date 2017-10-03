import {HyperValue, $hv, $autoHv, noRecord} from './hv';

type Elm = {
    name: string;
}

interface Dict<T> {
    [key: string]: T;
}

export type Props = Dict<any> | null;

type PropType = HyperValue<any> | any;

type PropsAbstract = Dict<any>;

export type Node = StringElm | HyperElm | HyperZone | null;

type DomNode = Text | Element;

const domMap = new Map();

function replaceDom(newElm: DomNode, withElm: DomNode | null) {
    if (!withElm) {
        newElm.remove();
    }
    withElm.parentElement.replaceChild(newElm, withElm);
}

function appendChild(parent: DomNode, elm: DomNode | null) {
    if (elm === null) {
        return;
    }
    parent.appendChild(elm);
}

class HyperElm {
    elm: Element;

    constructor (tagName: string, props: PropsAbstract, children: (Node | string)[]) {
        this.elm = document.createElement(tagName);
        props = props || {};
        for (let name in props) {
            let value = props[name];
            if (value instanceof HyperValue) {
                value.watch(newValue => {
                    this.elm.setAttribute(name, newValue);
                });
                noRecord(() => {
                    value = value.g()
                });
            }
            this.elm.setAttribute(name, value);
        }
        for (let child of children) {
            const dom = getDom(str(child));
            appendChild(this.elm, dom);
        }
    }

    getDom(): DomNode {
        return this.elm;
    }
}

class StringElm {
    node: Text;

    constructor (text: string) {
        this.node = document.createTextNode(text);
    }

    getDom(): DomNode {
        return this.node;
    }
}

type ZoneResult = Node | string;

class HyperZone {
    hv: HyperValue<ZoneResult>;

    constructor (content: () => ZoneResult) {
        const notNullableContent = () => {
            const res: ZoneResult = content();
            return toNnElm(res);
        }
        this.hv = $autoHv(notNullableContent);
        this.hv.watch((newElm, oldElm: Node) => {
            replaceDom(getDom(str(newElm)), oldElm.getDom());
        })
    }

    getDom(): DomNode {
        return getDom(str(this.hv.g()));
    }
}

function str(text: string | Node) {
    if (text === null) {
        return null;
    }
    if (typeof text === 'string') {
        return new StringElm(text);
    }
    return text;
}

function toNnElm(elmLike: string | Node) {
    if (elmLike !== null) {
        return str(elmLike);
    }
    const scriptNode = new HyperElm('script', {}, []);
    return scriptNode;
}

function getDom(node: Node) {
    if (node === null) {
        return null;
    }
    return node.getDom();
}

export function zone(content: () => ZoneResult): HyperZone {
    return new HyperZone(content);
}

export function h(tagName: string, props: Dict<any>, ...children: (Node | string)[]): HyperElm {
    return new HyperElm(tagName, props, children);
}


// document.body.appendChild(window.d.getDom());
// // throw '';
// abstract class Component<P extends Dict<any>> {
//     rootElm: Element;

//     constructor (tagName: string, props: P, children: HyperElm[]) {

//     }

//     protected getDom() {
//         return this.render();
//     }

//     abstract render(): HyperElm;
// }


// type NodeType = string | any;

// export function dom<P, T>(type: T, props: P, ...children: any[]): T {
//     return {name: ''} as any as  T
// }
