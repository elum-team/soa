type Callback = (value: any, reply: any) => void;
type Events = (events: Record<string, Callback>) => void;
type Listen = (PORT: number, HOST: string) => Promise<unknown>;
type TypeError = {
    code: number;
    message: string;
};
type RequestData<T> = {
    response: T;
} | {
    error: TypeError;
};
type Action<D extends Record<string, any>, T extends keyof D, RES = D[T][0], REQ = RequestData<D[T][1]>> = (value: RES, reply: (value: REQ) => void) => void;

interface ServerOPT<T> {
    secret: string;
    services: Record<keyof T | string, string>;
}
declare class Server<M extends Record<string, any>> {
    private secret;
    private services;
    private server;
    private callback;
    constructor(opt: ServerOPT<M>);
    private preHandler;
    private handler;
    readonly events: Events;
    readonly listen: Listen;
    send<S extends keyof M, T extends keyof M[S]>(service: S, type: T, value: M[S][T][0]): Promise<[TypeError, undefined] | [undefined, M[S][T][1]]>;
    send<S extends keyof M, T extends keyof M[S]>(service: S, type: T, value: M[S][T][0], callback: (data: [TypeError, undefined] | [undefined, M[S][T][1]]) => void): void;
}

declare class Request {
    static Success: <T>(data: T) => {
        response: T;
    };
    static Error: (data: TypeError) => {
        error: TypeError;
    };
    static NotReady: {
        error: TypeError;
    };
    static MethodIsNotDefined: {
        error: TypeError;
    };
    static BadRequest: {
        error: TypeError;
    };
    static AccessDenied: {
        error: TypeError;
    };
    static ServerError: {
        error: TypeError;
    };
}

export { Action, Callback, Events, Request, RequestData, Server, TypeError };
