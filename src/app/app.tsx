import {$hv, $hc, $autoHv, HyperValue} from '../hv';
import {HvArray} from '../hvHelpers'
import {} from '../dom';
import {jsx} from '../jsx';
import {Component} from '../component';


declare var window: {[key: string]: any};
window.arr =[];

// components:

class Button extends Component<{}> {
    init() {
        this.on('click', 'btn', () => {console.log('fsa')})
    }

    render () {
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

    render () {
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

type ItemRaw = {
    text: HyperValue<string>;
    done: HyperValue<boolean>;
};

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
    //list = $hv<Item[]>([]);
    list = new HvArray<ItemRaw>([]);
    shownItems = $autoHv(() => this.list.g());
    filter = $hv('all');
    //totalCount = 0;
    totalCount = this.list.getLength();
    doneCount = this.list
        .filter(value => {
            return value.done
        })
        .getLength();
    // doneCount = $autoHv(() => {
    //     return this.list.g().filter(i => {
    //         return i.g().done.g()
    //     }).length;
    // });

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
        this.list.push(newItem);
    }

    render() {
        return <div>
            <div class='add-panel'>
                <Input value={this.currentText} />
                <button id='add-btn'>Add</button>
            </div>
            <h3>
                Done {this.doneCount} / {this.totalCount}
            </h3>
            {
                $autoHv(() => <ul>
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
document.body.appendChild(app.renderDom({}));
