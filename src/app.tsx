import {$hv, $hc, $autoHv, HyperValue} from './hv';
import {zone} from './dom';
import {bindMeta, JsxFn} from './jsx';
import {Component} from './component';


declare var window: {[key: string]: any};

class Button extends Component<{}> {
    init() {
        this.on('click', 'btn', () => {console.log('fsa')})
    }

    render (jsx: JsxFn) {
        return <button id="btn">
            {
                this.children
            }
        </button>;
    }
}

interface TextInputProps {
    value: HyperValue<string>;
    type: 'text'
}

type InputProps = TextInputProps;

class Input extends Component<InputProps> {
    init() {
        this.on('input', 'self', (event) => {
            const inputElm = event.target as HTMLInputElement;
            this.props.value.s(inputElm.value);
        });
    }

    render (jsx: JsxFn) {
        const elmProps = {
            ...this.props,
            value: this.props.value.g()
        }
        return <input id="self" {...elmProps} />;
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

const name = $hv('Title');

window.d = <div>
    {
        zone(() => (
            <h1>{name.g()}</h1>
        ))
    }
    <Input value={name} />
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
