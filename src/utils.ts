import { Message } from "@grammy_types";
import { config } from "./global.ts";
import { ArchiveResponse, StatusResponse } from "./types.ts";

export function getMessageLink(msg: Message) {
  if (msg.chat.type == "private") {
    return "";
  }
  const chat_id = msg.chat.id.toString().slice(4);
  return `https://t.me/c/${chat_id}/${msg.message_id}`;
}

export async function archive(url: string) {
  try {
    const params = new URLSearchParams({
      url: url,
      capture_all: "1",
      skip_first_archive: "1",
    });
    const req = new Request("https://web.archive.org/save/", {
      method: "POST",
      headers: {
        "Authorization": `LOW ${config.archiveToken}`,
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const response = await fetch(req);
    if (!response.ok) {
      return undefined;
    }

    return await response.json() as ArchiveResponse;
  } catch (_e) {
    return undefined;
  }
}

export async function checkArchive(job_id: string) {
  try {
    const req = new Request("https://web.archive.org/save/status/" + job_id, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `LOW ${config.archiveToken}`,
      },
    });

    const response = await fetch(req);
    if (!response.ok) {
      return undefined;
    }
    return await response.json() as StatusResponse;
  } catch (_e) {
    return undefined;
  }
}

export function sleep(s: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}
