import { Message } from "@grammy_types";

export function getMessageLink(msg: Message) {
    if (msg.chat.type == "private") {
        return ""
    }
    const chat_id = msg.chat.id.toString().slice(4);
    return `https://t.me/c/${chat_id}/${msg.message_id}`
}
