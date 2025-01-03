import { Config } from "./config.ts";

export const config = new Config()
export const kv = await Deno.openKv()
