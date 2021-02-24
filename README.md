# Требования
- Node >= 14.0
- Postgres >= 12
- Redis >= 5.0
# Окружение
```bash
BOT_TOKEN // Токен бота телеграмма
EMPATHY_CHAT_ID // Id чата, куда будут пересылаться сообщения
REDIS_PORT=6379 // Порт редиса
REDIS_HOST='127.0.0.1' // Хост редиса
REDIS_PASSWORD='' // Пароль редиса
PG_PORT=5432 // Порт postgres
PG_HOST=localhost // Хост postgres
PG_USER=postgres // Пользовать postgres
PG_PASSWORD // Пароль
PG_DATABASE=empathy_bot // Название дб
PG_TZ='UTC' // Таймзона

