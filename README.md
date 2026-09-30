# Telegram Chat · GREEN-API

Тестовое задание на должность «Фронтенд разработчик React».

Веб-клиент для отправки и получения текстовых сообщений в **Telegram** через [GREEN-API](https://green-api.com/telegram/).

## Возможности

- Вход по учётным данным инстанса GREEN-API (`apiUrl`, `idInstance`, `apiTokenInstance`)
- Создание чата по номеру телефона получателя
- Отправка текстовых сообщений методом [SendMessage](https://green-api.com/telegram/docs/api/sending/SendMessage/)
- Получение входящих сообщений через HTTP API: [ReceiveNotification](https://green-api.com/telegram/docs/api/receiving/technology-http-api/) + DeleteNotification
- Простой интерфейс в стиле Telegram Web

## Стек

- React 19
- TypeScript
- Vite

## Локальный запуск

### Требования

- Node.js 18+
- Аккаунт [GREEN-API](https://console.green-api.com/) с созданным и **авторизованным** Telegram-инстансом

### Установка и запуск

```bash
git clone <url-репозитория>
cd Test_M_front
npm install
npm run dev
```

Приложение откроется по адресу [http://localhost:5173](http://localhost:5173).

### Демо

https://busel364.github.io/Test_M_front/

### Сборка

```bash
npm run build
npm run preview
```

### Деплой на GitHub Pages

```bash
npm run deploy
```

В GitHub: **Settings → Pages → Branch** = `gh-pages` / folder `/` (Root).

## Как пользоваться

1. Зарегистрируйтесь в [личном кабинете GREEN-API](https://console.green-api.com/)
2. Создайте инстанс для **Telegram** и авторизуйте его (QR или код)
3. В настройках инстанса убедитесь, что:
   - включены уведомления о входящих сообщениях (`incomingWebhook`)
   - поле `webhookUrl` **пустое** (нужно для HTTP API, не webhook)
4. Скопируйте `apiUrl`, `idInstance`, `apiTokenInstance` из кабинета
5. Откройте приложение, введите данные и нажмите «Войти»
6. Создайте чат, указав номер получателя в международном формате (например `79991234567`)
7. Отправьте сообщение — ответ из Telegram появится в чате автоматически (long polling)

## API

| Действие | Метод GREEN-API |
| --- | --- |
| Проверка авторизации | `getStateInstance` |
| Настройка приёма уведомлений | `setSettings` |
| Проверка номера / получение chatId | `checkAccount` |
| Отправка сообщения | `sendMessage` |
| Получение уведомления | `receiveNotification` |
| Подтверждение обработки | `deleteNotification` |

Документация: [green-api.com/telegram/docs](https://green-api.com/telegram/docs/)

## Структура проекта

```
src/
  api/greenApi.ts          # HTTP-клиент GREEN-API
  components/              # UI: логин, сайдбар, чат, модалка
  context/AuthContext.tsx  # Состояние сессии, чатов и сообщений
  hooks/useNotifications.ts # Long polling входящих сообщений
  types/                   # TypeScript-типы
```

## Примечания

- Получение сообщений работает только при пустом `webhookUrl` у инстанса
- Номер телефона указывайте без `+` и пробелов
- Для Telegram рекомендуется получать `chatId` через `checkAccount`; при недоступности метода используется формат `номер@c.us`
