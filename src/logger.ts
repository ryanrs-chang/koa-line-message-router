import debug from "debug";

export default class Logger {
  public INFO = "[I]";
  public DEBUG = "[D]";
  public WARN = "[W]";
  public ERROR = "[E]";

  constructor(ns: string) {
    const prefix = `[L-Router][${ns}]`;

    this.info = debug(`${prefix}${this.INFO}`).bind(this);
    this.debug = debug(`${prefix}${this.DEBUG}`).bind(this);
    this.warn = debug(`${prefix}${this.WARN}`).bind(this);
    this.error = debug(`${prefix}${this.ERROR}`).bind(this);
  }
  public info(...message: any[]) {}
  public debug(...message: any[]) {}
  public error(...message: any[]) {}
  public warn(...message: any[]) {}
}

/**
 *
 * @param filename __filename
 */
export function filename(filename: string) {
  const matched = filename.match(/\w+\.(js|ts)$/g);
  return matched.pop() || "null";
}

export function LoggerFilename(__filename: string) {
  return new Logger(filename(__filename));
}
