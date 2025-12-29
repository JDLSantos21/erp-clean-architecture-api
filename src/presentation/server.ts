import express, { Router } from "express";
import cors from "cors";
import { createServer, Server as HttpServer } from "http";
import { Logger } from "../domain";
import { errorHandler } from "./middlewares";
import { corsConfig } from "../config";
import { WssService } from "../infrastructure/services";
import { DIContainer } from "../infrastructure/di/container";

interface Options {
  port?: number;
  routes: Router;
}

export class Server {
  private readonly app = express();
  private readonly port: number;
  private readonly routes: Router;
  private readonly httpServer: HttpServer;

  constructor(options: Options) {
    const { port = 3100, routes } = options;
    this.port = port;
    this.routes = routes;
    this.httpServer = createServer(this.app);
  }

  async start() {
    this.setupMiddlewares();

    this.app.use(this.routes);

    this.setupErrorHandler();

    // Initialize WebSocket Service
    const container = DIContainer.getInstance();
    const wssService = container.resolve<WssService>("WssService");
    wssService.init(this.httpServer);

    this.httpServer.listen(this.port, () => {
      Logger.info(`Server is running on port ${this.port}`);
      Logger.info(
        `CORS configured for origins: ${process.env.CORS_ORIGINS || "default"}`
      );
    });
  }

  private setupMiddlewares() {
    // CORS debe ser el primer middleware
    this.app.use(cors(corsConfig));

    // Body parser
    this.app.use(express.json());

    // URL encoded
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupErrorHandler() {
    this.app.use(errorHandler);
  }
}
