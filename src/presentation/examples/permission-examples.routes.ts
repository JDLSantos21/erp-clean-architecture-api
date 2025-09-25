import Router, { Router as RouterType } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionMiddleware } from "../middlewares/permission.middleware";

/**
 * EJEMPLOS DE USO DEL NUEVO SISTEMA DE PERMISOS
 *
 * Ahora tienes varias formas de manejar permisos:
 */

export class ExampleRoutes {
  static get routes(): RouterType {
    const router = Router();

    // Siempre aplicar autenticación primero
    router.use(AuthMiddleware.validateJWT);

    /**
     * OPCIÓN 1: Usar niveles de permisos (Recomendado)
     * Más flexible y escalable
     */

    // Solo lectura - Cualquier usuario autenticado (nivel 1+)
    router.get("/public-data", PermissionMiddleware.readOnly, (req, res) =>
      res.json({ message: "Datos públicos" })
    );

    // Operaciones básicas - CHOFER o superior (nivel 2+)
    router.post(
      "/basic-operation",
      PermissionMiddleware.basicOperations,
      (req, res) => res.json({ message: "Operación básica realizada" })
    );

    // Operaciones avanzadas - OPERADOR o superior (nivel 3+)
    router.put(
      "/advanced-operation",
      PermissionMiddleware.advancedOperations,
      (req, res) => res.json({ message: "Operación avanzada realizada" })
    );

    // Supervisión - SUPERVISOR o superior (nivel 4+)
    router.get(
      "/supervision-data",
      PermissionMiddleware.supervision,
      (req, res) => res.json({ message: "Datos de supervisión" })
    );

    // Administración - ADMINISTRATIVO o superior (nivel 5+)
    router.post(
      "/admin-operation",
      PermissionMiddleware.administration,
      (req, res) => res.json({ message: "Operación administrativa realizada" })
    );

    // Solo administradores del sistema - ADMIN únicamente (nivel 6)
    router.delete(
      "/critical-operation",
      PermissionMiddleware.systemAdmin,
      (req, res) => res.json({ message: "Operación crítica realizada" })
    );

    /**
     * OPCIÓN 2: Usar roles específicos o superiores
     * Compatible con tu código anterior
     */

    // CHOFER o cualquier rol superior puede acceder
    router.get("/vehicle-data", PermissionMiddleware.isChofer, (req, res) =>
      res.json({ message: "Datos de vehículos" })
    );

    // OPERADOR o cualquier rol superior puede acceder
    router.post(
      "/inventory-operation",
      PermissionMiddleware.isOperador,
      (req, res) => res.json({ message: "Operación de inventario" })
    );

    /**
     * OPCIÓN 3: Roles específicos sin jerarquía
     * Para casos donde no quieres jerarquía
     */

    // Solo CHOFER y OPERADOR, pero NO SUPERVISOR ni superiores
    router.get(
      "/specific-roles-only",
      PermissionMiddleware.requireSpecificRoles(["CHOFER", "OPERADOR"]),
      (req, res) => res.json({ message: "Solo CHOFER y OPERADOR" })
    );

    /**
     * OPCIÓN 4: Excluir roles específicos
     * Para casos donde quieres que ciertos roles NO tengan acceso
     */

    // Todos excepto USER y CHOFER
    router.post(
      "/exclude-certain-roles",
      PermissionMiddleware.excludeRoles(["USER", "CHOFER"]),
      (req, res) =>
        res.json({ message: "Acceso para todos excepto USER y CHOFER" })
    );

    /**
     * OPCIÓN 5: Combinaciones complejas
     */

    // Mínimo OPERADOR pero excluir CHOFER
    router.get(
      "/complex-permission",
      PermissionMiddleware.isOperador,
      PermissionMiddleware.excludeRoles(["CHOFER"]),
      (req, res) => res.json({ message: "OPERADOR o superior, pero no CHOFER" })
    );

    /**
     * CASOS DE USO ESPECÍFICOS PARA TU ERP:
     */

    // Gestión de empleados - Solo administrativos
    router.post(
      "/employees",
      PermissionMiddleware.administration, // ADMINISTRATIVO o ADMIN
      (req, res) => res.json({ message: "Empleado creado" })
    );

    // Consumo de combustible - Choferes y superiores
    router.post(
      "/fuel-consumption",
      PermissionMiddleware.basicOperations, // CHOFER o superior
      (req, res) => res.json({ message: "Consumo registrado" })
    );

    // Inventario - Operadores y superiores
    router.post(
      "/inventory-movement",
      PermissionMiddleware.advancedOperations, // OPERADOR o superior
      (req, res) => res.json({ message: "Movimiento de inventario registrado" })
    );

    // Reportes - Supervisores y superiores
    router.get(
      "/reports",
      PermissionMiddleware.supervision, // SUPERVISOR o superior
      (req, res) => res.json({ message: "Reportes disponibles" })
    );

    return router;
  }
}
