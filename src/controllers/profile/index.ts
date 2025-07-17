import { UserAPI } from '../../api/user-api';
import store from '../../core/Store';
import { router } from '../../main';

export class ProfileController {
  static async fetchProfile() {
    try {
      const res = await UserAPI.getUser();
      const data = JSON.parse(res.response);
      store.set('user', data);
      return data;
    } catch {
      router.go('/login');
    }
  }

  static async updateProfile(data: Record<string, unknown>) {
    await UserAPI.updateProfile(data);
    await ProfileController.fetchProfile();
  }

  static async updateAvatar(file: File) {
    const fd = new FormData();
    fd.append('avatar', file);
    await UserAPI.updateAvatar(fd);
    await ProfileController.fetchProfile();
  }

  static async updatePassword(data: { oldPassword: string; newPassword: string }) {
    await UserAPI.updatePassword(data);
  }
}
