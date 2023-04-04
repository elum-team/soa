type TypeError = {
  code: number;
  message: string;
};

type RequestData<T> = {
  response: T
} | {
  error: TypeError
}

type Action<
  D extends Record<string, any>,
  T extends keyof D,
  RES = D[T][0],
  REQ = RequestData<D[T][1]>
> = (value: RES, reply: (value: REQ) => void) => void;

export {
  Action,
  RequestData,
  TypeError
}