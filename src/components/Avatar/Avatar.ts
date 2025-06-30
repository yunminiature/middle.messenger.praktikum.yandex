import Handlebars from 'handlebars';
import Block from '../../core/Block';
import rawTemplate from './Avatar.hbs?raw';
import './Avatar.scss';

export interface AvatarProps {
  size: 's' | 'm';
  src?: string;
  alt?: string;
  className?: string;
  events?: {
    click?: (e: Event) => void;
  };
}

export default class Avatar extends Block {
  constructor(props: AvatarProps) {
    super('div', props);
  }

  protected compile(): string {
    const templateFn = Handlebars.compile(rawTemplate);
    return templateFn(this.props);
  }
}
