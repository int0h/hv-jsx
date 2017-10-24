import {componentTable} from './blocks/component';
import {getAllParents, Dict} from './utils';

let listenedEventTypes: string[] = [];

function listenGlobal(eventType: string) {
    if (listenedEventTypes.indexOf(eventType) !== -1) {
        return;
    }
    listenedEventTypes.push(eventType);
    window.addEventListener(eventType, (event) => {
        const target = event.target as HTMLElement;
        const elms = [target, ...getAllParents(target)];
        for (let elm of elms) {
            const hvId = elm.dataset['hvId'];
            if (!hvId) {
                continue;
            }
            const [componentId, elmId] = hvId.split(':');
            const component = componentTable[Number(componentId)];
            component.domEe.trigger(event, eventType, elmId);
        }

    }, true);
}

export type DomEventHandler = (event: Event) => void;

export class DomEventEmitter {
    private eventsTable: Dict<Dict<DomEventHandler[]>> = {};

    listen(eventType: string, id: string, handler: DomEventHandler) {
        listenGlobal(eventType);
        let elemEvents: Dict<DomEventHandler[]> = this.eventsTable[id];
        if (!elemEvents) {
            elemEvents = {};
            this.eventsTable[id] = elemEvents;
        }
        let handlerList: DomEventHandler[] = elemEvents[eventType];
        if (!handlerList) {
            handlerList = [];
            elemEvents[eventType] = handlerList;
        }
        handlerList.push(handler);
    }

    trigger(event: Event, eventType: string, id: string) {
        let elemEvents: Dict<DomEventHandler[]> = this.eventsTable[id];
        if (!elemEvents) {
            return;
        }
        let handlerList: DomEventHandler[] = elemEvents[eventType];
        if (!handlerList) {
            return
        }
        handlerList.forEach(handler => handler(event));
    }
}
