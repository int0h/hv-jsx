import test = require('tape');
import {jsx, Component} from '..';
import {mock} from 'hv-jsx-mock';

test('jsx works', t => {
    <div />;
    t.pass('jsx works');
    t.end();
});
