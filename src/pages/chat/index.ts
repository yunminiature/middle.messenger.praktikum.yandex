import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Button } from '../../components/Button';
import { ChatList } from '../../components/ChatList';
import type { ChatItemProps } from '../../components/ChatItem';
import { Avatar } from '../../components/Avatar';
import { MessagesList } from '../../components/MessagesList';
import type { MessageItemProps } from '../../components/MessageItem';
import rawTemplate from './chat.hbs?raw';
import './chat.scss';

const PROFILE_ICON = new URL('/icons/right.svg', import.meta.url).href;
const SETTINGS_ICON = new URL('/icons/setting.svg', import.meta.url).href;
const ATTACHMENTS_ICON = new URL('/icons/attachments.svg', import.meta.url).href;

export interface ActiveChat {
  id: string;
  name: string;
  avatar?: string;
  messages: MessageItemProps[];
}

export interface PageChatProps {
  chats: ChatItemProps[];
  activeChatId?: string;
  activeChat?: ActiveChat;
  onChatSelect?: (chatId: string) => void;
}

export default class PageChat extends Block<PageChatProps> {
  private profileButton?: Button;

  private chatList?: ChatList;

  private settingsButton?: Button;

  private attachmentsButton?: Button;

  private avatar?: Avatar;

  private messagesList?: MessagesList;

  constructor(props: PageChatProps) {
    super('div', props);
  }

  protected init(): void {
    this.createChildren();
  }

  protected componentDidMount(): void {
    this.renderChildrenIntoStubs();
    this.attachHandlers();
  }

  protected componentDidUpdate(): boolean {
    this.createChildren();
    this.renderChildrenIntoStubs();
    this.attachHandlers();
    return false;
  }

  private createChildren() {
    const {
      chats,
      activeChatId,
      activeChat,
    } = this.props;

    this.profileButton = new Button({
      type: 'button',
      view: 'default',
      clear: true,
      text: 'Профиль',
      iconRight: PROFILE_ICON,
      events: {
        click: () => {
          history.pushState({}, '', '/profile');
          window.dispatchEvent(new PopStateEvent('popstate'));
        },
      },
    });

    this.chatList = new ChatList({
      chats: chats,
      activeChatId: activeChatId,
      onChatSelect: (chatId: string) => {
        this.handleChatSelect(chatId);
      },
    });

    if (activeChat) {
      this.avatar = new Avatar({
        src: activeChat.avatar,
        alt: activeChat.name,
        size: 's',
      });

      this.messagesList = new MessagesList({
        messages: activeChat.messages,
      });

      this.settingsButton = new Button({
        type: 'button',
        view: 'default',
        clear: true,
        iconRight: SETTINGS_ICON,
        events: {
          click: () => {
          },
        },
      });

      this.attachmentsButton = new Button({
        type: 'button',
        view: 'default',
        clear: true,
        iconRight: ATTACHMENTS_ICON,
        events: {
          click: () => {
          },
        },
      });
    } else {
      this.avatar = undefined;
      this.messagesList = undefined;
      this.settingsButton = undefined;
      this.attachmentsButton = undefined;
    }
  }

  private handleChatSelect(chatId: string) {
    this.setProps({ activeChatId: chatId });

    if (this.props.onChatSelect) {
      this.props.onChatSelect(chatId);
    }
  }

  private renderChildrenIntoStubs() {
    const content = this.getContent();

    const profileStub = content.querySelector('[data-id="profile-button"]');
    if (profileStub) {
      profileStub.innerHTML = '';
      if (this.profileButton) {
        profileStub.appendChild(this.profileButton.getContent());
      }
    }

    const chatListStub = content.querySelector('[data-id="chatlist"]');
    if (chatListStub) {
      chatListStub.innerHTML = '';
      if (this.chatList) {
        chatListStub.appendChild(this.chatList.getContent());
      }
    }

    const avatarStub = content.querySelector('[data-id="avatar"]');
    if (avatarStub) {
      avatarStub.innerHTML = '';
      if (this.avatar) {
        avatarStub.appendChild(this.avatar.getContent());
      }
    }

    const settingsStub = content.querySelector('[data-id="settings-button"]');
    if (settingsStub) {
      settingsStub.innerHTML = '';
      if (this.settingsButton) {
        settingsStub.appendChild(this.settingsButton.getContent());
      }
    }

    const messagesStub = content.querySelector('[data-id="messageslist"]');
    if (messagesStub) {
      messagesStub.innerHTML = '';
      if (this.messagesList) {
        messagesStub.appendChild(this.messagesList.getContent());
      }
    }

    const attachmentsStub = content.querySelector('[data-id="attachments-button"]');
    if (attachmentsStub) {
      attachmentsStub.innerHTML = '';
      if (this.attachmentsButton) {
        attachmentsStub.appendChild(this.attachmentsButton.getContent());
      }
    }
  }

  private attachHandlers() {
    const content = this.getContent();

    const chatListInstance = this.chatList;

    const searchInput = content.querySelector(
      '[data-id="search-input"]',
    ) as HTMLInputElement | null;

    if (searchInput) {
      searchInput.oninput = (e: Event) => {

        const target = e.target as HTMLInputElement;
        const query = target.value.trim().toLowerCase();

        const allChats = this.props.chats || [];
        const filteredChats = allChats.filter((chat) =>
          chat.name.toLowerCase().includes(query),
        );

        if (chatListInstance) {
          chatListInstance.setProps({ chats: filteredChats });
        }
      };
    }

    const textarea = content.querySelector(
      '[data-id="message-textarea"]',
    ) as HTMLTextAreaElement | null;
    const sendBtn = content.querySelector('[data-id="send-button"]');

    const sendCurrentMessage = () => {
      if (!textarea) return;
      const text = textarea.value.trim();
      if (!text || !this.props.activeChat) return;

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;

      const newMsg: MessageItemProps = {
        text: text,
        time: time,
      };

      textarea.value = '';

      const updatedChat: ActiveChat = {
        ...this.props.activeChat,
        messages: [...this.props.activeChat.messages, newMsg],
      };
      this.setProps({ activeChat: updatedChat });
    };

    if (sendBtn) {
      sendBtn.replaceWith(sendBtn.cloneNode(true));
      const newSend = content.querySelector('[data-id="send-button"]');
      newSend?.addEventListener('click', () => {
        sendCurrentMessage();
      });
    }

    if (textarea) {
      textarea.onkeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendCurrentMessage();
        }
      };
    }
  }

  protected compile(): string {
    const templateFn = Handlebars.compile(rawTemplate);
    return templateFn({
      chats: this.props.chats,
      activeChat: this.props.activeChat,
    });
  }
}
