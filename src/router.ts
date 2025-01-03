import { Router } from "@grammy_router";
import { MyContext } from "./types.ts";
import { config, kv } from "./global.ts";

export const router = new Router<MyContext>(async (ctx) => {
  if (ctx.hasCommand("add")) {
    if (ctx.from?.id != config.owner) {
      await ctx.reply("You are not allowed to use this command.");
      return;
    }
    if (ctx.chat.type != "private") {
      return;
    }

    return "command:add";
  }
  if (ctx.hasCommand("cancel")) {
    return "command:cancel";
  }
  if (ctx.hasCommand("archive")) {
    if (!ctx.from) {
      await ctx.reply("You are not allowed to use this command.");
      return;
    }
    const whitelisted = await kv.get<boolean>([
      "whitelist",
      ctx.from.id.toString(),
    ]);
    if (whitelisted.value == false) {
      await ctx.reply("You are not allowed to use this command.");
      return;
    }
    if (whitelisted.value == null) {
      await ctx.reply(
        "You need to be whitelisted before using this command. Please contact the bot owner.",
      );
      return;
    }

    return "command:archive";
  }
  if (ctx.hasCommand("whitelist")) {
    if (ctx.from?.id != config.owner) {
      await ctx.reply("You are not allowed to use this command.");
      return;
    }
    if (ctx.chat.type != "private") {
      return;
    }

    return "command:whitelist";
  }
  if (ctx.hasCommand("blacklist")) {
    if (ctx.from?.id != config.owner) {
      await ctx.reply("You are not allowed to use this command.");
      return;
    }
    if (ctx.chat.type != "private") {
      return;
    }

    return "command:blacklist";
  }
});

export const other = router.otherwise();
