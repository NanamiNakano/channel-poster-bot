import { conversations, createConversation } from "@grammy_conversations";
import { bot } from "../global.ts";
import { addRoute } from "./route.ts";
import { blacklist, whitelist } from "./whitelist.ts";

export function setupConversations() {
  bot.use(conversations());

  bot.use(createConversation(addRoute));
  bot.use(createConversation(whitelist));
  bot.use(createConversation(blacklist));
}
