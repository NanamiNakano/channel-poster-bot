import { GrammyError, HttpError, InlineKeyboard, session } from "@grammy";
import { bot, config, kv } from "./global.ts";
import { archive, checkArchive, getMessageLink, sleep } from "./utils.ts";
import { other, router } from "./router.ts";
import { setupConversations } from "./ctx/index.ts";

bot.use(session({
  initial() {
    return {};
  },
}));
setupConversations();
bot.use(router);

Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

router.route("command:add", async (ctx) => {
  await ctx.conversation.enter("addRoute");
});

router.route("command:cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Operation cancelled.");
});

router.route("command:archive").command("archive", async (ctx) => {
  let url: string;
  const items = ctx.match.split(" ");
  if (items.length > 1) {
    await ctx.reply(
      "Usage: /archive <url> or reply to a message with /archive",
      {
        reply_parameters: {
          message_id: ctx.msg.message_id,
        },
      },
    );
    return;
  }

  if (items[0] == "") {
    const replyTo = ctx.msg.reply_to_message;
    if (!replyTo) {
      await ctx.reply(
        "Usage: /archive <url> or reply to a message with /archive",
        {
          reply_parameters: {
            message_id: ctx.msg.message_id,
          },
        },
      );
      return;
    }

    const text = replyTo.text;
    if (!text) {
      await ctx.reply("No URL detected.", {
        reply_parameters: {
          message_id: ctx.msg.message_id,
        },
      });
      return;
    }

    const entities = replyTo.entities;
    if (!entities) {
      await ctx.reply("No URL detected.", {
        reply_parameters: {
          message_id: ctx.msg.message_id,
        },
      });
      return;
    }

    const urls = entities.filter((entity) => entity.type == "url");
    if (urls.length == 0) {
      await ctx.reply("No URL detected.", {
        reply_parameters: {
          message_id: ctx.msg.message_id,
        },
      });
      return;
    }

    url = text.slice(urls[0].offset, urls[0].offset + urls[0].length);
  } else {
    url = items[0];
  }

  try {
    new URL(url);
  } catch (_e) {
    await ctx.reply("Invalid URL", {
      reply_parameters: {
        message_id: ctx.msg.message_id,
      },
    });
    return;
  }

  const replyed = await ctx.reply("Archiving...", {
    reply_parameters: {
      message_id: ctx.msg.message_id,
    },
  });

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
    "Archive job submitted successfully!" +
      (archivedPage.message ? `\n${archivedPage.message}` : ""),
  );

  await sleep(config.archiveCheckDelay);
  const status = await checkArchive(archivedPage.job_id);
  if (!status) {
    await ctx.reply(
      "Failed to check archive status. Please check it manually.",
      {
        reply_parameters: {
          message_id: ctx.msg.message_id,
        },
      },
    );
    return;
  }

  if (status.status == "success") {
    const inlineKeyboard = new InlineKeyboard().url(
      "View",
      `https://web.archive.org/web/${status.timestamp}/${status.original_url}`,
    );
    await ctx.reply("Archived successfully!", {
      reply_markup: inlineKeyboard,
      reply_parameters: {
        message_id: ctx.msg.message_id,
      },
    });
    return;
  }
  if (status.status == "error") {
    await ctx.reply(
      "Failed to archive.\n" +
        "Reason: " + status.message,
      {
        reply_parameters: {
          message_id: ctx.msg.message_id,
        },
      },
    );
    return;
  }
  await ctx.reply(
    "Seems like the archive is taking too long. Please check it manually.",
    {
      reply_parameters: {
        message_id: ctx.msg.message_id,
      },
    },
  );
});

other.on("channel_post")
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

router.route("command:whitelist", async (ctx) => {
  await ctx.conversation.enter("whitelist");
});

router.route("command:blacklist", async (ctx) => {
  await ctx.conversation.enter("blacklist");
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

console.log("Bot started!");
await bot.start();
