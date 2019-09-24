import MessageRouter from "../src";
import joinMessage from "./messages/join";
import textMessage from "./messages/textMessage";
import { Context } from "koa";
import { channelAccessToken, channelSecret } from "../src/config";
import { RouterConfig } from "../src/lib/types";

const config: RouterConfig = {
  channelAccessToken,
  channelSecret,
  path: "/callback"
};

function delay(ms = 1) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function requestHelper(...messages) {
  const events = [];

  messages.forEach(m => events.push(m));

  return {
    request: {
      method: "post",
      path: "/callback",
      body: {
        events
      }
    }
  } as Context;
}

describe("testing middleware", () => {
  let router: MessageRouter = null;
  beforeEach(() => {
    router = new MessageRouter();
  });

  test("two middleware", async () => {
    const route = [];
    router.use(async (ctx, next) => {
      route.push(1);
      await next();
      route.push(2);
    });

    router.use(async (ctx, next) => {
      route.push(3);
      await next();
      route.push(4);
    });

    const dispatch = router.routes(config);
    await dispatch(requestHelper(joinMessage), Promise.resolve);
    expect(route).toEqual([1, 3, 4, 2]);
  });

  test("test no 'await' next()", async () => {
    const route = [];

    router.use(async (ctx, next) => {
      route.push(1);
      next();
      route.push(2);
    });

    router.use(async (ctx, next) => {
      route.push(3);
      await next();
      route.push(4);
    });

    const dispatch = router.routes(config);
    await dispatch(requestHelper(joinMessage), Promise.resolve);
    expect(route).toEqual([1, 3, 2, 4]);
  });

  test("test middleware and handle 'join' function", async () => {
    const route = [];

    router.use(async (ctx, next) => {
      route.push(1);
      await next();
      route.push(2);
    });

    router.use(async (ctx, next) => {
      route.push(3);
      await next();
      route.push(4);
    });

    router.message(async () => {
      route.push(5);
    });

    router.join(async () => {
      route.push(6);
    });

    const dispatch = router.routes(config);
    await dispatch(requestHelper(joinMessage), Promise.resolve);
    expect(route).toEqual([1, 3, 6, 4, 2]);
  });

  test("test mixed middleware and handle function for 'message' order", async () => {
    const route = [];

    router.use(async (ctx, next) => {
      route.push(1);
      await next();
      route.push(2);
    });

    router.message(async () => {
      route.push(3);
    });

    router.use(async (ctx, next) => {
      route.push(4);
      await next();
      route.push(5);
    });

    router.join(async () => {
      route.push(6);
    });

    const dispatch = router.routes(config);
    await dispatch(requestHelper(joinMessage), Promise.resolve);
    expect(route).toEqual([1, 4, 6, 5, 2]);
  });

  test("test mixed middleware and handle function", async () => {
    const route = [];

    router.use(async (ctx, next) => {
      route.push(1);
      await next();
      route.push(2);
    });

    router.join(async () => {
      route.push(3);
    });

    router.use(async (ctx, next) => {
      route.push(4);
      await next();
      route.push(5);
    });

    router.message(async () => {
      route.push(6);
    });

    const dispatch = router.routes(config);
    await dispatch(requestHelper(joinMessage), Promise.resolve);
    expect(route).toEqual([1, 3, 2]);
  });

  test("test handle function route", async () => {
    const route = [];

    router.use(async (ctx, next) => {
      route.push(1);
      await next();
      route.push(2);
    });

    router.join(
      async (ctx, next) => {
        route.push(3);
        await next();
        route.push(4);
      },
      async ctx => {
        route.push(5);
      }
    );

    const dispatch = router.routes(config);
    await dispatch(requestHelper(joinMessage), Promise.resolve);
    expect(route).toEqual([1, 3, 5, 4, 2]);
  });

  test("test handle type is MessageRouter", async () => {
    const route = [];

    const another: MessageRouter = new MessageRouter();

    another.message(async ctx => {
      route.push(10);
    });

    router.use(async (ctx, next) => {
      route.push(1);
      await next();
      route.push(2);
    });

    router.use(another);

    router.join(async ctx => {
      route.push(5);
    });

    const dispatch = router.routes(config);
    await dispatch(requestHelper(textMessage), Promise.resolve);
    expect(route).toEqual([1, 10, 2]);
  });
});

describe("testing multi events", () => {
  let router: MessageRouter = null;
  beforeEach(() => {
    router = new MessageRouter();
  });

  test("'all message' and 'join' route", async () => {
    const messageRoute = [];
    const joinRoute = [];

    router.message(async (ctx, next) => {
      messageRoute.push(1);
      await next();
      messageRoute.push(2);
    });

    router.join(async (ctx, next) => {
      joinRoute.push(3);
      await next();
      joinRoute.push(4);
    });

    const dispatch = router.routes(config);
    await dispatch(requestHelper(textMessage), Promise.resolve);
    expect(messageRoute).toEqual([1, 2]);
    expect(joinRoute).toEqual([]);
  });

  test("should 'test' regex is successful for specific message route", async () => {
    const route = [];

    router.message(/route 1/, async (ctx, next) => {
      route.push(1);
    });

    router.message(/test/, async (ctx, next) => {
      route.push(2);
    });

    textMessage.message.text = "test";

    const dispatch = router.routes(config);
    await dispatch(requestHelper(textMessage), Promise.resolve);
    expect(route).toEqual([2]);
  });

  test("should 'test' regex is successful for specific message route", async () => {
    const route = [];

    router.message(async (ctx, next) => {
      route.push(1);
      await next();
      route.push(2);
    });

    router.message(/test/, async (ctx, next) => {
      route.push(3);
      await next();
      route.push(4);
    });

    textMessage.message.text = "testtest";

    const dispatch = router.routes(config);
    await dispatch(requestHelper(textMessage), Promise.resolve);
    expect(route).toEqual([1, 3, 4, 2]);
  });

  test("should routing successful, match function is string type", async () => {
    const route = [];

    router.message(async (ctx, next) => {
      route.push(1);
      await next();
      route.push(2);
    });

    router.message("test", async (ctx, next) => {
      route.push(3);
      await next();
      route.push(4);
    });

    textMessage.message.text = "test";

    const dispatch = router.routes(config);
    await dispatch(requestHelper(textMessage), Promise.resolve);
    expect(route).toEqual([1, 3, 4, 2]);
  });

  test("should routing successful, match function is string type and regex type", async () => {
    const route = [];

    router.message(async (ctx, next) => {
      route.push(1);
      await next();
      route.push(2);
    });

    router.message("test", async (ctx, next) => {
      route.push(3);
      await next();
      route.push(4);
    });

    router.message(/another/, async (ctx, next) => {
      route.push(5);
      await next();
      route.push(6);
    });

    textMessage.message.text = "another";

    const dispatch = router.routes(config);
    await dispatch(requestHelper(textMessage), Promise.resolve);
    expect(route).toEqual([1, 5, 6, 2]);
  });
});

describe("testing middleware with context ", () => {
  let router: MessageRouter = null;
  beforeEach(() => {
    router = new MessageRouter();
  });

  test("two middleware", async () => {
    const route = [];
    router.use(async (ctx, next) => {
      route.push(ctx.event.type);
      await next();
    });

    const dispatch = router.routes(config);
    await dispatch(requestHelper(joinMessage), Promise.resolve);
    expect(route).toEqual([joinMessage.type]);
  });
});
