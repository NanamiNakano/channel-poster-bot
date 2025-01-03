import { Bot } from "@grammy";
import { Config } from "./config.ts";
import { MyContext } from "./types.ts";

export const config = new Config()
export const kv = await Deno.openKv()
export const bot = new Bot<MyContext>(config.token);