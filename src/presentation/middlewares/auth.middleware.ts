import { Response, Request, NextFunction } from "express";
import { JwtAdapter } from "../../config/jwt";
import { prisma } from "../../data/postgresql/config";

//extend request type

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        name: string;
        lastName: string;
        roles: string[];
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export class AuthMiddleware {
  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    //validate token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Invalid token format" });
      return;
    }

    const token = authHeader.split(" ").at(1) || "";

    try {
      const payload = await JwtAdapter.validateToken<{ id: string }>(token);

      if (!payload) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        include: { roles: { include: { role: { select: { name: true } } } } },
      });

      const roleNames = user?.roles.map((userRole) => userRole.role.name);

      if (!user) {
        res.status(401).json({ error: "invalid token" });
        return;
      }

      req.user = { ...user, roles: roleNames! };

      next();
    } catch (error) {
      console.log("Token validation error:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
}
