import { Context, SessionFlavor } from "@grammy";
import { Conversation, ConversationFlavor } from "@grammy_conversations";

type Empty = Record<string | number | symbol, never>;

export type MyContext = Context & SessionFlavor<Empty> & ConversationFlavor;
export type MyConversation = Conversation<MyContext>;

export type ArchiveResponse =
  | {
    url: string;
    job_id: string;
    message: string;
    status?: never;
    status_ext?: never;
  }
  | {
    url?: never;
    job_id?: never;
    message: string;
    status: string;
    status_ext: string;
  };

export type StatusResponse = 
  | {
  status: "success";
  job_id: string;
  resources: string[];
  screenshot?: string;
  counters: Counters;
  delay_wb_availability: boolean;
  duration_sec: number;
  http_status: number;
  original_url: string;
  outlinks?: string[];
  timestamp: string;
}
| {
  status: "error";
  job_id: string;
  resources: string[];
  exception: string;
  status_ext: string;
  message: string;
}
| {
  status: "pending";
  job_id: string;
  resources: string[];
};

export type Counters = {
  embeds: number;
  outlinks: number;
};
