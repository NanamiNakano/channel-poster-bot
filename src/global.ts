import { Bot } from "@grammy";
import { Config } from "./config.ts";
import { MyContext } from "./types.ts";

export const config = new Config();
export let kv: Deno.Kv;
if (config.denoKvUrl) {
  kv = await Deno.openKv(config.denoKvUrl);
} else {
  kv = await Deno.openKv();
}
export const bot = new Bot<MyContext>(config.token);
