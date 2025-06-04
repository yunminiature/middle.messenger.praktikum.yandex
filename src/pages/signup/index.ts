import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Form } from '../../components/Form';
import type { FormProps } from '../../components/Form';
import rawTemplate from './signup.hbs?raw';
import './signup.scss';

const compiledTemplate = Handlebars.compile(rawTemplate);

export default class PageSignup extends Block {
  private formInstance?: Form;

  constructor() {
    const formProps: FormProps = {
      title: 'Регистрация',
      gap: 'wide',
      inputs: [
        {
          type: 'email',
          name: 'email',
          label: 'Почта',
          placeholder: 'Почта',
          labelPlacement: 'top',
          required: true,
        },
        {
          type: 'text',
          name: 'login',
          label: 'Логин',
          placeholder: 'Логин',
          labelPlacement: 'top',
          required: true,
        },
        {
          type: 'text',
          name: 'first_name',
          label: 'Имя',
          placeholder: 'Имя',
          labelPlacement: 'top',
          required: true,
        },
        {
          type: 'text',
          name: 'second_name',
          label: 'Фамилия',
          placeholder: 'Фамилия',
          labelPlacement: 'top',
          required: true,
        },
        {
          type: 'tel',
          name: 'phone',
          label: 'Телефон',
          placeholder: 'Телефон',
          labelPlacement: 'top',
          required: true,
        },
        {
          type: 'password',
          name: 'password',
          label: 'Пароль',
          labelPlacement: 'top',
          required: true,
        },
        {
          type: 'password',
          name: 'password_confirm',
          label: 'Пароль (ещё раз)',
          labelPlacement: 'top',
          required: true,
        },
      ],
      mainButton: {
        text: 'Зарегистрироваться',
        type: 'submit',
        view: 'accent',
        fullWidth: true,
      },
      secondaryButton: {
        text: 'Войти',
        type: 'button',
        view: 'accent',
        clear: true,
        fullWidth: true,
        events: {
          click: () => {
            history.pushState({}, '', '/login');
            window.dispatchEvent(new PopStateEvent('popstate'));
          },
        },
      },
      onSubmit: (values) => {
        console.log('[PageSignup] onSubmit, получены значения:', values);
      },
    };

    super('div', { formProps });
  }

  public render(): DocumentFragment {
    void this;
    const htmlString = compiledTemplate({});
    const temp = document.createElement('template');
    temp.innerHTML = htmlString.trim();
    return temp.content;
  }

  protected componentDidMount(): void {
    const { formProps } = this.props as { formProps: FormProps };

    this.formInstance = new Form(formProps);

    const container = this.getContent().querySelector('[data-id="form-stub"]');
    if (container) {
      container.replaceWith(this.formInstance.getContent());
    }
  }
}
