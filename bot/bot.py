from telegram import Update, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler
import os

TOKEN = os.getenv("BOT_TOKEN")

async def start(update: Update, context):
    await update.message.reply_text(
        "🚀 Открыть SUN APP",
        reply_markup={
            "keyboard": [[{
                "text": "Открыть приложение",
                "web_app": WebAppInfo(url="https://sun-app-psi.vercel.app")
            }]],
            "resize_keyboard": True
        }
    )

app = ApplicationBuilder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.run_polling()
