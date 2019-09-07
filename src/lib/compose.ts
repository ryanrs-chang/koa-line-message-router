import koaCompose from "koa-compose";
import { HandleFunction } from "./types";

export default function wrapperCompose(
  middlewares: HandleFunction[]
): HandleFunction {
  return koaCompose(middlewares);
}
