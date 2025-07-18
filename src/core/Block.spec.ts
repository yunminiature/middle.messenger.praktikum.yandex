import Block from './Block.js';
import { expect } from 'chai';
import sinon from 'sinon';

type MyProps = {
  text?: string;
  events?: Record<string, (e: Event) => void>;
};

describe('Block', () => {
  class TestBlock extends Block<MyProps> {
    compile() {
      return `<div><span id="output">${this.props.text ?? ''}</span></div>`;
    }

    componentDidMount(): void {
    }
  }


  it('должен создавать компонент с переданными пропсами', () => {
    const block = new TestBlock('div', { text: 'Hello' });
    const span = block.element.querySelector('#output');
    expect(span?.textContent).to.equal('Hello');
  });

  it('должен обновляться при setProps', () => {
    const block = new TestBlock('div', { text: 'Hello' });
    block.setProps({ text: 'Updated' });
    const span = block.element.querySelector('#output');
    expect(span?.textContent).to.equal('Updated');
  });

  it('должен навешивать событие', () => {
    const clickStub = sinon.stub();
    const block = new TestBlock('div', {
      text: 'Click me',
      events: {
        click: clickStub,
      },
    });

    block.element.click();
    expect(clickStub.calledOnce).to.be.true;
  });

  it('должен переключать display: none/block', () => {
    const block = new TestBlock();
    block.hide();
    expect(block.getContent().style.display).to.equal('none');

    block.show();
    expect(block.getContent().style.display).to.equal('block');
  });

  it('должен вызывать componentDidMount', () => {
    const spy = sinon.spy(TestBlock.prototype, 'componentDidMount');
    new TestBlock();
    expect(spy.calledOnce).to.be.true;
    spy.restore();
  });

  it('должен выбрасывать ошибку, если compile не реализован', () => {
    class InvalidBlock extends Block {
    }

    expect(() => {
      const block = new InvalidBlock();
      block.render();
    }).to.throw('Method "compile" must be implemented');
  });
});
