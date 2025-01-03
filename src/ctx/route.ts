import { MessageOriginChannel } from "@grammy_types";
import { MyContext, MyConversation } from "../types.ts";
import { kv } from "../global.ts";
import { produce } from "@immer";

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
