import { Context as koaContext } from "koa";
import { Client, WebhookEvent } from "@line/bot-sdk";
import { Message } from "@line/bot-sdk/lib/types";
import MessageRouter from "../app";
export default class Context {
  private _koaContext: koaContext = null;
  private _client: Client;
  private _event: WebhookEvent;
  private _app: MessageRouter;

  constructor(koaContext: koaContext, event: WebhookEvent, client: Client) {
    this._koaContext = koaContext;
    this._client = client;
    this._event = event;

    if (this._event["replyToken"]) {
      this.$replyMessage = this._client.replyMessage.bind(
        this,
        this._event["replyToken"]
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
