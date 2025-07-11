import { HTTPTransport } from '../core/HTTPTransport';

const userAPI = new HTTPTransport('https://ya-praktikum.tech/api/v2', 'include');

export class UserAPI {
  static updateProfile(data: Record<string, unknown>) {
    return userAPI.put('/user/profile', { data, credentials: 'include' });
  }

  static updateAvatar(data: FormData) {
    return userAPI.put('/user/profile/avatar', { data, credentials: 'include' });
  }

  static updatePassword(data: { oldPassword: string; newPassword: string }) {
    return userAPI.put('/user/password', { data, credentials: 'include' });
  }

  static getUser() {
    return userAPI.get('/auth/user', { credentials: 'include' });
  }
}
