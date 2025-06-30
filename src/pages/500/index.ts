import Handlebars from 'handlebars';
import Block from '../../core/Block';
import type { Props } from '../../core/Block';
import { Error } from '../../components/Error';
import type { ErrorProps } from '../../components/Error';
import rawTemplate from './500.hbs?raw';
import './500.scss';

const compiledTemplate = Handlebars.compile(rawTemplate);

export default class Page500 extends Block<Props> {
  private errorInstance?: Error;

  constructor(props: Props = {}) {
    super('div', props);
  }

  public render(): DocumentFragment {
    void this;
    const htmlString = compiledTemplate({});
    const temp = document.createElement('template');
    temp.innerHTML = htmlString.trim();
    return temp.content;
  }

  protected componentDidMount(): void {
    const errorProps: ErrorProps = {
      title: '500',
      description: 'О как! Мы уже чиним',
      onBackClick: () => {
        history.pushState({}, '', '/chat');
        window.dispatchEvent(new PopStateEvent('popstate'));
      },
    };

    this.errorInstance = new Error(errorProps);

    const container = this.getContent().querySelector('[data-id="error-stub"]');
    if (container) {
      container.replaceWith(this.errorInstance.getContent());
    }
  }
}
