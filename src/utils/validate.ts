export function validateField(name: string, value: string): string | null {
  value = value.trim();

  switch (name) {
    case 'first_name':
    case 'second_name': {
      const nameRegex = /^[A-ZА-Я][A-Za-zА-Яа-я-]+$/;
      if (!nameRegex.test(value)) {
        return 'Имя: первая буква заглавная, только буквы и дефис';
      }
      break;
    }

    case 'login': {
      const loginRegex = /^(?=.{3,20}$)(?!\d+$)[a-zA-Z0-9_-]+$/;
      if (!loginRegex.test(value)) {
        return 'Логин: 3–20 символов, латиница, цифры и _-';
      }
      break;
    }

    case 'email': {
      const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(value)) {
        return 'Неверный формат email';
      }
      break;
    }

    case 'password': {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,40}$/;
      if (!passwordRegex.test(value)) {
        return 'Пароль: 8–40 символов, минимум 1 заглавная и цифра';
      }
      break;
    }

    case 'phone': {
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!phoneRegex.test(value)) {
        return 'Телефон: 10–15 цифр, может начинаться с +';
      }
      break;
    }

    case 'message': {
      if (value === '') {
        return 'Сообщение не должно быть пустым';
      }
      break;
    }

    default: {
      if (value === '') {
        return 'Поле не должно быть пустым';
      }
    }
  }

  return null;
}
