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
}
