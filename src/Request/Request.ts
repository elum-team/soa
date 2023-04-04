import { TypeError } from "../index"

class Request {

  public static Success = <T>(data: T): { response: T } => ({ response: data });
  public static Error = (data: TypeError): { error: TypeError } => ({ error: data });

  public static NotReady = this.Error({
    code: 0,
    message: "The server is not ready yet. Try a little later"
  });

  public static MethodIsNotDefined = this.Error({
    code: 1,
    message: "Method is not defined"
  });

  public static BadRequest = this.Error({
    code: 2,
    message: "Bad Request"
  });

  public static AccessDenied = this.Error({
    code: 3,
    message: "Access Denied"
  });

  public static ServerError = this.Error({
    code: 4,
    message: "Attempt to connect to server failed"
  })

}

export {
  Request
};
