import { expect } from 'chai';
import sinon from 'sinon';
import Router from './Router.js';
import Route from './Route.js';
import Block, { type Props } from './Block.js';

describe('Router', () => {
  class DummyBlock extends Block {
    constructor(props?: Props) {
      super('div', props);
    }

    compile() {
      return '<div>Dummy</div>';
    }
  }


  beforeEach(() => {
    (Router as unknown as { __instance?: unknown }).__instance = undefined;
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('должен рендерить правильный Route при переходе', () => {
    const router = new Router('#app');
    const renderSpy = sinon.spy(Route.prototype, 'render');

    router.use('/test', DummyBlock);
    router.start();
    router.go('/test');

    expect(renderSpy.called).to.be.true;
    renderSpy.restore();
  });

  it('должен вызывать leave у предыдущего Route', () => {
    const router = new Router('#app');

    class FirstPage extends Block {
      constructor(props?: Props) {
        super('div', props);
      }

      compile() {
        return '<div>First</div>';
      }
    }

    class SecondPage extends Block {
      constructor(props?: Props) {
        super('div', props);
      }

      compile() {
        return '<div>Second</div>';
      }
    }

    const leaveSpy = sinon.spy(Route.prototype, 'leave');

    router.use('/first', FirstPage);
    router.use('/second', SecondPage);
    router.start();
    router.go('/first');
    router.go('/second');

    expect(leaveSpy.called).to.be.true;
    leaveSpy.restore();
  });

  it('go должен обновлять location.pathname', () => {
    const router = new Router('#app');
    router.use('/abc', DummyBlock);
    router.start();
    router.go('/abc');

    expect(window.location.pathname).to.eq('/abc');
  });

  it('getRoute должен возвращать Route по пути', () => {
    const router = new Router('#app');
    router.use('/foo', DummyBlock);

    const route = router.getRoute('/foo');
    expect(route).to.not.be.undefined;
    expect(route?.match('/foo')).to.be.true;
  });
});
