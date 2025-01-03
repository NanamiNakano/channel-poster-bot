import { MessageOriginUser } from "@grammy_types";
import { kv } from "../global.ts";
import { MyContext, MyConversation } from "../types.ts";
import { Keyboard } from "@grammy";

export async function whitelist(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply(
    "Please forward a message from the user you want to whitelist.",
  );
  const user = (await conversation.waitFor("msg:forward_origin:user")).msg
    .forward_origin as MessageOriginUser;
  if (user.sender_user.is_bot) {
    await ctx.reply("Bots can not be whitelisted.");
    return;
  }

  const whitelisted = await conversation.external(async () =>
    await kv.get<boolean>(["whitelist", user.sender_user.id.toString()])
  );
  if (whitelisted.value == true) {
    await ctx.reply("User is already whitelisted.");
    return;
  }
  if (whitelisted.value == false) {
    const keyboard = new Keyboard()
      .text("Yes").row()
      .text("No")
      .oneTime()
      .resized();
    await ctx.reply("User is blacklisted. Do you want to unblacklist?", {
      reply_markup: keyboard,
    });

    const reply = await conversation.waitFor("msg:text");
    if (reply.msg.text == "No") {
      await ctx.reply("No changes made.");
      return;
    }
    if (reply.msg.text == "Yes") {
      await conversation.external(async () =>
        await kv.set(["whitelist", user.sender_user.id.toString()], true)
      );
      await ctx.reply("User whitelisted.");
      return;
    }
    await ctx.reply("Can not undersant your reply. Aborting...");
    return;
  }
  await conversation.external(async () =>
    await kv.set(["whitelist", user.sender_user.id.toString()], true)
  );
  await ctx.reply("User whitelisted.");
}

export async function blacklist(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply(
    "Please forward a message from the user you want to blacklist.",
  );
  const user = (await conversation.waitFor("msg:forward_origin:user")).msg
    .forward_origin as MessageOriginUser;
  if (user.sender_user.is_bot) {
    await ctx.reply("Bots can not be blacklisted.");
    return;
  }

  const whitelisted = await conversation.external(async () =>
    await kv.get<boolean>(["whitelist", user.sender_user.id.toString()])
  );
  if (whitelisted.value == false) {
    await ctx.reply("User is already blacklisted.");
    return;
  }
  if (whitelisted.value == true) {
    const keyboard = new Keyboard()
      .text("Yes").row()
      .text("No")
      .oneTime()
      .resized();
    await ctx.reply("User is whitelisted. Do you want to unwhitelist?", {
      reply_markup: keyboard,
    });

    const reply = await conversation.waitFor("msg:text");
    if (reply.msg.text == "No") {
      await ctx.reply("No changes made.");
      return;
    }
    if (reply.msg.text == "Yes") {
      await conversation.external(async () =>
        await kv.set(["whitelist", user.sender_user.id.toString()], false)
      );
      await ctx.reply("User blacklisted.");
      return;
    }
    await ctx.reply("Can not undersant your reply. Aborting...");
    return;
  }
  await conversation.external(async () =>
    await kv.set(["whitelist", user.sender_user.id.toString()], false)
  );
  await ctx.reply("User blacklisted.");
}
