import MessageRouter from "../app";

// import Koa from "koa";
// import Router from "koa-router";

// const r = new Router();

// const koa = new Koa();
// koa.use(async (ctx, next) => {
//   console.log("middleware start");
//   await next();
//   console.log("middleware done");
// });
// koa.use(async (ctx, next) => {
//   console.log("middleware start");
//   await next();
//   console.log("middleware done");
// });

// koa.use(r.routes());
// koa.use(r.allowedMethods());

// r.get(
//   "/",
//   async (ctx, next) => {
//     console.log("1 start");
//     await delay();

//     await next();
//     console.log("1 done");
//   },
//   async (ctx, next) => {
//     console.log("2 start");
//     await delay();
//     await next();
//     console.log("2 done");
//   }
// );

// koa.listen(3001);

function delay() {
  return new Promise(resolve => setTimeout(resolve, 1));
}

const router = new MessageRouter();

router.use(async (ctx, next) => {
  console.log("middleware1 start");
  await next();
  console.log("middleware1 done");
});

router.use(async (ctx, next) => {
  console.log("middleware2 start");
  await next();
  console.log("middleware2 done");
});

router.message(/test/g, async ctx => {
  console.log("message include test");
});

router.messageFrom("user", /test/g, async ctx => {
  console.log("message include test and form user");
});

router.join(
  async (ctx, next) => {
    console.log("1 start");
    await delay();
    await next();
    console.log("1 done");
  },
  async (ctx, next) => {
    console.log("2 start");
    await delay();
    await next();
    console.log("2 done");
  },
  async (ctx, next) => {
    console.log("3 start");
    await delay();
    await next();
    console.log("3 done");
  },
  async (ctx, next) => {
    console.log("4 start");
    await delay();
    await next();
    console.log("4 done");
  },
  async (ctx, next) => {
    console.log("join");
    // await next();
  }
);

const ctx = {
  request: {
    body: {
      events: [
        {
          type: "message",
          source: {
            type: "user"
          },
          message: {
            type: "text",
            text: "test"
          }
        }
      ]
    }
  }
} as any;

console.log(" ============== dispatch ============== ");
router.routes()(ctx, {} as any);
