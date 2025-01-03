import { Bot, GrammyError, HttpError, InlineKeyboard, session } from "@grammy";
import { config, kv } from "./global.ts";
import { conversations, createConversation } from "@grammy_conversations";
import { MyContext } from "./types.ts";
import { addRoute } from "./ctx.ts";
import { archive, checkArchive, getMessageLink } from "./utils.ts";

const bot = new Bot<MyContext>(config.token);

bot.use(session({
  initial() {
    return {};
  },
}));
bot.use(conversations());
bot.use(createConversation(addRoute));

bot.command("add", async (ctx) => {
  if (ctx.from?.id != config.owner) {
    await ctx.reply("You are not allowed to use this command.");
    return;
  }

  await ctx.conversation.enter("addRoute");
});

bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Operation cancelled.");
});

bot.command("archive", async (ctx) => {
  if (ctx.from?.id != config.owner) {
    await ctx.reply("You are not allowed to use this command.");
    return;
  }

  const items = ctx.match.split(" ");
  if (items.length != 1) {
    await ctx.reply("Usage: /archive <url>");
    return;
  }
  const url = items[0];

  try {
    new URL(url);
  } catch (_e) {
    await ctx.reply("Invalid URL");
    return;
  }

  const replyed = await ctx.reply("Archiving...");

  const archivedPage = await archive(url);
  if (!archivedPage) {
    await ctx.api.editMessageText(
      replyed.chat.id,
      replyed.message_id,
      "Failed to archive.",
    );
    return;
  }

  if (archivedPage.status && archivedPage.status == "error") {
    await ctx.api.editMessageText(
      replyed.chat.id,
      replyed.message_id,
      "Failed to submit archive job.\n" +
      "Reason: " + archivedPage.message,
    );
    return;
  }

  if (!archivedPage.job_id) {
    await ctx.api.editMessageText(
      replyed.chat.id,
      replyed.message_id,
      "Failed to archive.",
    );
    return;
  }

  await ctx.api.editMessageText(
    replyed.chat.id,
    replyed.message_id,
    "Archive job submitted successfully!",
  );

  let tries = 0;
  while (tries < config.archiveCheckMaxTries) {
    const status = await checkArchive(archivedPage.job_id);
    if (!status) {
      tries++;
      await new Promise((r) => setTimeout(r, config.archiveCheckDelay * 1000));
      continue;
    }

    if (status.status == "success") {
      await ctx.api.editMessageText(
        replyed.chat.id,
        replyed.message_id,
        "Archived successfully!\n" +
          `Link: https://web.archive.org/${status.timestamp}/${status.original_url}`,
      );
      break;
    } else if (status.status == "error") {
      await ctx.api.editMessageText(
        replyed.chat.id,
        replyed.message_id,
        "Failed to archive.",
      );
      break;
    }

    await ctx.api.editMessageText(
      replyed.chat.id,
      replyed.message_id,
      `Checking archive status... Retry ${
        tries + 1
      }/${config.archiveCheckMaxTries}`,
    );
    tries++;
    await new Promise((r) => setTimeout(r, config.archiveCheckDelay * 1000));
  }
});

bot.on("channel_post")
  .on(":text", async (ctx) => {
    const chat_id = ctx.chat.id;
    const routes = await kv.get<number[]>(["route", chat_id.toString()]);
    if (routes.value == null) {
      return;
    }

    const source_name = ctx.chat.title;
    const inlineKeyboard = new InlineKeyboard().url(
      "View",
      getMessageLink(ctx.msg),
    );
    const header = `New post in ${source_name}:\n\n`;
    const entities = ctx.entities().map((entity) => {
      entity.offset += header.length;
      return entity;
    });

    routes.value.forEach(async (destination_id) => {
      await bot.api.sendMessage(
        destination_id,
        header +
          ctx.msg.text + "\n\n" +
          "#reading",
        {
          reply_markup: inlineKeyboard,
          entities: entities,
        },
      );
    });
  });

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
});

bot.start();
