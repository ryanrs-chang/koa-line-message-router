import dotenv from "dotenv";
dotenv.config();

import { Context as koaContext } from "koa";
import { WebhookEvent, WebhookRequestBody } from "@line/bot-sdk";
import compose from "./lib/compose";
import * as _ from "lodash";
import {
  HandleFunction,
  MessageEvent,
  CustomMessageEvent,
  allowEvent
} from "./lib/types";
import Context from "./lib/context";
import Layer from "./lib/layer";
import { LoggerFilename } from "./logger";
const logger = LoggerFilename(__filename);

type ValueOf<T> = T[keyof T];
type MessageEventStrings = keyof typeof MessageEvent | CustomMessageEvent;

export default class MessageRouter implements allowEvent {
  message(message: RegExp, ...middlewares: HandleFunction[]): this;
  message(...middlewares: HandleFunction[]): this;
  message(message?: any, ...middlewares: any[]): this {
    throw new Error("Method not implemented.");
  }
  messageFrom(
    source: string,
    message: RegExp,
    ...middlewares: HandleFunction[]
  ): this {
    throw new Error("Method not implemented.");
  }
  follow(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  unfollow(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  join(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  leave(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  memberJoined(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  memberLeft(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  postback(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  beacon(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  accountLink(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  deviceLink(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  deviceUnlink(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  thingsExecution(...middlewares: HandleFunction[]): this {
    throw new Error("Method not implemented.");
  }
  private stack: Layer[] = [];

  private bindAllMappingFunction() {
    //
    // basic event
    //
    Object.keys(MessageEvent).forEach((key: string) => {
      const value: MessageEventStrings = MessageEvent[key];
      if (_.isFunction(this[value])) {
        logger.debug("bind:", value);
        this[value] = this.addMiddlewareToStack.bind(this, value);
      }
    });

    //
    // 'from' event
    //
    Object.keys(CustomMessageEvent).forEach((key: string) => {
      const value: MessageEventStrings = CustomMessageEvent[key];
      if (_.isFunction(this[value])) {
        logger.debug("bind:", value);
        this[value] = this.addMiddlewareToStack.bind(this, value);
      }
    });
  }
  constructor() {
    this.stack = [];
    this.bindAllMappingFunction();
  }

  use(...middlewares: HandleFunction[]) {
    if (!_.isArray(middlewares)) {
      throw new TypeError("please check handle function");
    }

    for (let middleware of middlewares) {
      if (!_.isFunction(middleware)) {
        throw new TypeError("please check handle function type");
      }

      const layer: Layer = new Layer(["all"], ["all"], null, [middleware]);
      this.stack.push(layer);
    }
    return this;
  }

  private addMiddlewareToStack(type: string) {
    let from: string = "all";
    let message: RegExp = null;

    if (!_.isString(arguments[0])) {
      throw TypeError("type not found");
    }

    if (_.isString(arguments[1])) {
      const tmpFrom = arguments[1];
      if (tmpFrom !== "user" && tmpFrom !== "group" && tmpFrom !== "room") {
        throw TypeError("source type not found");
      }
      from = tmpFrom;
    }

    let index: number = 0;
    let funcIndex: number = 0;
    logger.info(arguments.length);

    while (++index < arguments.length) {
      if (_.isRegExp(arguments[index])) {
        message = arguments[index];
      }
      if (_.isFunction(arguments[index])) {
        funcIndex = index;
        break;
      }
    }

    for (let i = funcIndex; i < arguments.length; i++) {
      if (!_.isFunction(arguments[i])) {
        throw TypeError("middleware need to function type");
      }
    }

    this.stack.push(
      new Layer(
        [type],
        [from],
        message,
        Array.prototype.slice.call(arguments, index)
      )
    );
  }

  public async dispatchEvent(ctx: koaContext, event: WebhookEvent) {
    return new Promise((resolve, reject) => {
      const matchedLayers: HandleFunction[] = [];
      this.stack.forEach(layer => {
        const matched = layer.match(event);
        if (matched) {
          matchedLayers.push(layer.dispatch.bind(layer));
        }
      });

      logger.info("[dispatchEvent]:", matchedLayers.length);

      const fn = compose(matchedLayers);
      fn(ctx)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * @api private
   */
  public routes() {
    return async (ctx: koaContext) => {
      const reqBody: WebhookRequestBody = ctx.request.body;
      const events: WebhookEvent[] = reqBody.events;

      try {
        logger.info(" ++++++ routes start ++++++ ");
        ctx.body = await Promise.all(
          events.map(evnet => this.dispatchEvent(ctx, evnet))
        );
        logger.info(" ++++++ routes done ++++++ ");
      } catch (err) {
        console.error(err);
        ctx.status = 500;
      }
    };
  }
}

// image
// video
// audio
// file
// location
// sticker
