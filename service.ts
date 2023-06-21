import { Action, Request, Server, Callback } from "./dist";

import config from "./config.json";

interface EventsMiscoservice {
  shop: Shop;
  user: User;
};

interface User {
  GET_GOODS: [{ id: number }, { result: boolean }];
};

interface Shop {
  GET_GOODS: [{ id: number }, { result: boolean }];
};

const server = new Server<EventsMiscoservice>(config);

const GET_GOODS: Action<Shop, "GET_GOODS"> = (value, reply) => {
  reply(Request.Success({ result: true }));
};

server.events({
  GET_GOODS
});

server.listen(18400, "0.0.0.0");

let count = 0;
setInterval(() => {
  server.send("shop", "GET_GOODS", { id: ++count }, ([error, data]) => {
    if (error) { console.log(error); return; }
    console.log(data)
  })
}, 10);
