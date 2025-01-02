import { Context, SessionFlavor } from "@grammy";
import { Conversation, ConversationFlavor } from "@grammy_conversations";

type Empty = Record<string | number | symbol, never>

export type MyContext = Context & SessionFlavor<Empty> & ConversationFlavor
export type MyConversation = Conversation<MyContext>
