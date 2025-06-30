import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { MessageItem } from '../MessageItem';
import type { MessageItemProps } from '../MessageItem';
import rawTemplate from './MessagesList.hbs?raw';
import './MessagesList.scss';

export interface MessagesListProps {
  messages: MessageItemProps[];
  listStubId?: string;
}

export default class MessagesList extends Block {
  constructor(props: MessagesListProps) {
    const stubId = `messages-list-${Math.random().toString(36).substring(2, 9)}`;

    const finalProps: MessagesListProps = {
      ...props,
      listStubId: stubId,
    };

    super('div', finalProps);
  }

  protected compile(): string {
    const templateFn = Handlebars.compile(rawTemplate);
    return templateFn(this.props);
  }

  protected componentDidMount(): void {
    const listIdFromProps = (this.props).listStubId as string;

    const listContainer = this.getContent().querySelector<HTMLUListElement>(
      `ul[data-id="${listIdFromProps}"]`,
    );

    if (!listContainer) {
      return;
    }

    const messages = (this.props).messages as MessageItemProps[];
    if (!Array.isArray(messages) || messages.length === 0) {
      return;
    }

    messages.forEach((msgProps) => {
      const msgItemInstance = new MessageItem(msgProps);
      listContainer.appendChild(msgItemInstance.getContent());
    });
  }
}
