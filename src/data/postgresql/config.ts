import { PrismaClient, Prisma } from "@prisma/client";

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
  console.log(
    `🔍 Query #${queryCount} [${currentOperation}]: ${e.query.substring(
      0,
      100
    )}${e.query.length > 100 ? "..." : ""}`
  );
  console.log(`📝 Params: ${e.params}`);
  console.log(`⏱️  Duration: ${e.duration}ms`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
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
          console.log(`\n🆕 NEW INVENTORY OPERATION: ${currentOperation}`);
          console.log("═══════════════════════════════════════════════════");
        }

        const result = await query(args);
        const duration = Date.now() - start;

        if (isInventoryOperation) {
          // Esperar un momento para capturar todas las queries relacionadas
          setTimeout(() => {
            const totalTime = Date.now() - requestStartTime;
            console.log("═══════════════════════════════════════════════════");
            console.log(`📊 INVENTORY OPERATION SUMMARY: ${currentOperation}`);
            console.log(`🔢 Total Queries: ${queryCount}`);
            console.log(`⏱️  Total Time: ${totalTime}ms`);
            console.log(
              `${queryCount > 2 ? "❌" : "✅"} N+1 Status: ${
                queryCount > 2 ? "DETECTED - Consider optimization" : "OPTIMAL"
              }`
            );
            if (queryCount > 2) {
              console.log(
                "💡 Expected: 1 query (materials with includes) + 1 query (count) = 2 total"
              );
            }
            console.log(
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
