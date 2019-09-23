import * as _ from "lodash";
import { HandleFunction } from "./types";
import { WebhookEvent } from "@line/bot-sdk";
import compose from "./compose";
import Context from "./context";
import { LoggerFilename } from "../logger";
const logger = LoggerFilename(__filename);

export default class Layer {
  private types: string[] = [];
  private message: RegExp | string = null;
  private stack: HandleFunction[] = [];

  constructor(types: string[], message: RegExp | string, fn: HandleFunction[]) {
    this.types = types.map(type => {
      const index = type.indexOf("From");
      return index > -1 ? type.substr(0, index) : type;
    });
    this.message = message;

    this.stack = _.isArray(fn) ? fn : [fn];

    logger.debug("stack length:", this.stack.length);
  }

  private matchRegexMessage(event: WebhookEvent): string {
    return event.type === "message" && event.message.type === "text"
      ? event.message.text
      : null;
  }

  private allMessageType(): boolean {
    return this.types.length === 1 && this.types[0] === "all";
  }

  match(event: WebhookEvent) {
    let typeMatched = false;
    let messageMatched = this.message === null;

    if (this.allMessageType()) {
      logger.debug(`matched:[middleware]`);
      return true;
    } else {
      for (let type of this.types) {
        if (type === event.type) {
          typeMatched = true;
          break;
        }
      }
    }

    let text = this.matchRegexMessage(event);
    if (this.message !== null && text) {
      if (this.message instanceof RegExp) {
        messageMatched = this.message.test(text);
        this.message.lastIndex = 0;
      } else {
        messageMatched = this.message === text;
      }

      if (messageMatched) logger.info("matched:", this.message, text);
    }

    logger.debug(
      `matched:[type]:${typeMatched},[msg]:${messageMatched},[text]:${text}`
    );

    return typeMatched && messageMatched;
  }

  public async dispatch(ctx: Context, next: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      logger.debug("type:", this.types, this.stack.length);
      const fn = compose(this.stack);

      fn(ctx, next)
        .then(resolve)
        .catch(reject);
    });
  }
}
