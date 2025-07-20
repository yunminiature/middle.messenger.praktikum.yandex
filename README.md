# Учебный проект
Этот репозиторий содержит учебный проект - мессенджер
За основу взят [макет](https://www.figma.com/design/jF5fFFzgGOxQeB4CmKWTiE/Chat_external_link?node-id=0-1&p=f&t=v5pJtGfWB1ydkjAl-0)

Актуальная сборка ветки `deploy` на [Netlfy](https://idyllic-elf-73eb2f.netlify.app/)
## 🚀 Доступные страницы

- `/login` — Страница входа
- `/signup` — Страница регистрации
- `/chat` — Страница чатов
- `/profile` — Профиль пользователя
- `/404` — Страница "Не найдено"
- `/500` — Страница ошибки сервера

## 🛠️ Команды
```bash
npm run dev                # Запуск проекта в режиме разработки
npm run build              # Сборка проекта
npm run preview            # Просмотр собранного проекта

npm run lint               # Линтинг TypeScript файлов с автофиксами
npm run lint:check         # Проверка линтером без исправления

npm run stylelint          # Линтинг стилей (SCSS/CSS) с автофиксами
npm run stylelint:check    # Проверка стилей без исправления

npm run test               # Запуск тестов (Mocha&Chai)

npm run precommit          # Прекоммит-хук: линтинг + тесты
```
## ⚙️ Стек
- Vite
- SCSS
- TypeScript
- Handlebars
