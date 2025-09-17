import { NextFunction, Request, Response } from "express";
import { User } from "../../domain";

export class PermissionMiddleware {
  static async isUser(req: Request, res: Response, next: NextFunction) {
    const user: Partial<User> = req.user!;

    if (!user || !user.roles) {
      res.status(403).json({ error: "Acceso denegado" });
      return;
    }
    if (!user.roles.includes("USER")) {
      res.status(403).json({ error: "Se requieren permisos de usuario" });
      return;
    }
    next();
  }

  static async isAdmin(req: Request, res: Response, next: NextFunction) {
    const user: Partial<User> = req.user!;

    if (!user || !user.roles) {
      res.status(403).json({ error: "Acceso denegado" });
      return;
    }

    if (!user.roles.includes("ADMIN")) {
      res.status(403).json({ error: "Se requiere permisos de administrador" });
      return;
    }

    next();
  }

  static elevateRole(req: Request, res: Response, next: NextFunction) {
    const user: Partial<User> = req.user!;

    if (!user || !user.roles) {
      res.status(403).json({ error: "Acceso denegado" });
      return;
    }

    // Roles necesitan ser 'ADMIN' o 'ADMINISTRATIVO'
    if (
      !user.roles.includes("ADMIN") &&
      !user.roles.includes("ADMINISTRATIVO")
    ) {
      res.status(403).json({ error: "Se requieren permisos administrativos" });
      return;
    }

    next();
  }
}
