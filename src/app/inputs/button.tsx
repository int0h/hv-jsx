import {HyperValue} from 'hv';
import {Component} from '../../component';
import {jsx} from '../../jsx';

class Button extends Component<{}> {
    render () {
        return <button id="btn">
            {
                this.children
            }
        </button>;
    }
}
