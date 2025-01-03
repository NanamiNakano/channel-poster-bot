import { MessageOriginChannel, MessageOriginUser } from "@grammy_types";
import { kv } from "./global.ts";
import { MyContext, MyConversation } from "./types.ts";
import { produce } from "@immer";
import { Keyboard } from "@grammy";

export async function addRoute(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Please forward a message from source channel.")
    const source = (await conversation.waitFor("message:forward_origin:channel")).msg.forward_origin as MessageOriginChannel
    const source_id = source.chat.id
    const source_name = source.chat.title

    await ctx.reply("Please forward a message from destination channel.")
    const destination = (await conversation.waitFor("message:forward_origin:channel")).msg.forward_origin as MessageOriginChannel
    const destination_id = destination.chat.id
    const destination_name = destination.chat.title

    const existing = await conversation.external(async () => await kv.get<number[]>(["route", source_id.toString()]))
    if (existing.value == null) {
        await conversation.external(async () => await kv.set(["route", source_id.toString()], [destination_id]))
    } else {
        const destinations = produce(existing.value, (draft: number[]) => {
            draft.push(destination_id)
        })
        await conversation.external(async () => await kv.set(["route", source_id.toString()], destinations))
    }

    await ctx.reply("Route added: \n" +
        "Source: " + source_name + "\n" +
        "Destination: " + destination_name
    )
    await ctx.reply("Please grant me nessessary permissions.")
}

export async function whitelist(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Please forward a message from the user you want to whitelist.")
    const user = (await conversation.waitFor("msg:forward_origin:user")).msg.forward_origin as MessageOriginUser
    if (user.sender_user.is_bot) {
        await ctx.reply("Bots can not be whitelisted.")
        return
    }

    const whitelisted = await conversation.external(async () => await kv.get<boolean>(["whitelist", user.sender_user.id.toString()]))
    if (whitelisted.value == true) {
        await ctx.reply("User is already whitelisted.")
        return
    }
    if (whitelisted.value == false) {
        const keyboard = new Keyboard()
        .text("Yes").row()
        .text("No")
        .oneTime()
        .resized()
        await ctx.reply("User is blacklisted. Do you want to unblacklist?", {
            reply_markup: keyboard
        })

        const reply = await conversation.waitFor("msg:text")
        if (reply.msg.text == "No") {
            await ctx.reply("No changes made.")
            return
        }
        if (reply.msg.text == "Yes") {
            await conversation.external(async () => await kv.set(["whitelist", user.sender_user.id.toString()], true))
            await ctx.reply("User whitelisted.")
            return
        }
        await ctx.reply("Can not undersant your reply. Aborting...")
        return
    }
    await conversation.external(async () => await kv.set(["whitelist", user.sender_user.id.toString()], true))
    await ctx.reply("User whitelisted.")
}

export async function blacklist(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Please forward a message from the user you want to blacklist.")
    const user = (await conversation.waitFor("msg:forward_origin:user")).msg.forward_origin as MessageOriginUser
    if (user.sender_user.is_bot) {
        await ctx.reply("Bots can not be blacklisted.")
        return
    }

    const whitelisted = await conversation.external(async () => await kv.get<boolean>(["whitelist", user.sender_user.id.toString()]))
    if (whitelisted.value == false) {
        await ctx.reply("User is already blacklisted.")
        return
    }
    if (whitelisted.value == true) {
        const keyboard = new Keyboard()
        .text("Yes").row()
        .text("No")
        .oneTime()
        .resized()
        await ctx.reply("User is whitelisted. Do you want to unwhitelist?", {
            reply_markup: keyboard
        })

        const reply = await conversation.waitFor("msg:text")
        if (reply.msg.text == "No") {
            await ctx.reply("No changes made.")
            return
        }
        if (reply.msg.text == "Yes") {
            await conversation.external(async () => await kv.set(["whitelist", user.sender_user.id.toString()], false))
            await ctx.reply("User blacklisted.")
            return
        }
        await ctx.reply("Can not undersant your reply. Aborting...")
        return
    }
    await conversation.external(async () => await kv.set(["whitelist", user.sender_user.id.toString()], false))
    await ctx.reply("User blacklisted.")
}
