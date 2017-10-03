import {$hv} from './hv';
import {zone} from './dom';
import {jsx} from './jsx';


declare var window: {[key: string]: any};

const cl = $hv('foo');
const label = $hv('label');
window.cl = cl;
window.label = label;

// window.d = h('div', {},
//     'hello',
//     zone(() => {
//         if (label.g().length > 3) {
//             return h('a', {class: cl}, label.g());
//         }
//         return null;
//     })
// );

window.d = <div>
    hello
    {
        zone(() => {
            if (label.g().length > 3) {
                return <a class={cl}>
                    foo
                </a>;
            }
            return null;
        })
    }
</div>;
const f = () => (<foo />)

document.body.appendChild(window.d.getDom());
