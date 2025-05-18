export const chatPageProps = {
    profileIcon: new URL('/icons/right.svg', import.meta.url).href,
    settingsIcon: new URL('/icons/setting.svg', import.meta.url).href,
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
            isActive: true,
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

Хассельблад в итоге адаптировал SWC для космоса, но что-то пошло не так и на ракету они так никогда и не попали. Всего их было произведено 25 штук, одну из них недавно продали на аукционе за 45000 евро.`
            },
            {
                id: '1',
                user: 'Вадим',
                content: { isImage: true, src: new URL('../../assets/message.png', import.meta.url).href },
                time: '11:56',
            },
            {
                id: '2',
                text: 'Круто!',
                time: '12:00',
                status: 'read',
            },
        ]
    },
    attachmentsIcon: new URL('/icons/attachments.svg', import.meta.url).href,
};
