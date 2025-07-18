import { EventBus } from './EventBus.js';

export type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  events?: Record<string, (e: Event) => void>;
};

export default class Block<P extends Props = Props> {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_RENDER: 'flow:render',
    FLOW_CDU: 'flow:component-did-update',
  };

  private _element: HTMLElement | null = null;

  private _meta: { tagName: string; props: P };

  protected props: P;

  private _id = String(Math.random());

  private eventBus: EventBus;

  constructor(tagName = 'div', props: P = {} as P) {
    this._meta = { tagName, props };
    this.props = this._makePropsProxy(props);
    this.eventBus = new EventBus();
    this._registerEvents();
    this.eventBus.emit(Block.EVENTS.INIT);
  }

  private _registerEvents() {
    this.eventBus.on(Block.EVENTS.INIT, this._init.bind(this));
    this.eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
    this.eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    this.eventBus.on(
      Block.EVENTS.FLOW_CDU,
      this._componentDidUpdate.bind(this) as (...args: unknown[]) => void,
    );
  }

  private _init() {
    this._createResources();
    this.init();
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    this._addEvents();
    this.eventBus.emit(Block.EVENTS.FLOW_CDM);
  }

  protected init(): void {
    void this;
  }

  private _createResources() {
    this._element = this._createDocumentElement(this._meta.tagName);
  }

  private _createDocumentElement(tagName: string): HTMLElement {
    const el = document.createElement(tagName);
    el.setAttribute('data-id', this._id);
    return el;
  }

  private _addEvents() {
    const events = this.props.events;
    if (!events || !this._element) return;
    Object.entries(events).forEach(([event, listener]) => {
      this._element!.addEventListener(event, listener);
    });
  }

  private _removeEvents() {
    const events = this.props.events;
    if (!events || !this._element) return;
    Object.entries(events).forEach(([event, listener]) => {
      this._element!.removeEventListener(event, listener);
    });
  }

  public setProps = (nextProps: Partial<P>) => {
    if (!nextProps) return;
    const oldProps = { ...this.props };
    Object.assign(this.props, nextProps);
    this.eventBus.emit(Block.EVENTS.FLOW_CDU, oldProps, this.props);
  };

  private _componentDidUpdate(oldProps: P, newProps: P) {
    const shouldUpdate = this.componentDidUpdate(oldProps, newProps);
    if (shouldUpdate) {
      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected componentDidUpdate(_oldProps: P, _newProps: P): boolean {
    void this;
    return true;
  }

  private _componentDidMount() {
    this.componentDidMount();
  }

  protected componentDidMount(): void {
    void this;
  }

  public dispatchComponentDidMount(): void {
    this.componentDidMount();
  }

  private _render() {
    const fragment = this.render();
    if (this._element) {
      this._removeEvents();
      this._element.innerHTML = '';
      this._element.appendChild(fragment);
      this._addEvents();
    }
  }

  public get element(): HTMLElement {
    return this._element!;
  }

  public render(): DocumentFragment {
    const templateString = this.compile();
    const temp = document.createElement('template');
    temp.innerHTML = templateString;
    return temp.content;
  }

  protected compile(): string {
    void this;
    throw new Error('Method "compile" must be implemented');
  }

  private _makePropsProxy(props: P): P {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return new Proxy(props, {
      get(target, prop: string) {
        const value = target[prop as keyof P];
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set(target, prop: string, value) {
        const oldProps = { ...target };
        target[prop as keyof P] = value;
        self.eventBus.emit(Block.EVENTS.FLOW_CDU, oldProps, target);
        return true;
      },
      deleteProperty() {
        throw new Error('Access denied');
      },
    });
  }

  public getContent(): HTMLElement {
    return this.element;
  }

  public show() {
    this.getContent().style.display = 'block';
  }

  public hide() {
    this.getContent().style.display = 'none';
  }
}
