import test = require('tape');

import {HyperValue} from 'hv';
import {jsx, Component, HvNode} from '..';
import {renderDom, Elem, TextNode, Placeholder} from 'hv-jsx-mock';

test('jsx works', t => {
    <div />;
    t.pass('jsx works');
    t.end();
});

test('basic rendering', t => {

    t.test('tag name', t => {
        const res = renderDom(<div />) as Elem;
        t.is(res.type, 'div', 'tag name is correct');
        t.end();
    });

    t.test('attributes', t => {
        const res = renderDom(<div foo='foo' />) as Elem;
        t.is(res.props.foo, 'foo', 'attribute rendering');
        t.end();
    });

    t.test('content', t => {
        const res = renderDom(<div><b/></div>) as Elem;
        const b = res.children[0] as Elem;
        t.is(b.type, 'b', 'content rendering');
        t.end();
    });

    t.test('text content', t => {
        const res = renderDom(<div>hey</div>) as Elem;
        const text = res.children[0] as TextNode;
        t.is(text.text, 'hey', 'content rendering');
        t.end();
    });

    t.test('react specific attrs', t => {
        const res = renderDom(<div key='key' class='class' />) as Elem;
        t.is(res.props.key, 'key', 'key attribute rendering');
        t.is(res.props.class, 'class', 'class attribute rendering');
        t.end();
    });

    t.test('rest props', t => {
        const props = {
            p1: 'p1',
            p2: 'p2'
        };
        const res = renderDom(<div p3='p3' {...props} />) as Elem;
        t.is(res.props.p1, 'p1', 'rest attribute rendering');
        t.is(res.props.p2, 'p2', 'rest attribute rendering');
        t.is(res.props.p3, 'p3', 'rest attribute rendering');
        t.end();
    });

});

test('basic attriutes data binding', t => {

    t.test('attribute', t => {
        let val = new HyperValue('hello');
        const res = renderDom(<div foo={val} />) as Elem;
        t.is(res.props.foo, 'hello', 'attribute rendered');
        val.s('world');
        t.is(res.props.foo, 'world', 'attribute updated');
        t.end();
    });

    t.test('some attributes', t => {
        let v1 = new HyperValue('v1');
        let v2 = new HyperValue('v2');
        const res = renderDom(<div v1={v1} v2={v2} />) as Elem;
        t.is(res.props.v1, 'v1', 'attribute rendering');
        t.is(res.props.v2, 'v2', 'attribute rendering');
        v1.s('v1-new');
        t.is(res.props.v1, 'v1-new', 'attribute updated');
        t.is(res.props.v2, 'v2', 'attribute remains still');
        v2.s('v2-new');
        t.is(res.props.v1, 'v1-new', 'attribute updated');
        t.is(res.props.v2, 'v2-new', 'attribute updated');
        t.end();
    });

    t.test('same hv attributes', t => {
        let v = new HyperValue('v');
        const res = renderDom(<div v1={v} v2={v} />) as Elem;
        t.is(res.props.v1, 'v', 'attribute rendering');
        t.is(res.props.v2, 'v', 'attribute rendering');
        v.s('v-new');
        t.is(res.props.v1, 'v-new', 'attribute updated');
        t.is(res.props.v2, 'v-new', 'attribute updated');
        t.end();
    });

});

test('basic content data binding', t => {

    t.test('hv text content', t => {
        let val = new HyperValue('hello');
        const res = renderDom(<div>{val}</div>) as Elem;
        const text = res.children[0] as TextNode;
        t.is(text.text, 'hello', 'content rendered');
        val.s('world');
        t.is((res.children[0] as TextNode).text, 'world', 'content updated');
        t.end();
    });

    t.test('hv jsx content', t => {
        let val = new HyperValue(<b>hello</b>);
        const res = renderDom(<div>{val}</div>) as Elem;
        const elem = res.children[0] as Elem;
        t.is(elem.type, 'b', 'content rendered');
        val.s(<i>world</i>);
        t.is((res.children[0] as Elem).type, 'i', 'content updated');
        t.end();
    });

    t.test('hv jsx content: dynamic type', t => {
        let val = new HyperValue<string | HvNode>(<b>hello</b>);
        const res = renderDom(<div>{val}</div>) as Elem;
        const elem = res.children[0] as Elem;
        t.is(elem.type, 'b', 'content rendered');
        val.s('world');
        t.is((res.children[0] as TextNode).text, 'world', 'content updated');
        t.end();
    });

    t.test('hv jsx content: nullable', t => {
        let val = new HyperValue<null | HvNode>(<b>hello</b>);
        const res = renderDom(<div>{val}</div>) as Elem;
        const elem = res.children[0] as Elem;
        t.is(elem.type, 'b', 'content rendered');
        val.s(null);
        t.true(res.children[0] instanceof Placeholder, 'content updated');
        t.end();
    });

    t.test('hv jsx content: nullable and back', t => {
        let val = new HyperValue<null | HvNode>(null);
        const res = renderDom(<div>{val}</div>) as Elem;
        t.true(res.children[0] instanceof Placeholder, 'content rendered');
        val.s(<b>hello</b>);
        t.true(res.children[0] instanceof Elem, 'content updated');
        t.end();
    });

    t.test('hv jsx multi content', t => {
        let c1 = new HyperValue(<b>hello</b>);
        let c2 = new HyperValue(<i>world</i>);
        const res = renderDom(<div>{c1}{c2}</div>) as Elem;
        t.is((res.children[0] as Elem).type, 'b', 'content rendered');
        t.is((res.children[1] as Elem).type, 'i', 'content rendered');
        c1.s(<a>whats up</a>);
        t.is((res.children[0] as Elem).type, 'a', 'content rendered');
        t.is((res.children[1] as Elem).type, 'i', 'content rendered');
        c2.s(<w>dude</w>);
        t.is((res.children[0] as Elem).type, 'a', 'content rendered');
        t.is((res.children[1] as Elem).type, 'w', 'content rendered');
        t.end();
    });

});

test('basic components', t => {

    t.test('hv text content', t => {
        class Comp extends Component<{}> {
            render() {
                return <hello />;
            }
        }

        const res = renderDom(<Comp />) as Elem;
        t.is(res.type, 'hello', 'component rendered');
        t.end();
    });

    t.test('hv text content', t => {
        class Comp extends Component<{}> {
            render() {
                return <h>{this.children}</h>;
            }
        }

        const res = renderDom(<Comp><foo /></Comp>) as Elem;
        t.is(res.type, 'h', 'component rendered');
        t.is((res.children[0] as Elem).type, 'foo', 'component rendered');
        t.end();
    });

    t.test('hv multi text content', t => {
        class Comp extends Component<{}> {
            render() {
                return <h>{this.children}</h>;
            }
        }

        const res = renderDom(<Comp><foo /><boo /></Comp>) as Elem;
        t.is(res.type, 'h', 'component rendered');
        t.is((res.children[0] as Elem).type, 'foo', 'component rendered');
        t.is((res.children[1] as Elem).type, 'boo', 'component rendered');
        t.end();
    });

});


test('hyper zone', t => {

    t.test('basic render', t => {
        const zone = new HyperValue(<a>asd</a>);
        const res = renderDom(<div>{zone}</div>) as Elem;
        t.is((res.children[0] as Elem).type, 'a', 'content is rendered');
        t.end();
    });

    t.test('update', t => {
        const zone = new HyperValue(<a>asd</a>);
        const res = renderDom(<div>{zone}</div>) as Elem;
        t.is((res.children[0] as Elem).type, 'a', 'content is rendered');
        zone.s(<b>asd</b>);
        t.is((res.children[0] as Elem).type, 'b', 'content is updated');
        t.end();
    });

    t.test('multi root', t => {
        const zone = new HyperValue([<a/>, <b />]);
        const res = renderDom(<div>{zone}</div>) as Elem;
        t.is((res.children[0] as Elem).type, 'a', 'content is rendered');
        t.is((res.children[1] as Elem).type, 'b', 'content is updated');
        t.end();
    });



});
