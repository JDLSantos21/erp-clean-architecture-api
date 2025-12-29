import { PrismaClient } from "@prisma/client";
import { Logger } from "../../domain";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});

// Variables globales para tracking
let queryCount = 0;
let requestStartTime = Date.now();
let currentOperation = "";

// Event listener para queries
prisma.$on("query", (e) => {
  queryCount++;
  Logger.info(
    `🔍 Query #${queryCount} [${currentOperation}]: ${e.query.substring(
      0,
      100
    )}${e.query.length > 100 ? "..." : ""}`
  );
  Logger.info(`📝 Params: ${e.params}`);
  Logger.info(`⏱️  Duration: ${e.duration}ms`);
  Logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

// Middleware para contar queries y trackear operaciones
prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now();

        // Detectar el inicio de una nueva operación de Inventory
        const isInventoryOperation =
          model === "Material" &&
          (operation === "findMany" || operation === "findUnique");

        if (isInventoryOperation) {
          queryCount = 0; // Reset counter para nueva operación
          requestStartTime = Date.now();
          currentOperation = `${model.toUpperCase()}.${operation}`;
          Logger.info(`\n🆕 NEW INVENTORY OPERATION: ${currentOperation}`);
          Logger.info("═══════════════════════════════════════════════════");
        }

        const result = await query(args);
        const duration = Date.now() - start;

        if (isInventoryOperation) {
          // Esperar un momento para capturar todas las queries relacionadas
          setTimeout(() => {
            const totalTime = Date.now() - requestStartTime;
            Logger.info("═══════════════════════════════════════════════════");
            Logger.info(`📊 INVENTORY OPERATION SUMMARY: ${currentOperation}`);
            Logger.info(`🔢 Total Queries: ${queryCount}`);
            Logger.info(`⏱️  Total Time: ${totalTime}ms`);
            Logger.info(
              `${queryCount > 2 ? "❌" : "✅"} N+1 Status: ${
                queryCount > 2 ? "DETECTED - Consider optimization" : "OPTIMAL"
              }`
            );
            if (queryCount > 2) {
              Logger.info(
                "💡 Expected: 1 query (materials with includes) + 1 query (count) = 2 total"
              );
            }
            Logger.info(
              "═══════════════════════════════════════════════════\n"
            );
          }, 100);
        }

        return result;
      },
    },
  },
});

export { prisma };
