import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Button } from '../Button';
import type { ButtonProps } from '../Button';
import rawTemplate from './Error.hbs?raw';
import './Error.scss';

export interface ErrorProps {
  title: string;
  description: string;
  onBackClick?: (e: Event) => void;
  buttonStubId?: string;
}

const templateFn = Handlebars.compile(rawTemplate);

export default class Error extends Block {
  private buttonInstance!: Button;

  constructor(props: ErrorProps) {
    const stubId = `error-btn-stub-${Math.random().toString(36).substring(2, 10)}`;

    const finalProps: ErrorProps = {
      ...props,
      buttonStubId: stubId,
    };

    super('div', finalProps);
  }

  protected init(): void {
    const { onBackClick } = this.props as ErrorProps;

    const buttonProps: ButtonProps = {
      text: 'Назад к чатам',
      view: 'accent',
      clear: true,
      type: 'button',
      events: {
        click: onBackClick ?? (() => {}),
      },
    };
    this.buttonInstance = new Button(buttonProps);
  }

  protected compile(): string {
    return templateFn(this.props);
  }

  protected componentDidMount(): void {
    const { buttonStubId } = this.props as ErrorProps;
    const container = this.getContent().querySelector(`[data-id="${buttonStubId}"]`);
    if (container) {
      container.replaceWith(this.buttonInstance.getContent());
    }
  }
}
