import test = require('tape');

import {HyperValue} from 'hv';
import {jsx, Component, Children} from '../..';
// import {isComponentClass} from '../../src/blocks/component';
import {renderDom, Elem, TextNode, Placeholder} from 'hv-jsx-mock';

test('jsx works', t => {
    <div />;
    t.pass('jsx works');
    t.end();
});

test('basic rendering', t => {

    t.test('tag name', t => {
        const res = renderDom(<div />)[0] as Elem;
        t.is(res.type, 'div', 'tag name is correct');
        t.end();
    });

    t.test('attributes', t => {
        const res = renderDom(<div foo='foo' />)[0] as Elem;
        t.is(res.props.foo, 'foo', 'attribute rendering');
        t.end();
    });

    t.test('content', t => {
        const res = renderDom(<div><b/></div>)[0] as Elem;
        const b = res.children[0] as Elem;
        t.is(b.type, 'b', 'content rendering');
        t.end();
    });

    t.test('text content', t => {
        const res = renderDom(<div>hey</div>)[0] as Elem;
        const text = res.children[0] as TextNode;
        t.is(text.text, 'hey', 'content rendering');
        t.end();
    });

    t.test('react specific attrs', t => {
        const res = renderDom(<div key='key' class='class' />)[0] as Elem;
        t.is(res.props.key, 'key', 'key attribute rendering');
        t.is(res.props.class, 'class', 'class attribute rendering');
        t.end();
    });

    t.test('rest props', t => {
        const props = {
            p1: 'p1',
            p2: 'p2'
        };
        const res = renderDom(<div p3='p3' {...props} />)[0] as Elem;
        t.is(res.props.p1, 'p1', 'rest attribute rendering');
        t.is(res.props.p2, 'p2', 'rest attribute rendering');
        t.is(res.props.p3, 'p3', 'rest attribute rendering');
        t.end();
    });

    t.test('empty string as a child', t => {
        const res = renderDom(<div>{''}</div>)[0] as Elem;
        const s = res.children[0] as TextNode;
        t.true(s instanceof TextNode, 'content rendering');
        t.is(s.text, '', 'content rendering');
        t.end();
    });

    t.test('empty string as jsx', t => {
        const res = renderDom('')[0] as TextNode;
        t.true(res instanceof TextNode, 'content rendering');
        t.is(res.text, '', 'content rendering');
        t.end();
    });

});

test('basic attriutes data binding', t => {

    t.test('attribute', t => {
        let val = new HyperValue('hello');
        const res = renderDom(<div foo={val} />)[0] as Elem;
        t.is(res.props.foo, 'hello', 'attribute rendered');
        val.s('world');
        t.is(res.props.foo, 'world', 'attribute updated');
        t.end();
    });

    t.test('some attributes', t => {
        let v1 = new HyperValue('v1');
        let v2 = new HyperValue('v2');
        const res = renderDom(<div v1={v1} v2={v2} />)[0] as Elem;
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
        const res = renderDom(<div v1={v} v2={v} />)[0] as Elem;
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
        const res = renderDom(<div>{val}</div>)[0] as Elem;
        const text = res.children[0] as TextNode;
        t.is(text.text, 'hello', 'content rendered');
        val.s('world');
        t.is((res.children[0] as TextNode).text, 'world', 'content updated');
        t.end();
    });

    t.test('hv jsx content', t => {
        let val = new HyperValue(<b>hello</b>);
        const res = renderDom(<div>{val}</div>)[0] as Elem;
        const elem = res.children[0] as Elem;
        t.is(elem.type, 'b', 'content rendered');
        val.s(<i>world</i>);
        t.is((res.children[0] as Elem).type, 'i', 'content updated');
        t.end();
    });

    t.test('hv jsx content: dynamic type', t => {
        let val = new HyperValue<string | Children>(<b>hello</b>);
        const res = renderDom(<div>{val}</div>)[0] as Elem;
        const elem = res.children[0] as Elem;
        t.is(elem.type, 'b', 'content rendered');
        val.s('world');
        t.is((res.children[0] as TextNode).text, 'world', 'content updated');
        t.end();
    });

    t.test('hv jsx content: nullable', t => {
        let val = new HyperValue<null | Children>(<b>hello</b>);
        const res = renderDom(<div>{val}</div>)[0] as Elem;
        const elem = res.children[0] as Elem;
        t.is(elem.type, 'b', 'content rendered');
        val.s(null);
        t.true(res.children[0] instanceof Placeholder, 'content updated');
        t.end();
    });

    t.test('hv jsx content: nullable and back', t => {
        let val = new HyperValue<null | Children>(null);
        const res = renderDom(<div>{val}</div>)[0] as Elem;
        t.true(res.children[0] instanceof Placeholder, 'content rendered');
        val.s(<b>hello</b>);
        t.true(res.children[0] instanceof Elem, 'content updated');
        t.end();
    });

    t.test('hv jsx multi content', t => {
        let c1 = new HyperValue(<b>hello</b>);
        let c2 = new HyperValue(<i>world</i>);
        const res = renderDom(<div>{c1}{c2}</div>)[0] as Elem;
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

        const res = renderDom(<Comp />)[0] as Elem;
        t.is(res.type, 'hello', 'component rendered');
        t.end();
    });

    t.test('hv text content', t => {
        class Comp extends Component<{}> {
            render() {
                return <h>{this.children}</h>;
            }
        }

        const res = renderDom(<Comp><foo /></Comp>)[0] as Elem;
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

        const res = renderDom(<Comp><foo /><boo /></Comp>)[0] as Elem;
        t.is(res.type, 'h', 'component rendered');
        t.is((res.children[0] as Elem).type, 'foo', 'component rendered');
        t.is((res.children[1] as Elem).type, 'boo', 'component rendered');
        t.end();
    });

    t.test('multi root', t => {
        class Comp extends Component<{}> {
            render() {
                return [<a/>, <b/>] ;
            }
        }

        const res = renderDom(<Comp/>);
        t.is((res[0] as Elem).type, 'a', 'component rendered');
        t.is((res[1] as Elem).type, 'b', 'component rendered');
        t.end();
    });

    t.test('multi root update', t => {
        let a = new HyperValue('a');
        let b = new HyperValue('b');

        class Comp extends Component<{a: HyperValue<string>, b: HyperValue<string>}> {
            render() {
                const {a, b} = this.props;
                return [<a p={a}/>, <b p={b}/>];
            }
        }

        const res = renderDom(<Comp a={a} b={b}/>);
        t.is((res[0] as Elem).type, 'a', 'component rendered');
        t.is((res[0] as Elem).props.p, 'a', 'property rendered');
        t.is((res[1] as Elem).type, 'b', 'component rendered');
        t.is((res[1] as Elem).props.p, 'b', 'property rendered');
        a.s('aa');
        b.s('bb');
        t.is((res[0] as Elem).props.p, 'aa', 'property rendered');
        t.is((res[1] as Elem).props.p, 'bb', 'property rendered');
        t.end();
    });

    t.test('detect component class', t => {
        // class Comp extends Component<{}> {
        //     render() {
        //         return <hello />;
        //     }
        // }

        // t.true(isComponentClass(Comp), 'component detected');
        // t.false(isComponentClass((() => {}) as any), 'functions are not component classes');
        t.end();
    });

    t.test('function as component', t => {
        const Comp = () => '';

        const res = renderDom(<Comp />)[0] as TextNode;
        t.true(res instanceof TextNode, 'rendered');
        t.end();
    });

    t.test('function as component: jsx', t => {
        const Comp = () => <a/>;

        const res = renderDom(<Comp />)[0] as Elem;
        t.true(res instanceof Elem, 'rendered');
        t.end();
    });

    t.test('function as component: props', t => {
        const Comp = ({v}: {v: string}) => <a href={v}/>;

        const res = renderDom(<Comp v='foo' />)[0] as Elem;
        t.is(res.props.href, 'foo', 'rendered');
        t.end();
    });

    t.test('function as component: children', t => {
        const Comp = ({}, children: Children) => <a>
            {children}
        </a>;

        const res = renderDom(<Comp><hello/></Comp>)[0] as Elem;
        const child = res.children[0] as Elem;
        t.is(child.type, 'hello', 'rendered');
        t.end();
    });

    t.test('function as component: update', t => {
        const hv = new HyperValue('hey');

        const Comp = () => <a>{hv}</a>;

        const res = renderDom(<Comp />)[0] as Elem;
        t.is((res.children[0] as TextNode).text, 'hey', 'rendered');
        hv.s('wassup');
        t.is((res.children[0] as TextNode).text, 'wassup', 'rendered');
        t.end();
    });

});


test('hyper zone', t => {

    t.test('basic render', t => {
        const zone = new HyperValue(<a>asd</a>);
        const res = renderDom(<div>{zone}</div>)[0] as Elem;
        t.is((res.children[0] as Elem).type, 'a', 'content is rendered');
        t.end();
    });

    t.test('update', t => {
        const zone = new HyperValue(<a>asd</a>);
        const res = renderDom(<div>{zone}</div>)[0] as Elem;
        t.is((res.children[0] as Elem).type, 'a', 'content is rendered');
        zone.s(<b>asd</b>);
        t.is((res.children[0] as Elem).type, 'b', 'content is updated');
        t.end();
    });

    t.test('multi root', t => {
        const zone = new HyperValue([<a/>, <b />]);
        const res = renderDom(<div>{zone}</div>)[0] as Elem;
        t.is((res.children[0] as Elem).type, 'a', 'content is rendered');
        t.is((res.children[1] as Elem).type, 'b', 'content is updated');
        t.end();
    });



});
