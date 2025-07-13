import { ChatAPI } from '../../api/chat-api';
import { ChatSocket } from '../../api/chat-socket';
import { AuthAPI } from '../../api/auth-api';
import store from '../../core/Store';
import { router } from '../../main';

export class ChatController {
  static async checkAuthAndLoadChats() {
    let user = store.get('user');
    if (!user) {
      try {
        const userXhr = await AuthAPI.me();
        if (userXhr.status !== 200) {
          router.go('/login');
          return;
        }
        user = JSON.parse(userXhr.response);
        store.set('user', user);
      } catch {
        router.go('/login');
        return;
      }
    }
    try {
      const xhr = await ChatAPI.getChats();
      if (xhr.status !== 200) {
        throw new Error('Ошибка загрузки чатов');
      }
      const chats = JSON.parse(xhr.response);
      store.set('chats', chats);
    } catch {
      router.go('/login');
    }
  }

  static chatSocket: ChatSocket | null = null;

  static async connectToChat(chatId: number, events?: {
    onOpen?: () => void;
    onMessage?: (data: unknown) => void;
    onClose?: () => void;
    onError?: (e: Event) => void;
  }) {
    if (ChatController.chatSocket) {
      ChatController.chatSocket.close();
    }
    const tokenXhr = await ChatAPI.getToken(chatId);
    if (tokenXhr.status !== 200) {
      throw new Error('Ошибка получения токена для чата');
    }
    const { token } = JSON.parse(tokenXhr.response);
    const user = store.get('user') as { id: number } | undefined;
    if (!user || !user.id) {
      throw new Error('Нет userId');
    }
    ChatController.chatSocket = new ChatSocket(user.id, chatId, token, events);
  }
}
