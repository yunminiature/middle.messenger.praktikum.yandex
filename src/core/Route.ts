type PageConstructor = new (...args: unknown[]) => {
  getContent: () => HTMLElement;
  componentDidMount?: () => void;
  hide?: () => void;
};

class Route {
  private _pathname: string;

  private _blockClass: PageConstructor;

  private _block: InstanceType<PageConstructor> | null = null;

  private _props: { rootQuery: string };

  constructor(pathname: string, view: PageConstructor, props: { rootQuery: string }) {
    this._pathname = pathname;
    this._blockClass = view;
    this._props = props;
  }

  match(pathname: string): boolean {
    return pathname === this._pathname;
  }

  leave(): void {
    this._block?.hide?.();
  }

  render(): void {
    this._block = new this._blockClass();
    Route._renderDom(this._props.rootQuery, this._block);
    this._block.componentDidMount?.();
  }

  private static _renderDom(query: string, block: { getContent: () => HTMLElement }) {
    const root = document.querySelector(query);
    if (!root) throw new Error(`Root not found by selector "${query}"`);
    root.innerHTML = '';
    root.appendChild(block.getContent());
  }
}

export default Route;
