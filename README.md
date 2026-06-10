# КБЖУ-трекер — PWA

Прогрессивное веб-приложение для отслеживания калорий и БЖУ.

## Быстрый старт

```bash
npm install
npm run dev
```

Откроется `http://localhost:5173`.

## Сборка для деплоя

```bash
npm run build
```

Результат в папке `dist/` — это статические файлы, которые можно залить на любой хостинг.

## Деплой на GitHub Pages

1. Пуш в репозиторий на GitHub
2. В настройках репозитория → Pages → Source: **GitHub Actions**
3. Или используй [Vite deploy guide](https://vitejs.dev/guide/static-deploy.html#github-pages)

## Структура проекта

```
my-pwa/
├── public/
│   ├── manifest.json       PWA-манифест
│   └── icons/icon.svg      Иконка приложения
├── src/
│   ├── state.js            Глобальное состояние + БД продуктов и тренировок
│   ├── calc.js             Формулы КБЖУ: TDEE, норма, адаптивная коррекция
│   ├── utils.js            DOM-хелперы, анимации, конвертация единиц
│   ├── main.js             Точка входа: инициализация, переключение вкладок
│   ├── pages/
│   │   ├── onboarding.js   Онбординг (5 шагов + результат)
│   │   ├── plan.js         Дневник еды и тренировок
│   │   ├── progress.js     График веса, коррекция нормы
│   │   ├── coach.js        Сообщения коуча
│   │   └── profile.js      Профиль пользователя, настройки
│   ├── components/
│   │   └── sheets.js       Боттом-шиты: еда, тренировка, вес
│   └── styles/
│       └── main.css        Все стили (glassmorphism, анимации)
├── index.html
├── vite.config.js
└── package.json
```

## Технологии

- **Vite** — сборщик и dev-сервер
- **vite-plugin-pwa** — Service Worker, Web App Manifest
- Ванильный JavaScript (ES modules), без фреймворков

## Следующие шаги

- Заменить `prompt()` на нормальный UI для ввода граммовки (см. ИДЕИ_BACKLOG.md)
- Подключить LocalStorage для сохранения данных между сессиями
- Добавить Capacitor для нативных iOS/Android сборок
