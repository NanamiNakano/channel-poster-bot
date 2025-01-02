import "jsr:@std/dotenv/load"

export class Config {
  token: string
  owner: number

  constructor() {
    const token = Deno.env.get("BOT_TOKEN");
    if (!token) {
      throw new Error("BOT_TOKEN is not provided");
    }
    this.token = token;

    const owner = Deno.env.get("OWNER");
    if (!owner) {
      throw new Error("OWNER is not provided");
    }
    this.owner = parseInt(owner);
  }
}
