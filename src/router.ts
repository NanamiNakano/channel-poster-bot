import { Router } from "@grammy_router";
import { MyContext } from "./types.ts";
import { config } from "./global.ts";

export const router = new Router<MyContext>(async (ctx) => {
  if (ctx.hasCommand("add")) {
    if (ctx.from?.id != config.owner) {
      await ctx.reply("You are not allowed to use this command.");
      return;
    }

    return "command:add";
  }
  if (ctx.hasCommand("cancel")) {
    return "command:cancel";
  }
  if (ctx.hasCommand("archive")) {
    if (ctx.from?.id != config.owner) {
      await ctx.reply("You are not allowed to use this command.");
      return;
    }

    return "command:archive";
  }
  if (ctx.hasCommand("whitelist")) {
    if (ctx.from?.id != config.owner) {
      await ctx.reply("You are not allowed to use this command.");
      return;
    }

    return "command:whitelist";
  }
  if (ctx.hasCommand("blacklist")) {
    if (ctx.from?.id != config.owner) {
      await ctx.reply("You are not allowed to use this command.");
      return;
    }

    return "command:blacklist";
  }
});

export const other = router.otherwise();
