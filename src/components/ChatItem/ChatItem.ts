import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Avatar } from '../Avatar';
import rawTemplate from './ChatItem.hbs?raw';
import './ChatItem.scss';

export interface ChatItemProps {
  id: number;
  avatar?: string;
  title: string;
  lastMessage?: {
    user?: string;
    text?: string;
    content?: { type: string };
  };
  updatedAt: string;
  unreadCount?: number;
  isActive?: boolean;
  className?: string;
  events?: {
    click?: (e: Event) => void;
  };
}

export default class ChatItem extends Block {
  private avatarInstance: Avatar;

  private avatarStubId: string;

  constructor(props: ChatItemProps) {
    const stubId = `avatar-stub-${Math.random().toString(36).substring(2, 10)}`;

    const finalProps = {
      ...props,
      avatarStubId: stubId,
    };

    super('li', finalProps);

    this.avatarStubId = stubId;
    this.avatarInstance = new Avatar({
      size: 'm',
      src: props.avatar,
      alt: props.title,
    });
  }

  protected compile(): string {
    const templateFn = Handlebars.compile(rawTemplate);
    const html = templateFn(this.props);
    return html;
  }

  protected componentDidMount(): void {
    const container = this.getContent().querySelector(`[data-id="${this.avatarStubId}"]`);
    if (container) {
      container.replaceWith(this.avatarInstance.getContent());
    } else {
    }
  }

  // Публичный метод для ручного вызова жизненного цикла
  public callComponentDidMount() {
    this.componentDidMount();
  }
}
