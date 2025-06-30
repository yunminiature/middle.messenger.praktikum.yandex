import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Form } from '../../components/Form';
import type { FormProps } from '../../components/Form';
import rawTemplate from './login.hbs?raw';
import './login.scss';

const compiledTemplate = Handlebars.compile(rawTemplate);

export default class PageLogin extends Block {
  private formInstance?: Form;

  constructor() {
    const formProps: FormProps = {
      title: 'Вход',
      gap: 'wide',
      inputs: [
        {
          type: 'text',
          name: 'login',
          label: 'Логин',
          placeholder: 'Логин',
          labelPlacement: 'top',
          required: true,
        },
        {
          type: 'password',
          name: 'password',
          label: 'Пароль',
          placeholder: 'Пароль',
          labelPlacement: 'top',
          required: true,
        },
      ],
      mainButton: {
        text: 'Войти',
        view: 'accent',
        fullWidth: true,
        type: 'submit',
      },
      secondaryButton: {
        text: 'Регистрация',
        type: 'button',
        view: 'accent',
        clear: true,
        fullWidth: true,
        events: {
          click: () => {
            history.pushState({}, '', '/signup');
            window.dispatchEvent(new PopStateEvent('popstate'));
          },
        },
      },
      onSubmit: (values) => {
        console.log('[PageLogin] onSubmit, получены значения:', values);
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
