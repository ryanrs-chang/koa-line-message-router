const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const LineRouter = require("../dist/app").default;
const app = new Koa();
const lineRouter = new LineRouter();

app.use(bodyParser());

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`response time: ${ms}ms`);
});

lineRouter.use(async (ctx, next) => {
  console.log("middleware, event type:", ctx.event.type);
  await next();
});

lineRouter.message(/Hello world/, async ctx => {
  console.log(ctx.text);
});

app.use(lineRouter.routes({ channelAccessToken: "test" }));

app.listen(3001);
