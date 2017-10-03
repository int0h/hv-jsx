import {dom} from './dom'
class A {
}

const a = <A a=''/>;


const v = <a href='dsa' u={()=>{}}> asd</a>;

const dyn = (...r: any[]) => {};

const b = dom("div", null)
console.log(<div class='asd' >
    <A text={'foo'}/>
    <b/>
    {
        dyn([], () => {

        })
    }
</div>)

