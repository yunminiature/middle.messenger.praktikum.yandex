import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { ChatItem } from '../ChatItem';
import type { ChatItemProps } from '../ChatItem';
import rawTemplate from './ChatList.hbs?raw';
import './ChatList.scss';

export interface ChatListProps {
  chats: ChatItemProps[];
  activeChatId?: string;
  onChatSelect?: (chatId: string) => void;
  listId?: string;
}

export default class ChatList extends Block<ChatListProps> {
  constructor(props: ChatListProps) {
    const generatedListId = `chat-list-${Math.random().toString(36).slice(2, 9)}`;
    const finalProps: ChatListProps = { ...props, listId: generatedListId };
    super('div', finalProps);
  }

  protected compile(): string {
    const templateFn = Handlebars.compile(rawTemplate);
    return templateFn(this.props);
  }

  protected componentDidMount(): void {
    this.renderChats(this.props.chats);
  }

  protected componentDidUpdate(oldProps: ChatListProps, newProps: ChatListProps): boolean {
    if (newProps.chats !== oldProps.chats || oldProps.activeChatId !== newProps.activeChatId) {
      this.renderChats(newProps.chats);
    }

    return false;
  }

  private renderChats(chats: ChatItemProps[]): void {
    const ul = this.getContent().querySelector<HTMLUListElement>('ul.chat-list');
    if (!ul) {
      console.warn('[ChatList] renderChats: не найден <ul class="chat-list">');
      return;
    }

    ul.innerHTML = '';

    const activeId = this.props.activeChatId;

    chats.forEach((chatProps) => {
      const isActive = chatProps.id === activeId;

      const copyProps: ChatItemProps = {
        ...chatProps,
        isActive,
        events: {
          click: () => {
            this.props.onChatSelect?.(chatProps.id);
          },
        },
      };

      const chatItemInstance = new ChatItem(copyProps);
      ul.appendChild(chatItemInstance.getContent());
    });
  }
}
