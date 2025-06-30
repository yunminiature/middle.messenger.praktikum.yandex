/* eslint-disable @typescript-eslint/naming-convention */
import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Form } from '../../components/Form';
import type { InputProps } from '../../components/Input';
import { Button } from '../../components/Button';
import { FileUploadModal } from '../../components';
import rawTemplate from './profile.hbs?raw';
import './profile.scss';

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

  constructor(props: ProfilePageProps) {
    super('div', {
      ...props,
      mode: props.mode || 'view',
    });

    this.uploadModal = new FileUploadModal({
      uploadFn: (file: File) => {
        console.log('[PageProfile avatar edit] получено значение:', file);
        return Promise.resolve();
      },
    });
  }

  protected init(): void {
    this.createFormsAndButtons();
  }

  protected componentDidMount(): void {
    this.renderChildrenIntoStubs();
    this.attachStaticEventHandlers();
  }

  protected componentDidUpdate(): boolean {
    this.createFormsAndButtons();
    this.renderChildrenIntoStubs();
    this.attachStaticEventHandlers();
    return false;
  }

  private createFormsAndButtons() {
    const {
      email,
      login,
      first_name,
      second_name,
      chat_name,
      phone,
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
      onSubmit: (values: Record<string, string>) => {
        console.log('[PageProfile edit] onSubmit, получены значения:', values);
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
      onSubmit: (values: Record<string, string>) => {
        console.log('[PageProfile password edit] onSubmit, получены значения:', values);
        this.setProps({ mode: 'view' });
      },
    });

    this.editDataButton = new Button({
      type: 'button',
      text: 'Изменить данные',
      view: 'accent',
      clear: true,
      events: {
        click: () => {
          this.setProps({ mode: 'editData' });
        },
      },
    });

    this.editPasswordButton = new Button({
      type: 'button',
      text: 'Изменить пароль',
      view: 'accent',
      clear: true,
      events: {
        click: () => {
          this.setProps({ mode: 'editPassword' });
        },
      },
    });

    this.logoutButton = new Button({
      type: 'button',
      text: 'Выйти',
      clear: true,
      warning: true,
      events: {
        click: () => {
          history.pushState({}, '', '/login');
          window.dispatchEvent(new PopStateEvent('popstate'));
        },
      },
    });
  }

  private renderChildrenIntoStubs() {
    const content = this.getContent();

    const actionsList = content.querySelector('[data-id="actions-list"]') as HTMLElement | null;
    if (actionsList) {
      if (this.props.mode === 'view') {
        actionsList.hidden = false;
      } else {
        actionsList.hidden = true;
      }
    }

    const formContainer = content.querySelector('[data-id="form-stub"]');
    if (formContainer) {
      formContainer.innerHTML = '';
      const { mode = 'view' } = this.props;
      let toAppend: HTMLElement | undefined;

      if (mode === 'view' && this.viewForm) {
        toAppend = this.viewForm.getContent();
      } else if (mode === 'editData' && this.editDataForm) {
        toAppend = this.editDataForm.getContent();
      } else if (mode === 'editPassword' && this.editPasswordForm) {
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
        if (this.editDataButton) {
          editDataStub.appendChild(this.editDataButton.getContent());
        }
      }
      if (editPasswordStub) {
        editPasswordStub.innerHTML = '';
        if (this.editPasswordButton) {
          editPasswordStub.appendChild(this.editPasswordButton.getContent());
        }
      }
      if (logoutStub) {
        logoutStub.innerHTML = '';
        if (this.logoutButton) {
          logoutStub.appendChild(this.logoutButton.getContent());
        }
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
          history.pushState({}, '', '/chat');
          window.dispatchEvent(new PopStateEvent('popstate'));
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
