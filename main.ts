import { Bot, GrammyError, HttpError, InlineKeyboard, session } from "@grammy"
import { config, kv } from "./global.ts"
import { conversations, createConversation } from "@grammy_conversations";
import { MyContext } from "./types.ts";
import { addRoute } from "./ctx.ts";
import { getMessageLink } from "./utils.ts";

const bot = new Bot<MyContext>(config.token)

bot.use(session({
  initial() {
    return {};
  },
}));
bot.use(conversations());
bot.use(createConversation(addRoute))

bot.command("add", async (ctx) => {
  if (ctx.from?.id != config.owner) {
    ctx.reply("You are not allowed to use this command.")
    return
  }

  await ctx.conversation.enter("addRoute")
})

bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Operation cancelled.");
})

bot.on("channel_post")
.on(":text",async (ctx) => {
  const chat_id = ctx.chat.id
  const routes = await kv.get<number[]>(["route", chat_id.toString()])
  if (routes.value == null) {
    return
  }
  
  const source_name = ctx.chat.title
  const inlineKeyboard = new InlineKeyboard().url("View", getMessageLink(ctx.msg))
  const header = `New post in ${source_name}:\n\n`
  const entities = ctx.entities().map((entity) => {
    entity.offset += header.length
    return entity
  })

  routes.value.forEach(async (destination_id) => {
    await bot.api.sendMessage(destination_id, header +
      ctx.msg.text + "\n\n" +
      "#reading" 
    , {
      reply_markup: inlineKeyboard,
      entities: entities
    })
  })
})

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
})

bot.start()
