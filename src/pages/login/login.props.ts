export const loginPageProps = {
    title: 'Вход',
    inputs: [
        { name: 'login', label: 'Логин', placeholder: 'Логин', error: true, errorText: 'Неправильный логин', labelPlacement: 'top', value: 'ivanivanov', required: true },
        { name: 'password', label: 'Пароль', placeholder: 'Пароль', type: 'password', labelPlacement: 'top', value: '12345678', required: true }
    ],
    mainButton: { text: 'Войти', view: 'accent', fullWidth: true },
    secondaryButton: { text: 'Регистрация', type: 'button', view: 'accent', clear: true, fullWidth: true }
};
