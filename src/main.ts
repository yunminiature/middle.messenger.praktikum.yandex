import * as Pages from './pages';
import './styles/global.scss';

const profileProps = {
  email: 'pochta@yandex.ru',
  login: 'ivanivanov',
  first_name: 'Иван',
  second_name: 'Иванов',
  chat_name: 'Иван',
  phone: '+79099673030',
};

const chatProps = {
  chats: [
    {
      id: '1',
      name: 'Андрей',
      lastMessage: { user: 'Аня', text: '', content: { type: 'Изображение' } },
      updatedAt: '10:49',
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Киноклуб',
      lastMessage: { text: '', content: { type: 'Стикер' } },
      updatedAt: '12:00',
    },
    {
      id: '3',
      name: 'Илья',
      lastMessage: { user: 'Илья', text: 'Друзья, у меня для вас особенный выпуск новостей! Друзья' },
      updatedAt: '15:12',
      unreadCount: 4,
    },
    {
      id: '4',
      name: 'Вадим',
      lastMessage: { text: 'Круто!' },
      updatedAt: 'Пт',
    },
    {
      id: '5',
      name: 'тет-а-теты',
      lastMessage: { user: 'тет-а-теты', text: 'И Human Interface Guidelines и Material Design рекомендуют что-то там' },
      updatedAt: 'Ср',
    },
    {
      id: '6',
      name: '1, 2, 3',
      lastMessage: { user: '1, 2, 3', text: 'Миллионы россиян ежедневно проводят десятки часов своего времени' },
      updatedAt: 'Пн',
    },
    {
      id: '7',
      name: 'Design Destroyer',
      lastMessage: { user: 'Design Destroyer', text: 'В 2008 году художник Jon Rafman начал собирать конструктор' },
      updatedAt: 'Пн',
      unreadCount: 0,
    },
    {
      id: '8',
      name: 'Day.',
      lastMessage: { user: 'Day.', text: 'Так увлёкся работой по курсу, что совсем забыл его анонсировать' },
      updatedAt: '1 Мая 2020',
    },
    {
      id: '9',
      name: 'Стас Рогозин',
      lastMessage: { user: 'Стас Рогозин', text: 'Можно или сегодня или завтра' },
      updatedAt: '12 Апр 2020',
    },
  ],
  activeChatId: '4',
  activeChat: {
    id: '4',
    name: 'Вадим',
    messages: [
      {
        id: '0',
        user: 'Вадим',
        date: '19 июня',
        time: '11:56',
        text: `Привет! Смотри, тут всплыл интересный кусок лунной космической истории — НАСА в какой-то момент попросила Хассельблад адаптировать модель SWC для полетов на Луну. Сейчас мы все знаем что астронавты летали с моделью 500 EL — и к слову говоря, все тушки этих камер все еще находятся на поверхности Луны, так как астронавты с собой забрали только кассеты с пленкой.

Хассельблад в итоге адаптировал SWC для космоса, но что-то пошло не так и на ракету они так никогда и не попали. Всего их было произведено 25 штук, одну из них недавно продали на аукционе за 45000 евро.`,
      },
      {
        id: '1',
        user: 'Вадим',
        content: { isImage: true, src: 'message.png' },
        time: '11:56',
      },
      {
        id: '2',
        text: 'Круто!',
        time: '12:00',
        status: 'read',
      },
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageClass = new (props?: any) => { getContent: () => HTMLElement };

const pages: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
[PageClass, Record<string, any>?]
> = {
  login: [Pages.PageLogin],
  signup: [Pages.PageSignup],
  chat: [Pages.PageChat, chatProps],
  profile: [Pages.PageProfile, profileProps],
  '404': [Pages.Page404],
  '500': [Pages.Page500],
};

function navigate(path: string) {
  const pageKey = path.replace('/', '') || 'login';

  const pageEntry = pages[pageKey] || pages['404'];
  const PageConstructor = pageEntry[0];
  const props = pageEntry[1] || {};

  const pageInstance = new PageConstructor(props);

  const root = document.getElementById('app');
  if (root) {
    root.innerHTML = '';
    root.appendChild(pageInstance.getContent());
  }
}

window.addEventListener('popstate', () => {
  navigate(window.location.pathname);
});

window.addEventListener('DOMContentLoaded', () => {
  navigate(window.location.pathname);
});
