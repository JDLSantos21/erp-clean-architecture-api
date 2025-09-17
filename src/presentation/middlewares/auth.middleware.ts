import { Response, Request, NextFunction } from "express";
import { JwtAdapter } from "../../config/jwt";
import { prisma } from "../../data/postgresql/config";
import { RoleName } from "../../domain";

//Extendiendo el tipo Request de express para agregar la propiedad user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        password: string;
        name: string;
        lastName: string;
        roles: RoleName[];
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export class AuthMiddleware {
  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "No se proporcionó token" });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Formato de token no válido" });
      return;
    }

    const token = authHeader.split(" ").at(1) || "";

    try {
      const payload = await JwtAdapter.validateToken<{ id: string }>(token);

      if (!payload) {
        res.status(401).json({ error: "Token no válido" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        include: { roles: { include: { role: { select: { name: true } } } } },
      });

      const roleNames = user?.roles.map((userRole) => userRole.role.name);

      if (!user) {
        res.status(401).json({ error: "Token no válido" });
        return;
      }

      req.user = { ...user, roles: roleNames! };

      next();
    } catch (error) {
      console.log("Error de validación de token:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
}
