import { AuthAPI } from '../../api/auth-api';
import store from '../../core/Store';
import { router } from '../../main';

export const AuthController = {
  async login(formData: Record<string, string>) {
    try {
      const xhr = await AuthAPI.signin(formData);

      if (xhr.status !== 200) {
        const error = JSON.parse(xhr.response);
        alert(error.reason || 'Ошибка авторизации');
        return;
      }

      const userXhr = await AuthAPI.me();
      if (userXhr.status !== 200) {
        alert('Ошибка получения профиля');
        return;
      }
      const user = JSON.parse(userXhr.response);

      store.set('user', user);

      router.go('/chat');
    } catch {
      alert('Что-то пошло не так при входе');
    }
  },
};
