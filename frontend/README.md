# UGC Frontend (Vite + React)

Новый фронтенд для UGC компании, переведенный с Next.js на Vite + React для улучшения производительности и упрощения архитектуры.

## Технологии

- **Vite** - современный и быстрый инструмент сборки
- **React 18** - для создания пользовательского интерфейса  
- **React Router** - для роутинга
- **Framer Motion** - для анимаций
- **Tailwind CSS** - для стилизации
- **Axios** - для API запросов

## Запуск проекта

1. Установить зависимости:
```bash
npm install
```

2. Создать файл окружения:
```bash
cp .env.example .env
```

3. Запустить development сервер:
```bash
npm run dev
```

4. Открыть http://localhost:3000 в браузере

## Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
├── pages/              # Страницы приложения
├── context/            # React контексты
├── services/           # API сервисы
├── styles/             # Стили
└── main.jsx           # Точка входа

public/
├── locales/           # Файлы переводов
└── images/           # Статические изображения
```

## API Integration

Фронтенд интегрирован с Django backend через REST API. Все эндпоинты:

- `/api/v1/homepage/` - данные главной страницы
- `/api/v1/about/` - информация о компании  
- `/api/v1/services/` - услуги
- `/api/v1/projects/` - проекты/портфолио
- `/api/v1/jobs/` - вакансии
- `/api/v1/offices/` - офисы
- `/api/v1/translations/{lang}/` - переводы

## Особенности

### Мультиязычность
- Поддержка украинского и английского языков
- Динамическая загрузка переводов из API
- URL роутинг с префиксом языка: `/uk/about`, `/en/about`

### Оптимизация
- Code splitting по компонентам
- Lazy loading изображений
- Оптимизированный bundling с Vite
- Tree shaking для уменьшения размера бандла

### UX/UI
- Анимации с Framer Motion
- Адаптивный дизайн с Tailwind CSS
- Accessibility поддержка
- SEO оптимизация

## Команды

```bash
npm run dev          # Запуск development сервера
npm run build        # Сборка для production
npm run preview      # Предварительный просмотр production build
npm run lint         # Проверка кода ESLint
```

## Deployment

Для развертывания:

1. Собрать проект:
```bash
npm run build
```

2. Статические файлы будут в папке `dist/`

3. Настроить веб-сервер для SPA (Single Page Application)

## API Backend

Убедитесь, что Django backend запущен на `http://localhost:8000` или обновите `VITE_API_URL` в `.env` файле.

## Изменения от Next.js версии

- Удалена зависимость от Next.js
- Заменен Next.js Router на React Router
- Переписан Image компонент на обычные img теги
- Упрощен процесс сборки и развертывания
- Улучшена скорость разработки благодаря Vite HMR
