import cron from "node-cron";
import { DIContainer } from "../di/container";
import { SyncFleetUseCase } from "../../domain/use-cases/telemetry";

export class TelemetrySyncJob {
  static start() {
    // Run every 60 seconds
    cron.schedule("*/120 * * * * *", async () => {
      console.log("[JOB] Starting telemetry sync...");
      try {
        const container = DIContainer.getInstance();
        const syncFleetUseCase =
          container.resolve<SyncFleetUseCase>("SyncFleetUseCase");

        await syncFleetUseCase.execute();
        console.log("[JOB] Telemetry sync completed.");
      } catch (error) {
        console.error("[JOB] Telemetry sync failed:", error);
      }
    });
  }
}
