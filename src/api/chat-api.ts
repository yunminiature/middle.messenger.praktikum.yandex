import { HTTPTransport } from '../core/HTTPTransport';

const chatAPI = new HTTPTransport('https://ya-praktikum.tech/api/v2', 'include');

export class ChatAPI {
  static getChats() {
    return chatAPI.get('/chats');
  }

  static createChat(title: string) {
    return chatAPI.post('/chats', {
      data: { title },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static getToken(chatId: number) {
    return chatAPI.post(`/chats/token/${chatId}`);
  }

  static searchUser(login: string) {
    return chatAPI.post('/user/search', {
      data: { login },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static addUsersToChat(chatId: number, userIds: number[]) {
    return chatAPI.put('/chats/users', {
      data: { users: userIds, chatId },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static removeUsersFromChat(chatId: number, userIds: number[]) {
    return chatAPI.delete('/chats/users', {
      data: { users: userIds, chatId },
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
