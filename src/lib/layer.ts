import * as _ from "lodash";
import { HandleFunction } from "./types";
import { WebhookEvent } from "@line/bot-sdk";
import compose from "./compose";
import Context from "./context";
import { LoggerFilename } from "../logger";
const logger = LoggerFilename(__filename);

export default class Layer {
  private types: string[] = [];
  private from: string[] = [];
  private message: RegExp = null;
  private stack: HandleFunction[] = [];
  private fromRegex: RegExp = null;

  constructor(
    types: string[],
    from: string[],
    message: RegExp,
    fn: HandleFunction[]
  ) {
    this.types = types.map(type => {
      const index = type.indexOf("From");
      return index > -1 ? type.substr(0, index) : type;
    });
    this.from = from;
    this.message = message;

    this.stack = _.isArray(fn) ? fn : [fn];
    logger.debug("stack length:", this.stack.length);
  }

  private allFrom(): boolean {
    return this.from.length === 1 && this.from[0] === "all";
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
    let fromMatched = true;
    let messageMatched = this.message === null;

    if (this.types.length === 1 && this.types[0] === "all") {
      logger.debug(`matched:[middleware]`);
      return true;
    }

    if (!this.allMessageType()) {
      for (let type of this.types) {
        if (type === event.type) {
          typeMatched = true;
          break;
        }
      }
    }

    let text = this.matchRegexMessage(event);
    if (this.message !== null && text) {
      messageMatched = this.message.test(text);
    }

    if (!this.allFrom()) {
      for (let from of this.from) {
        if (from === event.source.type) {
          fromMatched = true;
          break;
        }
      }
    }

    logger.debug(
      `matched:[type]:${typeMatched},[from]:${fromMatched},[message]:${messageMatched}`
    );

    return typeMatched && fromMatched && messageMatched;
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
