import Block from './Block.js';
import type { Props } from './Block.js';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockClass<P extends Props = Props> = new (props?: P) => Block<P>;

class Route<P extends Props = Props> {
  private _pathname: string;

  private _blockClass: BlockClass<P>;

  private _block: Block<P> | null = null;

  private _props: { rootQuery: string };

  constructor(pathname: string, view: BlockClass<P>, props: { rootQuery: string }) {
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
    this._block.dispatchComponentDidMount?.();
  }

  private static _renderDom(query: string, block: { getContent: () => HTMLElement }) {
    const root = document.querySelector(query);
    if (!root) throw new Error(`Root not found by selector "${query}"`);
    root.innerHTML = '';
    root.appendChild(block.getContent());
  }
}

export default Route;
