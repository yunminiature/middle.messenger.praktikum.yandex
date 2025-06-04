import Handlebars from 'handlebars';
import Block from '../../core/Block';
import rawTemplate from './Button.hbs?raw';
import './Button.scss';

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  view?: 'default' | 'accent';
  warning?: boolean;
  clear?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  iconLeft?: string;
  iconRight?: string;
  text?: string;
  className?: string;
  events?: {
    [eventName: string]: (e: Event) => void;
  };
}

export default class Button extends Block {
  constructor(props: ButtonProps) {
    const finalProps: ButtonProps = {
      type: 'button',
      view: 'default',
      ...props,
    };
    super('div', finalProps);
  }

  protected compile(): string {
    const templateFn = Handlebars.compile(rawTemplate);
    return templateFn(this.props);
  }
}
