# hv-jsx

hv-jsx - is a library that allows to create components using jsx. It works similarly to react but it's designed to work with [hyper-value](https://github.com/int0h/hyper-value) library.

A tutorial for this library (and some others) can be found here: https://medium.com/@int0h/hyper-value-living-data-in-your-application-a54aab68d8b1

It's designed to be agnostic of *target* (the backend to which it renders). One of the *targets* is [hv-dom](https://github.com/int0h/hv-dom).

# Example of usage

```tsx
import {HyperValue} from 'hyper-value';
import {jsx, Component} from 'hv-jsx';
import {renderIn} from 'hv-dom';

class App extends Component<{}> {
    count = new HyperValue(0);
    render() {
        return <div>
            <span>Click amount: {this.count}</span>
            <button onClick={() => this.count.$++}>Click me!</button>
        </div>;
    }
}

renderIn(document.body, {}, <App />);
```

# API reference

Two the most basic things you are going to use in your code are:

`jsx` - which is JSX function (it can be set via `pragma` for Babel, or `jsxFactory` for Typescript). It should be imported in every file containing JSX syntax;
`Component` - is a base Component class, custom components can be created via extending this class;

### JSX features

- child can be a primitive like: `string`, `number`, `boolean`, `null`, or `undefined`;
- child can be a HvNode - which is a result of jsx-function;
- HyperValue instance can be a valid jsx child (it should be resolved to other valid children);
- child can be an array of any other valid children;

It's possible to handle specific attributes of tags via `registerGlobalElem` or `registerGlobalProp`. An example of that can be found in [hv-dom](https://github.com/int0h/hv-dom) repository.

### Hooks

At this point there is only one hook `init` but it will likely change in future.
