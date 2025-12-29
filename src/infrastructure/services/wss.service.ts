import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { IWssService } from "../../domain/services/wss.service";
import { envs, JwtAdapter } from "../../config";

interface Options {
  server?: HttpServer;
}

export class WssService implements IWssService {
  private io: Server | undefined;

  constructor(options?: Options) {
    if (options?.server) {
      this.init(options.server);
    }
  }

  public init(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: envs.CORS_ORIGINS,
        methods: ["GET", "POST"],
      },
    });
    this.start();
  }

  public sendMessage(type: string, payload: Object) {
    if (this.io) {
      this.io.emit(type, payload);
    } else {
      console.warn("WssService not initialized, message lost", type);
    }
  }

  public start() {
    if (!this.io) return;

    this.io.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth.token as string | undefined;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const payload = await JwtAdapter.validateToken(token);
      if (!payload) {
        return next(new Error("Authentication error"));
      }

      next();
    });

    this.io.on("connection", (socket) => {
      socket.on("disconnect", () => {});
    });
  }
}
