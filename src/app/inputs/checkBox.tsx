import {HyperValue, hvAuto} from 'hv';
import {Component} from '../../component';
import {jsx} from '../../jsx';

interface CheckboxInputProps {
    value: HyperValue<boolean>;
}

function hAlt(condition: HyperValue<boolean>, ifTrue: any, ifFalse: any) {
    return hvAuto(() => condition.g() ? ifTrue : ifFalse);
}

export class Checkbox extends Component<CheckboxInputProps> {
    handler = (event: Event) => {
        const inputElm = event.target as HTMLInputElement;
        this.props.value.s(inputElm.checked);
    };

    render () {
        let elmProps = {
            ...this.props,
            checked: this.props.value
        }
        return <span class={hAlt(this.props.value, 'check-box checked', 'check-box')}>
            <svg class='tick' xmlns="http://www.w3.org/2000/svg" viewBox='0 0 5 5'>
                <path d='M1,2.25 L2,3.25 L4,1.25' fill='none'/>
            </svg>
            <input id="self" type='checkbox' {...elmProps} onclick={this.handler} />
        </span>;
    }
}
