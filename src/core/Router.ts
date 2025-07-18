import Route from './Route.js';
import Block from './Block.js';
import type { Props } from './Block.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockClass<P extends Props = Props> = new (props?: P) => Block<P>;

class Router {
  private static __instance: Router;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private routes: Array<Route<any>> = [];

  private history!: History;

  private _currentRoute: Route | null = null;

  private _rootQuery!: string;

  constructor(rootQuery: string) {
    if (Router.__instance) {
      return Router.__instance;
    }
    this.history = window.history;
    this._rootQuery = rootQuery;
    Router.__instance = this;
  }

  use<P extends Props = Props>(pathname: string, block: BlockClass<P>): this {
    const route = new Route<P>(pathname, block, { rootQuery: this._rootQuery });
    this.routes.push(route);
    return this;
  }

  start(): void {
    window.onpopstate = () => {
      this._onRoute(window.location.pathname);
    };
    this._onRoute(window.location.pathname);
  }

  private _onRoute(pathname: string) {
    const route = this.getRoute(pathname);
    if (!route) return;

    if (this._currentRoute && this._currentRoute !== route) {
      this._currentRoute.leave();
    }

    this._currentRoute = route;
    route.render();
  }

  go(pathname: string): void {
    this.history.pushState({}, '', pathname);
    this._onRoute(pathname);
  }

  back(): void {
    this.history.back();
  }

  forward(): void {
    this.history.forward();
  }

  getRoute(pathname: string): Route | undefined {
    return this.routes.find(route => route.match(pathname)) ||
            this.routes.find(route => route.match('*'));
  }
}

export default Router;
