import {HyperValue} from 'hv';
import {HyperElm} from './dom';

export type HyperStyle = {
    [name in keyof CSSStyleDeclaration]?: string | null | HyperValue<string | null> | undefined;
}

export function styleMapper(props: HyperStyle, target: HyperElm) {
    for (let key in props) {
        const name = key as keyof CSSStyleDeclaration;
        let value = props[name];
        if (value instanceof HyperValue) {
            value.watch(newValue => {
                (target.elm as HTMLElement).style.setProperty(name, newValue || null);
            });
            value = value.g(true);
        }
        (target.elm as HTMLElement).style.setProperty(name, value || null);
    }
}
