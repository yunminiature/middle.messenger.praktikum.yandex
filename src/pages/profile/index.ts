import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Form } from '../../components/Form';
import type { InputProps } from '../../components/Input';
import { Button } from '../../components/Button';
import { FileUploadModal } from '../../components';
import rawTemplate from './profile.hbs?raw';
import './profile.scss';
import { router } from '../../main.ts';
import store, { StoreEvents } from '../../core/Store';
import { ProfileController } from '../../controllers/profile';
import { AuthAPI } from '../../api/auth-api';

export interface ProfilePageProps {
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  chat_name: string;
  phone: string;
  avatar?: string;
  mode?: 'view' | 'editData' | 'editPassword';
}

export default class ProfilePage extends Block<ProfilePageProps> {
  private viewForm?: Form;

  private editDataForm?: Form;

  private editPasswordForm?: Form;

  private uploadModal: FileUploadModal;

  private editDataButton?: Button;

  private editPasswordButton?: Button;

  private logoutButton?: Button;

  private authApi = new AuthAPI();

  constructor(props: ProfilePageProps = {} as ProfilePageProps) {
    const user = store.get('user') || {};
    let avatar = user.avatar ?? props.avatar;
    if (avatar && !avatar.startsWith('http')) {
      avatar = `https://ya-praktikum.tech/api/v2/resources${avatar}`;
    }

    super('div', { ...user, mode: 'view', ...props, avatar });

    this.uploadModal = new FileUploadModal({
      uploadFn: (file: File) => ProfileController.updateAvatar(file),
    });

    store.on(StoreEvents.Updated, () => {
      const newUser = store.get('user') || {};
      let newAvatar = newUser.avatar;
      if (newAvatar && !newAvatar.startsWith('http')) {
        newAvatar = `https://ya-praktikum.tech/api/v2/resources${newAvatar}`;
      }
      this.setProps({ ...newUser, avatar: newAvatar });
    });
  }

  async componentDidMount() {
    if (!store.get('user')) {
      await ProfileController.fetchProfile();
    }
    if (!store.get('user')) {
      router.go('/login');
      return;
    }
    this.createFormsAndButtons();
    this.renderChildrenIntoStubs();
    this.attachStaticEventHandlers();
  }

  protected componentDidUpdate(): boolean {
    this.createFormsAndButtons();
    this.renderChildrenIntoStubs();
    this.attachStaticEventHandlers();
    return true;
  }

  private createFormsAndButtons() {
    const {
      email = '',
      login = '',
      first_name = '',
      second_name = '',
      chat_name = '',
      phone = '',
    } = this.props;

    const viewInputs: InputProps[] = [
      { name: 'email', type: 'text', label: 'Email', value: email, disabled: true, labelPlacement: 'left' },
      { name: 'login', type: 'text', label: 'Логин', value: login, disabled: true, labelPlacement: 'left' },
      { name: 'first_name', type: 'text', label: 'Имя', value: first_name, disabled: true, labelPlacement: 'left' },
      { name: 'second_name', type: 'text', label: 'Фамилия', value: second_name, disabled: true, labelPlacement: 'left' },
      { name: 'chat_name', type: 'text', label: 'Имя в чате', value: chat_name, disabled: true, labelPlacement: 'left' },
      { name: 'phone', type: 'text', label: 'Телефон', value: phone, disabled: true, labelPlacement: 'left' },
    ];
    this.viewForm = new Form({
      gap: 'dence',
      inputs: viewInputs,
    });

    const editDataInputs: InputProps[] = [
      { name: 'email', type: 'text', label: 'Email', value: email, required: true, labelPlacement: 'left' },
      { name: 'login', type: 'text', label: 'Логин', value: login, required: true, labelPlacement: 'left' },
      { name: 'first_name', type: 'text', label: 'Имя', value: first_name, required: true, labelPlacement: 'left' },
      { name: 'second_name', type: 'text', label: 'Фамилия', value: second_name, required: true, labelPlacement: 'left' },
      { name: 'chat_name', type: 'text', label: 'Имя в чате', value: chat_name, required: true, labelPlacement: 'left' },
      { name: 'phone', type: 'text', label: 'Телефон', value: phone, required: true, labelPlacement: 'left' },
    ];
    this.editDataForm = new Form({
      gap: 'dence',
      inputs: editDataInputs,
      mainButton: {
        type: 'submit',
        text: 'Сохранить',
        view: 'accent',
        fullWidth: true,
      },
      onSubmit: async (values: Record<string, string>) => {
        await ProfileController.updateProfile(values);
        this.setProps({ mode: 'view' });
      },
    });

    const editPasswordInputs: InputProps[] = [
      { name: 'oldPassword', type: 'password', label: 'Старый пароль', required: true, labelPlacement: 'left' },
      { name: 'newPassword', type: 'password', label: 'Новый пароль', required: true, labelPlacement: 'left' },
      { name: 'newPasswordAgain', type: 'password', label: 'Новый пароль еще раз', required: true, labelPlacement: 'left' },
    ];
    this.editPasswordForm = new Form({
      gap: 'dence',
      inputs: editPasswordInputs,
      mainButton: {
        type: 'submit',
        text: 'Сохранить',
        view: 'accent',
        fullWidth: true,
      },
      onSubmit: async (values: Record<string, string>) => {
        await ProfileController.updatePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        });
        this.setProps({ mode: 'view' });
      },
    });

    this.editDataButton = new Button({
      type: 'button',
      text: 'Изменить данные',
      view: 'accent',
      clear: true,
      events: {
        click: () => this.setProps({ mode: 'editData' }),
      },
    });

    this.editPasswordButton = new Button({
      type: 'button',
      text: 'Изменить пароль',
      view: 'accent',
      clear: true,
      events: {
        click: () => this.setProps({ mode: 'editPassword' }),
      },
    });

    this.logoutButton = new Button({
      type: 'button',
      text: 'Выйти',
      clear: true,
      warning: true,
      events: {
        click: async () => {
          await this.authApi.logout();
          store.set('user', null);
          router.go('/login');
        },
      },
    });
  }

  private renderChildrenIntoStubs() {
    const content = this.getContent();

    const actionsList = content.querySelector('[data-id="actions-list"]') as HTMLElement | null;
    if (actionsList) {
      actionsList.hidden = this.props.mode !== 'view';
    }

    const formContainer = content.querySelector('[data-id="form-stub"]');
    if (formContainer) {
      formContainer.innerHTML = '';
      let toAppend: HTMLElement | undefined;

      if (this.props.mode === 'view' && this.viewForm) {
        toAppend = this.viewForm.getContent();
      } else if (this.props.mode === 'editData' && this.editDataForm) {
        toAppend = this.editDataForm.getContent();
      } else if (this.props.mode === 'editPassword' && this.editPasswordForm) {
        toAppend = this.editPasswordForm.getContent();
      }

      if (toAppend) {
        formContainer.appendChild(toAppend);
      }
    }

    const editDataStub = content.querySelector('[data-id="edit-data-stub"]');
    const editPasswordStub = content.querySelector('[data-id="edit-password-stub"]');
    const logoutStub = content.querySelector('[data-id="logout-stub"]');
    if (this.props.mode === 'view') {
      if (editDataStub) {
        editDataStub.innerHTML = '';
        if (this.editDataButton) editDataStub.appendChild(this.editDataButton.getContent());
      }
      if (editPasswordStub) {
        editPasswordStub.innerHTML = '';
        if (this.editPasswordButton) editPasswordStub.appendChild(this.editPasswordButton.getContent());
      }
      if (logoutStub) {
        logoutStub.innerHTML = '';
        if (this.logoutButton) logoutStub.appendChild(this.logoutButton.getContent());
      }
    } else {
      if (editDataStub) editDataStub.innerHTML = '';
      if (editPasswordStub) editPasswordStub.innerHTML = '';
      if (logoutStub) logoutStub.innerHTML = '';
    }
  }

  private attachStaticEventHandlers() {
    const content = this.getContent();

    const backBtn = content.querySelector('[data-id="back-button"]');
    if (backBtn) {
      backBtn.replaceWith(backBtn.cloneNode(true));
      const newBack = content.querySelector('[data-id="back-button"]');
      newBack?.addEventListener('click', () => {
        if (this.props.mode && this.props.mode !== 'view') {
          this.setProps({ mode: 'view' });
        } else {
          router.go('/chat');
        }
      });
    }

    const avatarBtn = content.querySelector('[data-id="avatar-btn"]');
    if (avatarBtn) {
      avatarBtn.replaceWith(avatarBtn.cloneNode(true));
      const newAvatar = content.querySelector('[data-id="avatar-btn"]');
      newAvatar?.addEventListener('click', () => {
        this.uploadModal?.show();
      });
    }
  }

  protected compile(): string {
    const template = Handlebars.compile(rawTemplate);
    return template({
      ...this.props,
      avatar: this.props.avatar,
      first_name: this.props.first_name,
      isView: this.props.mode === 'view',
    });
  }
}
