import {Component} from './blocks/component';
import {HyperZone} from './blocks/zone';
import {Dict} from './utils';
import {Target} from './target';
import {tracer} from 'hv';

interface RenderInfo {
    name: string;
    children: RenderInfo[];
    parent: RenderInfo | null;
    time: number;
    isDead?: boolean;
    instance?: DebugObject;
    targetTime?: number;
    report?: FlameReport;
}

let renderStack: RenderInfo | null = {
    name: 'root',
    children: [],
    parent: null,
    time: NaN
};

let childrenRendered = 0;

let targetTime = 0;

declare let performance: {
    now: () => number;
}

if (typeof (global as any).performance === 'undefined') {
    (global as any).performance = {
        now: () => Date.now()
    };
}

// let sourceToComponents: Dict<> = {};

interface FlameReport {
    name: string;
    value: number;
    children?: FlameReport[];
}

function genReport(renderStack: RenderInfo): FlameReport {
    const name = renderStack.name;
    const value = isNaN(renderStack.time)
        ? (renderStack.children || []).reduce((total, cur) => total + cur.time, 0)
        : renderStack.time;

    if (!renderStack.children || renderStack.children.length <= 0) {
        return {name, value}
    }

    const children = renderStack.children.map(genReport);

    return {name, value, children};
}

type DebugObject = Component<any> | HyperZone;

function extractObjectInfo(comp: DebugObject) {
    return (comp.constructor as any).name;
}

function now(): number {
    return Math.round(performance.now() * 100) / 100;
}

function callLog<T>(comp: DebugObject, fn: () => T): T {
    const subInfo = {
        name: extractObjectInfo(comp),
        children: [],
        parent: renderStack,
        time: NaN,
        //isDead: comp.isDead,
        instance: comp
    };

    if (renderStack === null) {
        throw new Error('render stack failed');
    }

    renderStack.children.push(subInfo);
    renderStack = subInfo;

    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();

    childrenRendered++;

    renderStack.time = Math.round((endTime - startTime) * 100) / 100;

    renderStack.targetTime = targetTime + renderStack.children
        .map(child => child.targetTime || 0)
        .reduce((total, cur) => total + cur, 0);
    targetTime = 0;


    renderStack = renderStack.parent;

    if (renderStack === null) {
        throw new Error('render stack failed');
    }

    if (renderStack.parent === null) {
        console.log('children rendered:', childrenRendered);
        childrenRendered = 0;
        renderStack.report = genReport(renderStack);
        console.log(renderStack);
        renderStack = {
            name: 'root',
            children: [],
            parent: null,
            time: NaN,
        }
    }

    return result;
}

export function debugTargetProxy<T extends Target<any, any, any, any>>(target: T): T {
    let result: Dict<Function> = {};

    for (const fnName in target) {
        result[fnName] = function (...args: any[]) {
            const startTime = performance.now();
            const result: any = (target[fnName] as Function).apply(this, args);
            const endTime = performance.now();
            targetTime += endTime - startTime;
            return result;
        }
    }

    return result as any as T;
}

export const renderDebug = tracer.traceMethod(target => (target.constructor as any).name);

// export function renderDebug(target: Object, key: string, descriptor: PropertyDescriptor) {
//     if (descriptor === undefined) {
//         descriptor = Object.getOwnPropertyDescriptor(target, key) as PropertyDescriptor;
//     }

//     const originalMethod = descriptor.value;

//     descriptor.value = function (this: Component<any>, ...args: any[]) {
//         return callLog(this, () => originalMethod.apply(this, args));
//     };

//     return descriptor;

// }

declare const window: any;

window.createReport = createReport;

function createReport(data: FlameReport) {
    const json = JSON.stringify(data);
    const code = `<html>
        <head>
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/spiermar/d3-flame-graph@1.0.4/dist/d3.flameGraph.min.css">
        </head>
        <body>
            <div id="chart"></div>
            <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.10.0/d3.min.js"></script>
            <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.7.1/d3-tip.min.js"></script>
            <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/spiermar/d3-flame-graph@1.0.4/dist/d3.flameGraph.min.js"></script>
            <script type="text/javascript">
            var data = ${json};

            var flamegraph = d3.flameGraph()
                .width(960);

            d3.select("#chart")
                .datum(data)
                .call(flamegraph);
            </script>
        </body>
    </html>`;

    const ifr = window.document.createElement('iframe');
    ifr.setAttribute('width', '100%');
    ifr.setAttribute('height', '1000px');
    window.document.body.appendChild(ifr);
    ifr.contentDocument.write(code);
}

// export function trackComponent
