import {$hv, $hc, $autoHv} from './hv';
import {zone} from './dom';
import {bindMeta, JsxFn} from './jsx';
import {Component} from './component';


declare var window: {[key: string]: any};

class Button extends Component {
    render (jsx: JsxFn) {
        return <button id="btn">
            {
                this.children
            }
        </button>;
    }
}

const cl = $hv('foo');
const label = $hv('label');
window.cl = cl;
window.label = label;


const createItem = (text: string) => {
    return $hv({
        text: $hv(text),
        done: $hv(false)
    });
}
const data = $hv([]);
const shownItems = $autoHv(() => data.g());

// window.d = h('div', {},
//     'hello',
//     zone(() => {
//         if (label.g().length > 3) {
//             return h('a', {class: cl}, label.g());
//         }
//         return null;
//     })
// );
const jsx = bindMeta({
    mapAttrs: i => i
});
window.d = <div>
    <ul>
        {/* {
            zone(() => {

                <li>

                </li>
            })
        } */}
        hello
        <Button>ababds </Button>
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
    </ul>
</div>;
const f = () => (<foo />)

document.body.appendChild(window.d.getDom());
