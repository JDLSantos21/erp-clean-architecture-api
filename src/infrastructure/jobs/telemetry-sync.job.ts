import cron from "node-cron";
import { DIContainer } from "../di/container";
import { SyncFleetUseCase } from "../../domain/use-cases/telemetry";
import { Logger } from "../../domain";

export class TelemetrySyncJob {
  static start() {
    // Run every 1 hour
    cron.schedule("0 * * * *", async () => {
      Logger.info("[JOB] Starting telemetry sync...");
      try {
        const container = DIContainer.getInstance();
        const syncFleetUseCase =
          container.resolve<SyncFleetUseCase>("SyncFleetUseCase");

        await syncFleetUseCase.execute();
        Logger.info("[JOB] Telemetry sync completed.");
      } catch (error) {
        Logger.error("[JOB] Telemetry sync failed:", error);
      }
    });
  }
}
