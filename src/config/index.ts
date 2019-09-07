export const channelSecret: string = process.env.API_SECRET;
export const channelAccessToken: string = process.env.API_ACCESS_TOKEN;
export enum Role {
  User = 1,
  Manager = 2,
  Maintainer = 3,
  Administrator = 4
}

export enum Status {
  Normal = "normal",
  Deleted = "deleted",
  Completed = "completed"
}

export enum UserType {
  Line = "line",
  Unknown = "Unknown"
}

export const TITLE_MESSAGE = "本週零打開始報名";
export const LINE_VERIFY_USER_ID = "Udeadbeefdeadbeefdeadbeefdeadbeef";
