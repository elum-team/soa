import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";

import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import formbody from "@fastify/formbody";

import { Request, TypeError } from "../index";

type Callback = (value: any, reply: any) => void;
type Events = (events: Record<string, Callback>) => void;

type Listen = (PORT: number, HOST: string) => Promise<unknown>;

interface ExecuteRequest {
  Body: {
    type?: string;
    value?: any
  }
}

interface ServerOPT<T> {
  secret: string;
  services: Record<keyof T | string, string>;
}

const sending = (reply: FastifyReply) => (data: any) => reply
  .header("content-type", "application/json; charset=utf-8")
  .code(200)
  .send(data);

class Server<M extends Record<string, any>>{

  private secret: string;
  private services: Record<keyof M | string, string>;

  private server: FastifyInstance = Fastify();
  private callback: Record<string, Callback | undefined>;

  constructor(opt: ServerOPT<M>) {

    this.secret = opt.secret;
    this.services = opt.services;

    this.server.register(cors, { origin: "*" });
    this.server.register(formbody);
    this.server.register(multipart, { attachFieldsToBody: true, addToBody: true });

    this.server.route({
      url: "/",
      method: "POST",
      preHandler: this.preHandler,
      handler: this.handler
    });

  }

  private preHandler = (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const response = sending(reply);
    try {
      const { authorization } = request.headers;

      if (!this.secret) { done(); return; };
      if (!authorization || authorization !== this.secret) {
        response(Request.AccessDenied);
        return;
      };

      done();

    } catch (error) {
      console.error(error);
      response(Request.BadRequest);
    }
  }

  private handler = (request: FastifyRequest<ExecuteRequest>, reply: FastifyReply) => {
    const response = sending(reply);
    try {
      if (!this.callback) { response(Request.NotReady); return; }

      const { type, value } = request.body;
      console.log(request.body)
      if (!type || !value) { response(Request.BadRequest); return; };


      const callback = this.callback[type];
      if (!callback && typeof callback !== "function") {
        response(Request.MethodIsNotDefined);
        return;
      }

      callback(value, response);
    } catch (error) {
      console.error(error);
      response(Request.BadRequest);
    }
  }

  readonly events: Events = (callback) => { this.callback = callback };

  readonly listen: Listen = async (PORT = 18400, HOST = "0.0.0.0") => {
    try {

      await this.server.listen({ port: PORT, host: HOST });

      const info = this.server.server.address();

      if (!info) {
        console.info("Server is not starting");
        process.exit(1)
      }

      const { address, port } = typeof info === "string" ?
        { address: HOST, port: PORT } :
        info;

      console.info(`[INFO] Listener port ${address}:${port}`);

    } catch (err) {
      this.server.log.error(err)
      process.exit(1)
    }
  }


  public send<S extends keyof M, T extends keyof M[S]>(service: S, type: T, value: M[S][T][0]): Promise<[TypeError, undefined] | [undefined, M[S][T][1]]>;
  public send<S extends keyof M, T extends keyof M[S]>(service: S, type: T, value: M[S][T][0], callback: (data: [TypeError, undefined] | [undefined, M[S][T][1]]) => void): void;
  public send<S extends keyof M, T extends keyof M[S]>(service: S, type: T, value: M[S][T][0], callback?: (data: [TypeError, undefined] | [undefined, M[S][T][1]]) => void): void | Promise<[TypeError, undefined] | [undefined, M[S][T][1]]> {

    const url = this.services[service];

    if (!url) {
      console.warn(`[WARN] ${service.toString()} in not defined`);
      return;
    }

    const host = `http://${url}/`;

    const data = {
      method: "POST",
      headers: {
        "Authorization": this.secret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: type,
        value: value
      })
    }

    if (!callback) {
      return new Promise(async (resolve) => {
        const request = await fetch(host, data);
        const { error, response } = await request.json() as Record<string, any>;
        if (error) { console.error(error); }
        resolve([error, response]);
      });
    } else {
      new Promise(async () => {
        try {
          const request = await fetch(host, data);
          const { error, response } = await request.json() as Record<string, any>;
          if (error) {
            console.error(error);
            callback([error, undefined]);
          }
          callback([undefined, response]);
        } catch { callback([Request.ServerError.error, undefined]) }
      });
    }

  }

}

export {
  Server
}
