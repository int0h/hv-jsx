import {$hv, $hc, $autoHv, HyperValue} from '../hv';
import {zone} from '../dom';
import {bindMeta, JsxFn, jsx} from '../jsx';
import {Component} from '../component';


declare var window: {[key: string]: any};

// components:

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

// model:

type Item = HyperValue<{
    text: HyperValue<string>;
    done: HyperValue<boolean>;
}>;

function createItem(text: string): Item {
    return $hv({
        text: $hv(text),
        done: $hv(false)
    });
}

function hAlt(condition: HyperValue<boolean>, ifTrue: any, ifFalse: any) {
    return $autoHv(() => condition.g() ? ifTrue : ifFalse);
}

class App extends Component<{}>{
    currentText = $hv('');
    list = $hv<Item[]>([]);
    shownItems = $autoHv(() => this.list.g());
    filter = $hv('all');

    init() {
        this.on('click', 'add-btn', () => this.addItem());
        this.on('click', 'done', (event) => {
            const id = (event.target as HTMLElement).dataset.id;
            const item = this.shownItems.g()[Number(id)].g();
            item.done.s(!item.done.g());
        });
    }

    addItem() {
        const newItem = createItem(this.currentText.g());
        this.list.s(this.list.g().concat(newItem));
    }

    render(jsx: JsxFn) {
        return <div>
            <div class='add-panel'>
                <Input value={this.currentText} />
                <button id='add-btn'>Add</button>
            </div>
            {
                zone(() => <ul>
                    {
                        this.shownItems.g().map((item, i) => (
                            <li class={hAlt(item.g().done, 'done', '')}>
                                {
                                    item.g().text.g()
                                }
                                <button id='done' data-id={i}>Done!</button>
                            </li>
                        ))
                    }
                </ul>)
            }
        </div>
    }
}

const app = <App />;
document.body.appendChild(app.getDom());
