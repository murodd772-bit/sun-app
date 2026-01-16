import os
import telebot
from telebot import types
from dotenv import load_dotenv # Нужно установить: pip install python-dotenv

# Загружаем переменные из .env
load_dotenv()
TOKEN = os.getenv('BOT_TOKEN')
bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    # Логика рефералов: получаем ID того, кто пригласил
    args = message.text.split()
    referrer_id = args[1] if len(args) > 1 else None
    
    user_id = message.from_user.id
    user_name = message.from_user.first_name

    # ТУТ БУДЕТ ЗАПРОС К БАЗЕ ДАННЫХ: 
    # "Если юзера нет, создать его. Если есть реферер — записать связь"
    
    markup = types.InlineKeyboardMarkup()
    # Ссылка на твое приложение (GitHub Pages или Vercel)
    web_app = types.WebAppInfo(f"https://murodd772-bit.github.io/sun-app/")
    btn = types.InlineKeyboardButton("Открыть Sun App ☀️", web_app=web_app)
    markup.add(btn)
    
    welcome_text = (
        f"Привет, {user_name}!\n\n"
        "Добро пожаловать в Sun App. Здесь ты можешь майнить TON "
        "и приглашать друзей."
    )
    
    bot.send_message(message.chat.id, welcome_text, reply_markup=markup)

if __name__ == "__main__":
    print("Бот запущен...")
    bot.polling(none_stop=True)
