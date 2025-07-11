import Route from './Route';
import Block from './Block';

export type BlockClass = new (...args: unknown[]) => Block;

class Router {
  private static __instance: Router;

  private routes: Route[] = [];

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

  use(pathname: string, block: BlockClass): this {
    // @ts-expect-error: BlockClass is not strictly assignable to PageConstructor due to protected/public method mismatch
    const route = new Route(pathname, block, { rootQuery: this._rootQuery });
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
