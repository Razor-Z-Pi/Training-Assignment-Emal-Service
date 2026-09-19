# Training-Assignment-Emal-Service

Training Assignment: Enamel Service / Учебное задание Emal Service

Документация: https://docs.nestjs.com/

Backend на NestJS + frontend на React (Vite + react-bootstrap), реализующий три ключевых сценария:
подключение Gmail через OAuth, предпросмотр шаблона письма с подстановкой переменных и отправку письма
кандидату с собственного Gmail-адреса рекрутера.

---

## Содержание

- [Что реализовано](#что-реализовано)
- [Архитектура](#архитектура)
- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
- [Настройка Google OAuth](#настройка-google-oauth)
- [Переменные окружения](#переменные-окружения)
- [API-контракты](#api-контракты)
  - [Auth](#auth)
  - [Gmail](#gmail-flow-1)
  - [Candidates](#candidates)
  - [Templates](#templates-flow-2)
  - [Emails](#emails-flow-3)
- [Логика работы](#логика-работы)
  - [Flow 1. Подключение Gmail](#flow-1-подключение-gmail)
  - [Flow 2. Предпросмотр письма](#flow-2-предпросмотр-письма)
  - [Flow 3. Отправка письма](#flow-3-отправка-письма)
- [Безопасность](#безопасность)
- [Структура проекта](#структура-проекта)
- [Что можно улучшить](#что-можно-улучшить)

---

## Что реализовано

### Flow 1. Подключение Gmail
- OAuth 2.0 через Google (`passport-google-oauth20` + `googleapis`).
- Кнопка «Подключить Gmail» в настройках.
- После успешного OAuth рекрутер возвращается в продукт и видит, что почта привязана.
- Возможность отвязать Gmail (с отзывом токена в Google).
- Обработка ошибок авторизации (`access_denied`, `invalid_grant`, revoked token).

### Flow 2. Написать и проверить письмо
- Шаблон с переменными вида `{{firstName}}`, `{{projectTitle}}`.
- Live-предпросмотр готового письма с подстановкой реальных данных кандидата.
- Подсветка полей, которых не хватает для отправки.
- Обработка fallback-переменных (`firstName` → `fullName`).
- Явный сигнал «отправлять рано», если чего-то не хватает.

### Flow 3. Отправить письмо
- Отправка письма через Gmail API от имени подключённого аккаунта.
- Журнал отправленных писем со статусами `pending | sent | failed`.
- Различение «не отправилось» и «отправилось, но не записалось».
- Обработка ошибок Gmail (quota, revoked token, provider error).
- Моковые карточки кандидатов с LinkedIn-профилем.

---

## Архитектура

- **Frontend** — Vite dev-server на 5173, проксирует `/api/*` на backend.
- **Backend** — NestJS на 3001, JWT-guard на всех защищённых endpoints.
- **Хранилище** — in-memory (`Map`). в продакшине можно заменить к примеру на Postgres/Redis без изменения контрактов.
- **Шифрование токенов** — AES-256-GCM, ключ из `.env`.

---

## Требования

- **Node.js** 20+ (рекомендуется LTS).
- **npm** 11+ (в npm 10.x есть баг `edgesOut` при установке тяжёлых пакетов; если у тебя 10.x — обнови до 11.x: `npm i -g npm@latest`).
- Аккаунт Google Cloud с созданным OAuth 2.0 Client ID (см. [Настройка Google OAuth](#настройка-google-oauth)).

---

## Быстрый старт

### Установка

```bash
cd Training-Assignment-Email-Service

# backend
cd backend
npm install
Настройка окружения:
cp backend/.env.example backend/.env 
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Запуск: npm run start:dev
Для проверки: curl http://localhost:3001/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com"}'

# frontend
cd ../frontend
npm install
Запуск: npm run dev
