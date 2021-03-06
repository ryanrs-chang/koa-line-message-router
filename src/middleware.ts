import line from "@line/bot-sdk";
import koa from "koa";
import { createHmac } from "crypto";
import { isEqual } from "lodash";
import Context from "./lib/context";

export function lineSignature(config: line.Config) {
  return async function(ctx: koa.Context, next: Function) {
    const signature = ctx.headers["x-line-signature"] as string;

    if (!config.channelSecret) {
      throw new Error("no channel secret");
    }

    if (!signature) {
      await next(new Error("no signature"));
      return;
    }

    const hash = createHmac("sha256", config.channelSecret)
      .update(JSON.stringify(ctx.request.body))
      .digest("base64");

    if (isEqual(hash, signature)) {
      return await next();
    }

    await next(new Error(`signature validation failed ${signature}`));
    return;
  };
}

/**
 * check evnet source is 'user'
 */
export function fromUser() {
  return async (ctx: Context, next) => {
    if (ctx.event.source.type === "user") return await next();

    return Promise.resolve();
  };
}

/**
 * check evnet source is 'group'
 */
export function fromGroup() {
  return async (ctx: Context, next) => {
    if (ctx.event.source.type === "group") return await next();

    return Promise.resolve();
  };
}

/**
 * check evnet source is 'room'
 */
export function fromRoom() {
  return async (ctx: Context, next) => {
    if (ctx.event.source.type === "room") return await next();
  };
}
