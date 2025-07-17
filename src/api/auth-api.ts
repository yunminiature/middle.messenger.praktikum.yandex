import { HTTPTransport } from '../core/HTTPTransport';
import { API_BASE_URL } from './config';

const authAPI = new HTTPTransport(API_BASE_URL);

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
