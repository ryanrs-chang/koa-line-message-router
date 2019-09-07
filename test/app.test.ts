// import MessageRouter from "../src/app";
import MessageRouter from "../dist/app";

function delay() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve("我是傳下去的值");
    }, 1000);
  });
}

describe("testing message router", () => {
  let router = null;
  beforeEach(() => {
    router = new MessageRouter();
  });

  test("create", async () => {
    // router.use(async (ctx, next) => {
    //   //
    //   console.log("middleware 1");
    //   next();
    // });

    router.join(
      async (ctx, next) => {
        console.log("1 start");
        await delay();

        await next();
        console.log("1 done");
      },
      async (ctx, next) => {
        console.log("2 start");
        // await delay();
        await next();
        console.log("2 done");
      },
      async (ctx, next) => {
        console.log("3 start");
        // await delay();
        await next();
        console.log("3 done");
      },
      async (ctx, next) => {
        console.log("4 start");
        // await delay();
        await next();
        console.log("4 done");
      },
      async (ctx, next) => {
        console.log("join");
        await next();
      }
    );

    const ctx = {
      request: {
        body: {
          events: [
            {
              type: "join"
            }
          ]
        }
      }
    };

    router.dispatchEvent(ctx, {});

    // const compose = router.routes();
    // await compose(
    //   ctx,
    //   () => {
    //     console.log("call next");
    //   }
    // );
  });
});
