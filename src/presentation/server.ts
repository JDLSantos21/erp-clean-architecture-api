import express, { Router } from "express";
import { Logger } from "../domain";
import { errorHandler } from "./middlewares";

interface Options {
  port?: number;
  routes: Router;
}

export class Server {
  private readonly app = express();
  private readonly port: number;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port = 3100, routes } = options;
    this.port = port;
    this.routes = routes;
  }

  async start() {
    this.setupMiddlewares();

    this.app.use(this.routes);

    this.setupErrorHandler();

    this.app.listen(this.port, () =>
      Logger.info(`Server is running on port ${this.port}`)
    );
  }

  private setupMiddlewares() {
    this.app.use(express.json());
  }

  private setupErrorHandler() {
    this.app.use(errorHandler);
  }
}
