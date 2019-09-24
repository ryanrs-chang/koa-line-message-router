faster build your line robot.

* decrease `if.. else..` code segments
* more clean code
* build prototype to faster

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

msgRouter.message(/help/g, ctx => {
  //
  // handle Message event
  //
};

msgRouter.message(/test/g, ctx => {
  //
  // handle Message event
  //
};

msgRouter.join(ctx => {
  //
  // handle Join event
  //
};

app.use(msgRouter.routes(...));

app.listen(3000);
```


# TODO

 * [ ] Message View
