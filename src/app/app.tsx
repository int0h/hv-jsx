import {hvMake, hvEval, hvAuto, HyperValue, HvArray} from 'hv';
import {} from '../dom';
import {jsx} from '../jsx';
import {Component} from '../component';
import {TextInput} from './inputs/textInput';
import {Checkbox} from './inputs/checkBox';

declare var window: {[key: string]: any};
window.arr =[];

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
    return hvMake({
        text: hvMake(text),
        done: hvMake(false)
    });
}

function hAlt(condition: HyperValue<boolean>, ifTrue: any, ifFalse: any) {
    return hvAuto(() => condition.g() ? ifTrue : ifFalse);
}

class App extends Component<{}>{
    currentText = hvMake('');
    list = new HvArray<ItemRaw>([]);
    shownItems = this.list.filter(item => {
        return item.done.g() && this.showDone.g()
            || !item.done.g() && this.showUndone.g();
    });
    showDone = hvMake(true);
    showUndone = hvMake(true);
    totalCount = this.list.getLength();
    doneCount = this.list
        .filter(value => {
            return value.done
        })
        .getLength();

    init() {
        this.on('click', 'add-btn', () => this.addItem());
        this.on('click', 'done', (event) => {
            const id = (event.target as HTMLElement).dataset.id;
            const item = this.shownItems.g()[Number(id)].g();
            item.done.s(!item.done.g());
        });
    }

    addItem() {
        const newItem = createItem(this.currentText.g() || 'Unnamed item');
        this.list.push(newItem);
    }

    render() {
        return <div class='app'>
            <h2>
                To-do list
            </h2>
            <div class='add-panel'>
                <TextInput class='edit' placeholder='Type here...' value={this.currentText} />
                <button class='add-button' id='add-btn'>Add</button>
            </div>
            <h3>
                Done {this.doneCount} / {this.totalCount}
            </h3>
            {
                hvAuto(() =>
                    <ul>
                        {
                            this.shownItems.g().map((item, i) => (
                                <li class={hAlt(item.g().done, 'item item_done', 'item')}>
                                {/* <li class={hAlt(item.g().done, 'done', '')}> */}
                                    <span class='item-text'>
                                        {
                                            item.g().text.g()
                                        }
                                    </span>
                                    <label class='item__do-label'>
                                        Done: <Checkbox id='done' value={item.g().done}/>
                                    </label>
                                </li>
                            ))
                        }
                    </ul>
                )
            }
            <label class='item__do-label'>
                Show done: <Checkbox id='done' value={this.showDone}/>
            </label>
            <label class='item__do-label'>
                Show undone: <Checkbox id='done' value={this.showUndone}/>
            </label>
        </div>
    }
}

const app = <App />;
document.body.appendChild(app.renderDom({ns: 'html'}));

//import './autoOnly';
