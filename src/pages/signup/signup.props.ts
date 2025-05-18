export const signupPageProps = {
    title: 'Регистрация',
    inputs: [
        { name: 'email', label: 'Почта', placeholder: 'Почта', type: 'email', labelPlacement: 'top', value: 'pochta@yandex.ru', required: true },
        { name: 'login', label: 'Логин', placeholder: 'Логин', labelPlacement: 'top', value: 'ivanivanov', required: true },
        { name: 'first_name', label: 'Имя', placeholder: 'Имя', labelPlacement: 'top', value: 'Иван', required: true },
        { name: 'second_name', label: 'Фамилия', placeholder: 'Фамилия', labelPlacement: 'top', value: 'Иванов', required: true },
        { name: 'phone', label: 'Телефон', placeholder: 'Телефон', type: 'tel', labelPlacement: 'top', value: '+7 (909) 967 30 30', required: true },
        { name: 'password', label: 'Пароль', type: 'password', error: true, labelPlacement: 'top', value: '12345678', required: true },
        { name: 'password_confirm', label: 'Пароль (ещё раз)', type: 'password', error: true, errorText: 'Пароли не совпадают', labelPlacement: 'top', value: '1234567', required: true },
    ],
    mainButton: {
        text: 'Зарегистрироваться',
        type: 'submit',
        view: 'accent',
        fullWidth: true
    },
    secondaryButton: {
        text: 'Войти',
        type: 'button',
        view: 'accent',
        clear: true,
        fullWidth: true
    }
};
