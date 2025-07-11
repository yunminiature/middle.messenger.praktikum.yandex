import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Button } from '../../components/Button';
import { ChatList } from '../../components/ChatList';
import { Avatar } from '../../components/Avatar';
import { MessagesList } from '../../components/MessagesList';
import type { ChatItemProps } from '../../components/ChatItem';
import type { MessageItemProps } from '../../components/MessageItem';
import rawTemplate from './chat.hbs?raw';
import './chat.scss';
import { router } from '../../main.ts';
import { ChatController } from '../../controllers/chat';
import store from '../../core/Store';

const PROFILE_ICON = new URL('/icons/right.svg', import.meta.url).href;
const SETTINGS_ICON = new URL('/icons/setting.svg', import.meta.url).href;
const ATTACHMENTS_ICON = new URL('/icons/attachments.svg', import.meta.url).href;

export interface PageChatProps {
  chats: ChatItemProps[];
  activeChatId?: number;
  activeChat?: ChatItemProps & { messages?: MessageItemProps[] };
}

export default class PageChat extends Block<PageChatProps> {
  private profileButton?: Button;

  private chatList?: ChatList;

  private settingsButton?: Button;

  private attachmentsButton?: Button;

  private avatar?: Avatar;

  private messagesList?: MessagesList;

  constructor(props: PageChatProps = { chats: [] }) {
    super('div', props);
  }

  async componentDidMount() {
    await ChatController.initPageChat();

    const chatsFromStore = store.get('chats') ?? [];
    if (chatsFromStore.length && !this.props.activeChatId) {
      const lastChat = chatsFromStore[chatsFromStore.length - 1];
      this.setProps({
        activeChatId: lastChat.id,
        activeChat: { ...lastChat, messages: [] },
      });
    }

    store.on('Updated', () => {
      const updatedChats = store.get('chats');
      const chats: ChatItemProps[] = Array.isArray(updatedChats) ? updatedChats : [];
      let activeChatId = this.props.activeChatId;
      let activeChat = this.props.activeChat;

      if (typeof activeChatId === 'string') {
        activeChatId = Number(activeChatId);
      }

      const found = chats.find((c) => Number(c.id) === Number(activeChatId));
      if (chats.length && activeChatId && found) {
        activeChat = { ...found, messages: activeChat?.messages ?? [] };
      } else if (chats.length) {
        const firstChat = chats[0];
        activeChatId = Number(firstChat.id);
        activeChat = { ...firstChat, messages: [] };
      } else {
        activeChatId = undefined;
        activeChat = undefined;
      }

      const storeMessages = store.get('messages') as MessageItemProps[] || [];
      if (activeChat) {
        activeChat = { ...activeChat, messages: storeMessages };
      }

      this.setProps({ chats, activeChatId, activeChat });
    });
    this.createChildren();
    this.renderChildrenIntoStubs();
    this.attachHandlers();
  }

  protected createChildren() {
    const { chats = [], activeChatId, activeChat } = this.props;

    this.profileButton = new Button({
      type: 'button',
      view: 'default',
      clear: true,
      text: 'Профиль',
      iconRight: PROFILE_ICON,
      events: {
        click: () => {
          router.go('/profile');
          window.dispatchEvent(new PopStateEvent('popstate'));
        },
      },
    });

    this.chatList = new ChatList({
      chats,
      activeChatId,
      onChatSelect: (chatId: number) => {
        this.handleChatSelect(chatId);
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
        events: {},
      });

      this.attachmentsButton = new Button({
        type: 'button',
        view: 'default',
        clear: true,
        iconRight: ATTACHMENTS_ICON,
        events: {},
      });
    } else {
      this.avatar = undefined;
      this.messagesList = undefined;
      this.settingsButton = undefined;
      this.attachmentsButton = undefined;
    }
  }

  private handleChatSelect(chatId: number) {
    if (Number(this.props.activeChatId) === Number(chatId)) {
      // Уже выбран — ничего не делаем!
      return;
    }
    const chat = (this.props.chats || []).find((c) => Number(c.id) === Number(chatId));
    if (chat) {
      ChatController.connectToChat(chatId);
      this.setProps({
        activeChatId: Number(chatId),
        activeChat: { ...chat, messages: [] },
      });
    }
  }

  private renderChildrenIntoStubs() {
    const content = this.getContent();

    const profileStub = content.querySelector('[data-id="profile-button"]');
    if (profileStub && this.profileButton) {
      profileStub.innerHTML = '';
      profileStub.appendChild(this.profileButton.getContent());
    }

    const chatListStub = content.querySelector('[data-id="chatlist"]');
    if (chatListStub && this.chatList) {
      chatListStub.innerHTML = '';
      chatListStub.appendChild(this.chatList.getContent());
    }

    const avatarStub = content.querySelector('[data-id="avatar"]');
    if (avatarStub && this.avatar) {
      avatarStub.innerHTML = '';
      avatarStub.appendChild(this.avatar.getContent());
    }

    const settingsStub = content.querySelector('[data-id="settings-button"]');
    if (settingsStub && this.settingsButton) {
      settingsStub.innerHTML = '';
      settingsStub.appendChild(this.settingsButton.getContent());
    }

    const messagesStub = content.querySelector('[data-id="messageslist"]');
    if (messagesStub && this.messagesList) {
      messagesStub.innerHTML = '';
      messagesStub.appendChild(this.messagesList.getContent());
    }

    const attachmentsStub = content.querySelector('[data-id="attachments-button"]');
    if (attachmentsStub && this.attachmentsButton) {
      attachmentsStub.innerHTML = '';
      attachmentsStub.appendChild(this.attachmentsButton.getContent());
    }
  }

  private attachHandlers() {
    const content = this.getContent();

    const searchInput = content.querySelector('[data-id="search-input"]') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.oninput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const query = target.value.trim().toLowerCase();
        const allChats = this.props.chats || [];
        const filteredChats = allChats.filter((chat) =>
          (chat.title || '').toLowerCase().includes(query),
        );
        this.chatList?.setProps({ chats: filteredChats });
      };
    }

    const textarea = content.querySelector('[data-id="message-textarea"]') as HTMLTextAreaElement | null;
    const sendBtn = content.querySelector('[data-id="send-button"]');

    const sendCurrentMessage = () => {
      if (!textarea) return;
      const text = textarea.value.trim();
      if (!text || !this.props.activeChat) return;
      ChatController.sendMessage(text);
      textarea.value = '';
    };

    if (sendBtn) {
      sendBtn.replaceWith(sendBtn.cloneNode(true));
      const newSend = content.querySelector('[data-id="send-button"]');
      newSend?.addEventListener('click', sendCurrentMessage);
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

  protected componentDidUpdate(): boolean {
    this.createChildren();
    this.renderChildrenIntoStubs();
    this.attachHandlers();
    return true;
  }

  protected compile(): string {
    const templateFn = Handlebars.compile(rawTemplate);
    const activeChat = this.props.activeChat
      ? JSON.parse(JSON.stringify(this.props.activeChat))
      : undefined;
    return templateFn({
      chats: this.props.chats,
      activeChat,
    });
  }
}
