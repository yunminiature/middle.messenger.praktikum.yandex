import { EventBus } from './EventBus';

export const StoreEvents = {
  Updated: 'Updated',
} as const;

function setByPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let curr = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof curr[key] !== 'object' || curr[key] === null) {
      curr[key] = {};
    }
    curr = curr[key] as Record<string, unknown>;
  }
  curr[keys[keys.length - 1]] = value;
}

function getByPath(obj: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>(
    (acc, key) =>
      acc && typeof acc === 'object' && acc !== null
        ? (acc as Record<string, unknown>)[key]
        : undefined,
    obj,
  );
}

export class Store extends EventBus {
  private state: Record<string, unknown> = {};

  private static __instance: Store;

  constructor(defaultState: Record<string, unknown> = {}) {
    if (Store.__instance) {
      return Store.__instance;
    }
    super();

    this.state = defaultState;
    Store.__instance = this;
  }

  public getState() {
    return this.state;
  }

  public set(path: string, value: unknown) {
    setByPath(this.state, path, value);
    this.emit(StoreEvents.Updated, this.state);
  }

  public get(path: string) {
    return getByPath(this.state, path);
  }
}

const store = new Store({});
export default store;
