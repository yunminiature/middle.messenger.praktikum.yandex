export const profilePageProps = {
    inputs: [
        { name: 'email', label: 'Почта', type: 'email', labelPlacement: 'left', value: 'pochta@yandex.ru' },
        { name: 'login', label: 'Логин', labelPlacement: 'left', value: 'ivanivanov' },
        { name: 'first_name', label: 'Имя', labelPlacement: 'left', value: 'Иван' },
        { name: 'second_name', label: 'Фамилия', labelPlacement: 'left', value: 'Иванов' },
        { name: 'chat_name', label: 'Имя в чате', labelPlacement: 'left', value: 'Иван' },
        { name: 'phone', label: 'Телефон', type: 'phone', labelPlacement: 'left', value: '+7 (909) 967 30 30' },
    ],
    formMainButton: { text: 'Сохранить',  type: 'submit',  view: 'accent',  fullWidth: true },
}
