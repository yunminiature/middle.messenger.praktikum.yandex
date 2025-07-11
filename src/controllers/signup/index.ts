import { AuthAPI } from '../../api/auth-api';
import store from '../../core/Store';
import { router } from '../../main';

export const AuthController = {
  async signup(formData: Record<string, unknown>) {
    try {
      const xhr = await AuthAPI.signup(formData);

      if (xhr.status !== 200) {
        const error = JSON.parse(xhr.response);
        alert(error.reason || 'Ошибка регистрации');
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
      alert('Что-то пошло не так при регистрации');
    }
  },
};
