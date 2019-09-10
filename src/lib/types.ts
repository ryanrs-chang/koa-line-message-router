import Context from "./context";

export type HandleFunction = (
  ctx: Context,
  next?: () => Promise<any>
) => Promise<any>;

export enum MessageEvent {
  Message = "message",
  Follow = "follow",
  Unfollow = "unfollow",
  Join = "join",
  Leave = "leave",
  MemberJoined = "memberJoined",
  MemberLeft = "memberLeft",
  Postback = "postback",
  Beacon = "beacon",
  AccountLink = "accountLink",
  DeviceLink = "deviceLink",
  DeviceUnlink = "deviceUnlink",
  ThingsExecution = "thingsExecution"
}

export enum MessageType {
  Image = "image",
  Video = "video",
  Audio = "audio",
  File = "file",
  Location = "location",
  Sticke = "sticke"
}

export interface allowEvent {
  message(message: RegExp, ...middlewares: HandleFunction[]): this;
  message(...middlewares: HandleFunction[]): this;
  follow(...middlewares: HandleFunction[]): this;
  unfollow(...middlewares: HandleFunction[]): this;
  join(...middlewares: HandleFunction[]): this;
  leave(...middlewares: HandleFunction[]): this;
  memberJoined(...middlewares: HandleFunction[]): this;
  memberLeft(...middlewares: HandleFunction[]): this;
  postback(...middlewares: HandleFunction[]): this;
  beacon(...middlewares: HandleFunction[]): this;
  accountLink(...middlewares: HandleFunction[]): this;
  deviceLink(...middlewares: HandleFunction[]): this;
  deviceUnlink(...middlewares: HandleFunction[]): this;
  thingsExecution(...middlewares: HandleFunction[]): this;
}
