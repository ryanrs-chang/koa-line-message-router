# Installation

```
npm install koa-line-message-router
```

# Hello Message Router

```js
const Koa = require("koa");
const MessageRouter = require("MessageRouter").default;
const app = new Koa();

const msgRouter = new MessageRouter();

msgRouter.use(async function middleware(ctx, next) {
  const start = new Date();
  await next()
  const ms = new Date() - start;
  console.log("message response time")
})

msgRouter.message(
  async (ctx, next) => {
    //
    // do something
    //
    await next()
  },
  ctx => {
  //
  // handle Message event
  //
};

msgRouter.join(ctx => {
  //
  // handle Join event
  //
};

app.use(msgRouter.routes());

app.listen(3000);
```
