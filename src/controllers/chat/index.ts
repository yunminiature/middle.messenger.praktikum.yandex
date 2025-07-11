import { ChatAPI } from '../../api/chat-api';
import { AuthAPI } from '../../api/auth-api';
import store from '../../core/Store';
import { router } from '../../main';
import { ChatSocket } from '../../api/chat-socket';

let chatSocket: ChatSocket | null = null;

export const ChatController = {
  async checkAuthOrRedirect() {
    try {
      const userXhr = await AuthAPI.me();
      if (userXhr.status !== 200) throw new Error('Нет авторизации');
      const user = JSON.parse(userXhr.response);
      store.set('user', user);
      return true;
    } catch {
      router.go('/signup');
      return false;
    }
  },

  async fetchChats() {
    try {
      const chatsXhr = await ChatAPI.getChats();
      if (chatsXhr.status !== 200) throw new Error('Ошибка получения чатов');
      const chats = JSON.parse(chatsXhr.response);
      store.set('chats', chats);
      this.connectToFirstChat();
    } catch {
      alert('Не удалось получить чаты');
    }
  },

  sendMessage(content: string) {
    if (chatSocket) {
      chatSocket.send({
        type: 'message',
        content,
      });
    }
  },

  handleIncomingMessage(data: unknown) {
    const messagesRaw = store.get('messages');
    const messages: unknown[] = Array.isArray(messagesRaw) ? messagesRaw : [];
    if (Array.isArray(data)) {
      store.set('messages', data.concat(messages));
    } else if (data && typeof data === 'object' && 'type' in data && (data as { type?: unknown }).type === 'message') {
      store.set('messages', messages.concat([data]));
    } else {
      store.set('messages', messages);
    }
  },

  connectToFirstChat() {
    const chats = store.get('chats');
    if (Array.isArray(chats) && chats.length > 0) {
      const firstChatId = chats[0].id;
      if (chatSocket) {
        chatSocket.close();
      }
      chatSocket = new ChatSocket(firstChatId, {
        onMessage: (data: unknown) => {
          this.handleIncomingMessage(data);
        },
      });
    }
  },

  connectToChat(chatId: number) {
    if (chatSocket) {
      chatSocket.close();
    }
    chatSocket = new ChatSocket(chatId, {
      onMessage: (data: unknown) => {
        this.handleIncomingMessage(data);
      },
    });
  },

  async initPageChat() {
    const authed = await this.checkAuthOrRedirect();
    if (!authed) return;
    await this.fetchChats();
  },
};
