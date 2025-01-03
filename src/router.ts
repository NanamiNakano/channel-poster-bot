import { Router } from "@grammy_router"
import { MyContext } from "./types.ts";

export const router = new Router<MyContext>((ctx) => {
    if (ctx.hasCommand("add")) {
        return "command:add"
    }
    if (ctx.hasCommand("cancel")) {
        return "command:cancel"
    }
    if (ctx.hasCommand("archive")) {
        return "command:archive"
    }
    if (ctx.hasCommand("whitelist")) {
        return "command:whitelist"
    }
    if (ctx.hasCommand("blacklist")) {
        return "command:blacklist"
    }
})

export const other = router.otherwise()
