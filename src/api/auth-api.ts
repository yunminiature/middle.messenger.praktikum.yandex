import { HTTPTransport } from '../core/HTTPTransport';

const authAPI = new HTTPTransport('https://ya-praktikum.tech/api/v2');

export class AuthAPI {
  static signup(data: Record<string, unknown>) {
    return authAPI.post('/auth/signup', { data, headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
  }

  static signin(data: Record<string, unknown>) {
    return authAPI.post('/auth/signin', { data, headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
  }

  static me() {
    return authAPI.get('/auth/user', { credentials: 'include' });
  }

  static logout() {
    return authAPI.post('/auth/logout', { credentials: 'include' });
  }
}
