import dotenv from "dotenv";
dotenv.config();

import { LoggerFilename } from "./logger";
const logger = LoggerFilename(__filename);

import { Context as koaContext } from "koa";
import { WebhookEvent, Client } from "@line/bot-sdk";
import compose from "./lib/compose";
import * as _ from "lodash";
import {
  HandleFunction,
  MessageEvent,
  allowEvent,
  RouterConfig
} from "./lib/types";
import Context from "./lib/context";
import Layer from "./lib/layer";
import { lineSignature } from "./middleware";

//
// export
//
export * from "./middleware";
export * from "./lib/context";

const lineClient: Client = null;

type MessageEventStrings = keyof typeof MessageEvent;

export default class MessageRouter implements allowEvent {
  message(message: RegExp | string, ...middlewares: HandleFunction[]): this;
  message(...middlewares: HandleFunction[]): this;
  message(message?: any, ...middlewares: any[]): this {
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
      const value: MessageEventStrings = _.get(MessageEvent, key);
      if (_.isFunction(_.get(this, value))) {
        logger.debug("bind:", value);
        _.set(this, value, this.addMiddlewareToStack.bind(this, value));
      }
    });
  }
  constructor() {
    this.stack = [];
    this.bindAllMappingFunction();
  }

  use(source: string, middleware: HandleFunction | MessageRouter): any;
  use(middleware: HandleFunction | MessageRouter): any;
  use() {
    let middleware: HandleFunction | MessageRouter = null;

    let i: number = 0;
    if (_.isFunction(arguments[i]) || arguments[i] instanceof MessageRouter) {
      middleware = arguments[i];
      i++;
    }

    if (i === 0) throw new TypeError("please check handle function type");

    let fn: HandleFunction[] =
      middleware instanceof MessageRouter
        ? middleware.stack.map(layer => layer.dispatch.bind(layer))
        : [middleware];

    const layer: Layer = new Layer(["all"], null, fn);

    this.stack.push(layer);
  }

  private addMiddlewareToStack(type: string) {
    let message: RegExp | string = null;

    if (!_.isString(arguments[0])) {
      throw TypeError("type not found");
    }

    let index: number = 0;
    let funcIndex: number = 0;

    while (++index < arguments.length) {
      const arg = arguments[index];
      if (_.isRegExp(arg) || _.isString(arg)) {
        message = arg;
        continue;
      }
      if (_.isFunction(arg)) {
        funcIndex = index;
        break;
      }
    }

    for (let i = funcIndex; i < arguments.length; i++) {
      const fn = arguments[i];
      if (!_.isFunction(fn)) {
        throw TypeError("middleware need to function type");
      }
    }

    this.stack.push(
      new Layer([type], message, Array.prototype.slice.call(arguments, index))
    );
  }

  public async dispatchEvent(
    koaCtx: koaContext,
    event: WebhookEvent,
    client?: Client
  ) {
    return new Promise((resolve, reject) => {
      const matchedLayers: HandleFunction[] = [];
      this.stack.forEach(layer => {
        const matched = layer.match(event);
        if (matched) {
          matchedLayers.push(layer.dispatch.bind(layer));
        }
      });

      const ctx = new Context(koaCtx, event, client);

      const fn = compose(matchedLayers);
      fn(ctx)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * check request whether come from line
   * @param config client config for line
   */
  public lineSignature(config: RouterConfig) {
    return lineSignature(config);
  }

  /**
   * @param {RouterConfig}
   */
  public routes(
    config: RouterConfig = {
      path: "/callback",
      channelAccessToken: undefined,
      channelSecret: undefined
    }
  ) {
    let client = lineClient;
    if (!client) {
      logger.info("create line clinet instance");
      client = new Client(config);
    }

    /**
     * Middleware
     */
    return async (ctx: koaContext, next: () => Promise<any>) => {
      const { method, path, body } = ctx.request;
      if (method !== "post" && path !== config.path) {
        return await next();
      }

      if (!body.events) {
        logger.warn("event is undefined.");
        return await next();
      }

      const events: WebhookEvent[] = body.events;

      try {
        logger.info(" ++++++++++++ routes start ++++++++++++ ");
        await Promise.all(
          events.map(evnet => this.dispatchEvent(ctx, evnet, client))
        );
        ctx.body = null;
        logger.info(" ++++++++++++ routes done ++++++++++++ ");
      } catch (err) {
        console.error(err);
        ctx.status = 500;
      }
    };
  }
}
