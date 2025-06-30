import Handlebars from 'handlebars';
import Block from '../../core/Block';
import rawTemplate from './MessageItem.hbs?raw';
import './MessageItem.scss';

export interface MessageItemContent {
  isImage: boolean;
  src: string;
}

export interface MessageItemProps {
  user?: string;
  date?: string;
  text?: string;
  time: string;
  status?: 'sent' | 'read';
  content?: MessageItemContent;
}

export default class MessageItem extends Block {
  constructor(props: MessageItemProps) {
    super('li', props);
  }

  protected compile(): string {
    const templateFn = Handlebars.compile(rawTemplate);
    return templateFn(this.props);
  }
}
