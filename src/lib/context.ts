import { Context as koaContext } from "koa";
import { Client, WebhookEvent } from "@line/bot-sdk";
import { Message } from "@line/bot-sdk/lib/types";
import MessageRouter from "../app";
import * as _ from "lodash";

export default class Context {
  private _koaContext: koaContext = null;
  private _client: Client;
  private _event: WebhookEvent;
  private _app: MessageRouter;

  constructor(koaContext: koaContext, event: WebhookEvent, client?: Client) {
    this._koaContext = koaContext;
    this._client = client;
    this._event = event;

    const replyToken = _.get(this._event, "replyToken");
    if (client && replyToken) {
      this.$replyMessage = this._client.replyMessage.bind(
        this._client,
        replyToken
      );
    }
  }

  /**
   * original koa context
   */
  get koa() {
    return this._koaContext;
  }

  get app() {
    return this._app;
  }

  /**
   * get webhook event
   */
  get event() {
    return this._event;
  }

  get client() {
    return this._client;
  }

  /**
   * get content of message type is text
   * @returns {null | string}
   */
  get text() {
    const event = this.event;
    if (event.type === "message" && event.message.type === "text") {
      return event.message.text;
    }
    return null;
  }

  /**
   * wrapper replyMessage automatic replace replyToken
   * @param messages
   * @param notificationDisabled
   */ public $replyMessage(
    messages: Message | Message[],
    notificationDisabled?: boolean
  ): Promise<any> {
    throw Error("No reply token");
  }
}
