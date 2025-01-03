import "jsr:@std/dotenv/load";

export class Config {
  token: string;
  owner: number;
  archiveToken: string;
  archiveCheckDelay: number;
  denoKvUrl?: string;

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

    const archiveToken = Deno.env.get("ARCHIVE_TOKEN");
    if (!archiveToken) {
      throw new Error("ARCHIVE_TOKEN is not provided");
    }
    this.archiveToken = archiveToken;

    const archiveCheckDelay = Deno.env.get("ARCHIVE_CHECK_DELAY");
    if (!archiveCheckDelay) {
      this.archiveCheckDelay = 60;
    } else {
      this.archiveCheckDelay = parseInt(archiveCheckDelay);
    }

    this.denoKvUrl = Deno.env.get("DENO_KV_URL");
  }
}
