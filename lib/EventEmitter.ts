export class EventEmitter {
    private _listeners: Record<string, EventListener[]> | undefined;
    public addEventListener(type: string, listener: EventListener): void {
        if (this._listeners === undefined) this._listeners = {};
        const listeners = this._listeners;
        if (listeners[type] === undefined) {
            listeners[type] = [];
        }

        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    }
    public hasEventListener(type: string, listener: EventListener): boolean {
        if (this._listeners === undefined) return false;
        const listeners = this._listeners;
        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
    }
    public removeEventListener(type: string, listener: EventListener): void {
        if (this._listeners === undefined) return;
        const listeners = this._listeners;
        const listenerArray = listeners[type];
        if (listenerArray !== undefined) {
            const index = listenerArray.indexOf(listener);
            if (index !== -1) {
                listenerArray.splice(index, 1);
            }
        }
    }
    public dispatchEvent(event: CustomEvent<unknown>): void {
        if (this._listeners === undefined) return;
        const listeners = this._listeners;
        const listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
            //event.target = this;
            const array = listenerArray.slice(0);
            for (let i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
            }
        }
    }
}