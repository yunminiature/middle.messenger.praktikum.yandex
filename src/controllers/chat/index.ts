import { ChatAPI } from '../../api/chat-api';
import { ChatSocket } from '../../api/chat-socket';
import { AuthAPI }   from '../../api/auth-api';
import store         from '../../core/Store';
import { router }    from '../../main';

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

  static async connectToChat(
    chatId: number,
    events?: {
      onOpen?: () => void;
      onMessage?: (data: unknown) => void;
      onClose?: () => void;
      onError?: (e: Event) => void;
    },
  ) {
    if (ChatController.chatSocket) {
      ChatController.chatSocket.close();
    }
    const tokenXhr = await ChatAPI.getToken(chatId);
    if (tokenXhr.status !== 200) {
      throw new Error('Ошибка получения токена для чата');
    }
    const { token } = JSON.parse(tokenXhr.response);
    const user = store.get('user') as { id: number } | undefined;
    if (!user?.id) {
      throw new Error('Нет userId');
    }
    ChatController.chatSocket = new ChatSocket(user.id, chatId, token, events);
  }

  static async searchUserByLogin(login: string) {
    const xhr = await ChatAPI.searchUser(login);
    if (xhr.status !== 200) {
      throw new Error('Ошибка при поиске пользователя');
    }
    const users = JSON.parse(xhr.response) as Array<{
      id: number;
      login: string;
      first_name: string;
      second_name: string;
    }>;
    if (users.length === 0) {
      throw new Error(`Пользователь "${login}" не найден`);
    }
    return users[0];
  }

  static async addUserToChat(chatId: number, userId: number) {
    const addXhr = await ChatAPI.addUsersToChat(chatId, [userId]);
    if (addXhr.status !== 200) {
      throw new Error('Не удалось добавить пользователя в чат');
    }
    await this.checkAuthAndLoadChats();
  }

  static async removeUserFromChat(chatId: number, userId: number) {
    const delXhr = await ChatAPI.removeUsersFromChat(chatId, [userId]);
    if (delXhr.status !== 200) {
      throw new Error('Не удалось удалить пользователя из чата');
    }
    await this.checkAuthAndLoadChats();
  }

  static async createChat(title: string) {
    const xhr = await ChatAPI.createChat(title);
    if (xhr.status !== 200) {
      throw new Error('Не удалось создать чат');
    }
    await this.checkAuthAndLoadChats();
  }
}
