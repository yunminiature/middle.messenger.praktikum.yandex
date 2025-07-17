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
import { Dropdown } from '../../components/Dropdown';
import { Modal } from '../../components/Modal';

interface WSMessage {
  chat_id?: number;
  time: string;
  type: string;
  user_id?: string;
  content: string;
  id?: string;
  file?: unknown;
}

function formatTime(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
  );
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

  private addUserModal?: Modal;

  private removeUserModal?: Modal;

  private settingsButton?: Dropdown;

  private attachmentsButton?: Button;

  private avatar?: Avatar;

  private messagesList?: MessagesList;

  private pendingAddUser?: {
    id: number;
    first_name: string;
    second_name: string;
    login: string;
  };

  private pendingRemoveUser?: {
    id: number;
    login: string;
    first_name: string;
    second_name: string;
  };

  private newChatButton?: Button;

  private newChatModal?: Modal;

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

  public componentWillUnmount() {
    store.set('activeChat', undefined);
    store.set('activeChatId', undefined);
    this.setProps({ activeChatId: undefined, activeChat: undefined });
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
          this.componentWillUnmount();
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

    this.newChatButton = new Button({
      type: 'button',
      view: 'default',
      clear: true,
      text: 'Новый чат',
      fullWidth: true,
      events: {
        click: () => this.newChatModal?.show(),
      },
    });

    this.newChatModal = new Modal({
      title: 'Создать новый чат',
      content: `
      <div class="input-wrapper input-wrapper--top">
        <label class="input-label" for="modal-input-chat-title">Название чата</label>
        <input id="modal-input-chat-title" class="input" type="text" />
      </div>
    `,
      buttonText: 'Создать',
      onAction: () => this.handleCreateChat(),
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

      this.settingsButton = new Dropdown({
        trigger: {
          type: 'button',
          view: 'default',
          clear: true,
          iconRight: SETTINGS_ICON,
        },
        items: [
          {
            type: 'button',
            view: 'default',
            clear: true,
            text: 'Добавить пользователя',
            events: {
              click: () => this.addUserModal?.show(),
            },
          },
          {
            type: 'button',
            view: 'default',
            clear: true,
            text: 'Удалить пользователя',
            events: {
              click: () => this.removeUserModal?.show(),
            },
          },
        ],
      });

      this.addUserModal = new Modal({
        title: 'Добавить пользователя',
        content: `
          <div class="input-wrapper input-wrapper--top">
            <label class="input-label" for="modal-input-login">Логин</label>
            <input id="modal-input-login" class="input" type="text"/>
          </div>
        `,
        buttonText: 'Добавить',
        onAction: () => this.handleAddUser(),
      });

      this.removeUserModal = new Modal({
        title: 'Удалить пользователя',
        content: `
          <div class="input-wrapper input-wrapper--top">
            <label class="input-label" for="modal-input-login-del">Логин</label>
            <input id="modal-input-login-del" class="input" type="text" />
          </div>
        `,
        buttonText: 'Удалить',
        onAction: () => this.handleRemoveUser(),
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

    const chats = this.props.chats || [];
    const activeChat = chats.find((c) => c.id === chatId);
    if (activeChat) {
      store.set('activeChat', {
        ...activeChat,
        messages: [],
      });
    }

    ChatController.connectToChat(chatId, {
      onMessage: (data: unknown) => {
        const user = store.get('user') as { id: number } | undefined;
        const myUserId = user?.id;
        let messages: MessageItemProps[] = [];
        const currentActiveChat = store.get('activeChat') as ActiveChat | undefined;
        const prevMessages = currentActiveChat?.messages || [];

        if (Array.isArray(data)) {
          const newMessages = (data as WSMessage[]).map((msg) => ({
            user: msg.user_id,
            text: msg.content,
            time: formatTime(msg.time),
            isMine: msg.user_id === myUserId,
            id: msg.id,
          }));
          const allMessages = [...newMessages, ...prevMessages].reduce<MessageItemProps[]>((acc, msg) => {
            if (!acc.find((m) => m.id === msg.id)) acc.push(msg);
            return acc;
          }, []);
          messages = allMessages;
        } else if (data && typeof data === 'object' && (data as WSMessage).type === 'message') {
          const msg = data as WSMessage;
          const newMsg = {
            user: msg.user_id,
            text: msg.content,
            time: formatTime(msg.time),
            isMine: msg.user_id === myUserId,
            id: msg.id,
          };
          messages = prevMessages.find((m) => m.id === newMsg.id)
            ? prevMessages
            : [newMsg, ...prevMessages];
        }

        const chatsList = this.props.chats || [];
        const foundActiveChat = chatsList.find((c) => c.id === chatId);
        if (foundActiveChat) {
          store.set('activeChat', {
            ...foundActiveChat,
            messages,
          });
        }
      },
    });
  }

  private async handleCreateChat() {
    const modal = this.newChatModal;
    if (!modal) return;

    const input = document.getElementById('modal-input-chat-title') as HTMLInputElement | null;
    const title = input?.value.trim() || '';

    if (!title) {
      modal?.setProps({ errorText: 'Введите название чата' });
      modal?.attachEvents();
      return;
    }

    try {
      await ChatController.createChat(title);
      modal.hide();
    } catch (err: unknown) {
      const msg = isErrorWithMessage(err) ? err.message : 'Не удалось создать';
      modal?.setProps({ errorText: msg });
      modal?.attachEvents();
    }
  }

  private async handleAddUser() {
    const modal = this.addUserModal;
    if (!modal) return;

    if (!this.pendingAddUser) {
      const input = document.getElementById('modal-input-login') as HTMLInputElement | null;
      const login = input?.value.trim() || '';

      if (!login) {
        modal.setProps({ errorText: 'Введите логин' });
        modal.attachEvents();
        return;
      }

      try {
        const user = await ChatController.searchUserByLogin(login);
        this.pendingAddUser = user;

        modal.setProps({
          title: 'Подтвердите',
          content: `<p>Найден ${user.first_name} ${user.second_name}. Добавить?</p>`,
          buttonText: 'Подтвердить',
          errorText: '',
        });
        modal.attachEvents();
      } catch (err: unknown) {
        const errorMessage = isErrorWithMessage(err)
          ? err.message
          : 'Неизвестная ошибка';
        modal.setProps({ errorText: errorMessage });
        modal.attachEvents();
      }

      return;
    }

    try {
      await ChatController.addUserToChat(
        this.props.activeChatId!,
        this.pendingAddUser.id,
      );
      modal.hide();
      this.pendingAddUser = undefined;
    } catch (err: unknown) {
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : 'Неизвестная ошибка';
      modal.setProps({ errorText: errorMessage });
      modal.attachEvents();
    }
  }

  private async handleRemoveUser() {
    const modal = this.removeUserModal;
    if (!modal) return;

    if (!this.pendingRemoveUser) {
      const input = document.getElementById('modal-input-login-del') as HTMLInputElement | null;
      const login = input?.value.trim() || '';

      if (!login) {
        modal.setProps({ errorText: 'Введите логин' });
        modal.attachEvents();
        return;
      }

      try {
        const user = await ChatController.searchUserByLogin(login);
        this.pendingRemoveUser = user;
        modal.setProps({
          title: 'Подтвердите удаление',
          content: `<p>Найден ${user.first_name} ${user.second_name}. Удалить?</p>`,
          buttonText: 'Подтвердить',
          errorText: '',
        });
        modal.attachEvents();
      } catch (err: unknown) {
        const errorMessage = isErrorWithMessage(err)
          ? err.message
          : 'Неизвестная ошибка';
        modal.setProps({ errorText: errorMessage });
        modal.attachEvents();
      }

      return;
    }

    try {
      await ChatController.removeUserFromChat(
        this.props.activeChatId!,
        this.pendingRemoveUser.id,
      );
      modal.hide();
      this.pendingRemoveUser = undefined;
    } catch (err: unknown) {
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : 'Неизвестная ошибка';
      modal.setProps({ errorText: errorMessage });
      modal.attachEvents();
    }
  }

  private updateChatsFromStore() {
    const chatsFromStoreRaw = store.get('chats');
    const chatsFromStore: ChatItemProps[] = Array.isArray(chatsFromStoreRaw) ? chatsFromStoreRaw : [];
    const activeChatId = this.props.activeChatId;
    let activeChat: ActiveChat | undefined = undefined;

    if (activeChatId !== undefined) {
      const chat = chatsFromStore.find((c) => c.id === activeChatId);
      const activeChatFromStore = store.get('activeChat') as ActiveChat | undefined;
      activeChat = activeChatFromStore || (chat ? { ...chat, messages: [] } : undefined);
    }

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

    const newChatStub = content.querySelector('[data-id="new-chat-button"]');
    if (newChatStub) {
      newChatStub.innerHTML = '';
      if (this.newChatButton) {
        newChatStub.appendChild(this.newChatButton.getContent());
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
    const activeChat = this.props.activeChat
      ? JSON.parse(JSON.stringify(this.props.activeChat))
      : undefined;
    return templateFn({
      chats: this.props.chats,
      activeChat,
    });
  }
}
