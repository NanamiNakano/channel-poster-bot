import "jsr:@std/dotenv/load";

export class Config {
  token: string;
  owner: number;
  archiveToken: string;
  archiveCheckDelay: number;
  archiveCheckMaxTries: number;

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

    const archiveCheckMaxTries = Deno.env.get("ARCHIVE_CHECK_MAX_RETRIES");
    if (!archiveCheckMaxTries) {
      this.archiveCheckMaxTries = 10;
    } else {
      this.archiveCheckMaxTries = parseInt(archiveCheckMaxTries);
    }
  }
}
