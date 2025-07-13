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
import { ChatController } from '../../controllers/chat';
import store, { StoreEvents } from '../../core/Store';

interface WSMessage {
  chat_id?: number;
  time: string;
  type: string;
  user_id?: string;
  content: string;
  id?: string;
  file?: unknown;
}

const PROFILE_ICON = new URL('/icons/right.svg', import.meta.url).href;
const SETTINGS_ICON = new URL('/icons/setting.svg', import.meta.url).href;
const ATTACHMENTS_ICON = new URL('/icons/attachments.svg', import.meta.url).href;

export interface ActiveChat {
  id: number;
  title: string;
  avatar?: string;
  messages: MessageItemProps[];
}

export interface PageChatProps {
  chats: ChatItemProps[];
  activeChatId?: number;
  activeChat?: ActiveChat;
  onChatSelect?: (chatId: number) => void;
}

export default class PageChat extends Block<PageChatProps> {
  private profileButton?: Button;

  private chatList?: ChatList;

  private settingsButton?: Button;

  private attachmentsButton?: Button;

  private avatar?: Avatar;

  private messagesList?: MessagesList;

  constructor(props?: PageChatProps) {
    super('div', { chats: [], ...props });
  }

  protected async componentDidMount(): Promise<void> {
    await ChatController.checkAuthAndLoadChats();
    this.updateChatsFromStore();
    store.on(StoreEvents.Updated, this.updateChatsFromStore.bind(this));
    this.createChildren();
    this.renderChildrenIntoStubs();
    this.attachHandlers();
  }

  protected componentDidUpdate(oldProps: PageChatProps, newProps: PageChatProps): boolean {
    if (oldProps.activeChatId !== newProps.activeChatId) {
      this.updateChatsFromStore();
    }
    this.createChildren();
    setTimeout(() => {
      this.renderChildrenIntoStubs();
      this.attachHandlers();
    }, 0);
    return true;
  }

  private createChildren() {
    const {
      chats = [],
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
      chats,
      activeChatId,
      onChatSelect: (chatId: number | string) => {
        const id = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
        this.handleChatSelect(id);
      },
    });

    if (activeChat) {
      this.avatar = new Avatar({
        src: activeChat.avatar,
        alt: activeChat.title,
        size: 's',
      });

      this.messagesList = new MessagesList({
        messages: activeChat.messages || [],
      });

      this.settingsButton = new Button({
        type: 'button',
        view: 'default',
        clear: true,
        iconRight: SETTINGS_ICON,
        events: {
          click: () => {},
        },
      });

      this.attachmentsButton = new Button({
        type: 'button',
        view: 'default',
        clear: true,
        iconRight: ATTACHMENTS_ICON,
        events: {
          click: () => {},
        },
      });
    } else {
      this.avatar = undefined;
      this.messagesList = undefined;
      this.settingsButton = undefined;
      this.attachmentsButton = undefined;
    }
  }

  private async handleChatSelect(chatId: number) {
    this.setProps({ activeChatId: chatId });
    ChatController.connectToChat(chatId, {
      onMessage: (data: unknown) => {
        let messages: MessageItemProps[] = [];
        if (Array.isArray(data)) {
          messages = (data as WSMessage[]).map((msg) => ({
            user: msg.user_id,
            text: msg.content,
            time: msg.time || '',
          }));
        } else if (data && typeof data === 'object' && (data as WSMessage).type === 'message') {
          const msg = data as WSMessage;
          messages = [
            {
              user: msg.user_id,
              text: msg.content,
              time: msg.time || '',
            },
          ];
        }
        // Обновляем store для activeChat
        const chats = this.props.chats || [];
        const activeChat = chats.find((c) => c.id === chatId);
        if (activeChat) {
          store.set('activeChat', {
            ...activeChat,
            messages,
          });
        }
      },
    });
  }

  private updateChatsFromStore() {
    const chatsFromStoreRaw = store.get('chats');
    const chatsFromStore: ChatItemProps[] = Array.isArray(chatsFromStoreRaw) ? chatsFromStoreRaw : [];
    const activeChatId = this.props.activeChatId;
    const chat = chatsFromStore.find((c) => c.id === activeChatId);
    const activeChatFromStore = store.get('activeChat') as ActiveChat | undefined;
    const activeChat: ActiveChat | undefined = activeChatFromStore || (chat ? { ...chat, messages: [] } : undefined);
    this.setProps({ chats: chatsFromStore, activeChat });
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
          chat.title.toLowerCase().includes(query),
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

      if (ChatController.chatSocket) {
        ChatController.chatSocket.send({
          type: 'message',
          content: text,
        });
      }

      textarea.value = '';
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
    // Снимаем Proxy с activeChat, если он есть
    const activeChat = this.props.activeChat
      ? JSON.parse(JSON.stringify(this.props.activeChat))
      : undefined;
    return templateFn({
      chats: this.props.chats,
      activeChat,
    });
  }
}
