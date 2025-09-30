import { NextFunction, Request, Response } from "express";
import {
  User,
  RoleName,
  hasRoleOrHigher,
  hasPermissionLevel,
  PERMISSION_LEVELS,
  getRoleHierarchyLevel,
  getRoleNameByLevel,
  StatusCode,
} from "../../domain";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";

export class PermissionMiddleware {
  // Middleware genérico para verificar niveles de permisos
  static requirePermissionLevel(requiredLevel: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user: Partial<User> = req.user!;

      const { roles } = user!;

      if (!user || !roles) {
        res.status(403).json({ error: "Acceso denegado" });
        return;
      }

      if (!hasPermissionLevel(roles, requiredLevel)) {
        const userRolesLevel = roles.map((role) => getRoleHierarchyLevel(role)); // Obtener niveles de los roles del usuario

        const details = {
          requiredLevel: getRoleNameByLevel(requiredLevel),
          userMaxLevel: getRoleNameByLevel(Math.max(...userRolesLevel)),
        };

        const errorMessage =
          "No tienes los permisos necesarios para esta acción";

        const response = ResponseBuilder.error(
          StatusCode.FORBIDDEN,
          errorMessage,
          req,
          details
        );

        res.status(403).json(response);
        return;
      }

      next();
    };
  }

  // Middleware genérico para verificar rol específico o superior
  static requireRoleOrHigher(requiredRole: RoleName) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user: Partial<User> = req.user!;

      if (!user || !user.roles) {
        res.status(403).json({ error: "Acceso denegado" });
        return;
      }

      if (!hasRoleOrHigher(user.roles, requiredRole)) {
        res.status(403).json({
          error: `Se requiere rol ${requiredRole} o superior`,
          userRoles: user.roles,
          requiredRole,
        });
        return;
      }

      next();
    };
  }

  // Específicos basados en niveles de permisos
  static readonly readOnly = PermissionMiddleware.requirePermissionLevel(
    PERMISSION_LEVELS.READ_ONLY
  );
  static readonly basicOperations = PermissionMiddleware.requirePermissionLevel(
    PERMISSION_LEVELS.BASIC_OPERATIONS
  );
  static readonly advancedOperations =
    PermissionMiddleware.requirePermissionLevel(
      PERMISSION_LEVELS.ADVANCED_OPERATIONS
    );
  static readonly supervision = PermissionMiddleware.requirePermissionLevel(
    PERMISSION_LEVELS.SUPERVISION
  );
  static readonly administration = PermissionMiddleware.requirePermissionLevel(
    PERMISSION_LEVELS.ADMINISTRATION
  );
  static readonly systemAdmin = PermissionMiddleware.requirePermissionLevel(
    PERMISSION_LEVELS.SYSTEM_ADMIN
  );

  // Específicos por rol (compatibilidad hacia atrás)
  static readonly isUser = PermissionMiddleware.requireRoleOrHigher("USER");
  static readonly isChofer = PermissionMiddleware.requireRoleOrHigher("CHOFER");
  static readonly isOperador =
    PermissionMiddleware.requireRoleOrHigher("OPERADOR");
  static readonly isSupervisor =
    PermissionMiddleware.requireRoleOrHigher("SUPERVISOR");
  static readonly isAdministrativo =
    PermissionMiddleware.requireRoleOrHigher("ADMINISTRATIVO");
  static readonly isAdmin = PermissionMiddleware.requireRoleOrHigher("ADMIN");

  // Alias para compatibilidad con código existente
  static elevateRole = PermissionMiddleware.isAdministrativo;

  // Verificar múltiples roles específicos (sin jerarquía)
  static requireSpecificRoles(roles: RoleName[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user: Partial<User> = req.user!;

      if (!user || !user.roles) {
        res.status(403).json({ error: "Acceso denegado" });
        return;
      }

      const hasAnyRole = roles.some((role) => user.roles!.includes(role));

      const errorMessage = `Se requiere uno de los siguientes roles: ${roles.join(
        ", "
      )}`;

      const response = ResponseBuilder.error(
        StatusCode.FORBIDDEN,
        errorMessage,
        req,
        { userRoles: user.roles, requiredRoles: roles }
      );

      if (!hasAnyRole) {
        res.status(403).json(response);
        return;
      }

      next();
    };
  }

  // Excluir ciertos roles
  static excludeRoles(excludedRoles: RoleName[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user: Partial<User> = req.user!;

      if (!user || !user.roles) {
        res.status(403).json({ error: "Acceso denegado" });
        return;
      }

      const hasExcludedRole = excludedRoles.some((role) =>
        user.roles!.includes(role)
      );

      if (hasExcludedRole) {
        res.status(403).json({
          error: "Tu rol no tiene acceso a esta funcionalidad",
          excludedRoles,
        });
        return;
      }

      next();
    };
  }
}
