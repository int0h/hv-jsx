import {HyperValue} from 'hv';
import {Component} from '../../component';
import {jsx} from '../../jsx';

interface TextInputProps {
    value: HyperValue<string>;
    type: 'text'
}

type InputProps = TextInputProps;

export class TextInput extends Component<InputProps> {
    handler = (event: Event) => {
        const inputElm = event.target as HTMLInputElement;
        this.props.value.s(inputElm.value);
    };

    render () {
        let elmProps = {
            ...this.props,
            value: this.props.value
        }
        return <input id="self" oninput={this.handler} {...elmProps} />;
    }
}
