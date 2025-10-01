import { Response, Request, NextFunction } from "express";
import { JwtAdapter } from "../../config/jwt";
import { AuthRepository, User, Logger, CustomError } from "../../domain";

//Extendiendo el tipo Request de express para agregar user
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export class AuthMiddleware {
  constructor(private readonly authRepository: AuthRepository) {}

  validateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = this.extractToken(req);

    try {
      const payload = await JwtAdapter.validateToken<{ id: string }>(token);

      if (!payload) {
        Logger.warn("Token no válido", {
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        });
        return next(CustomError.unauthorized("Token no válido"));
      }

      const user = await this.authRepository.findById(payload.id);

      if (!user) {
        return next(CustomError.notFound("Usuario no encontrado"));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(CustomError.unauthorized("Fallo en la autenticación"));
    }
  };

  private extractToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw CustomError.unauthorized("El token de autorización es requerido");
    }
    return authHeader.split(" ")[1];
  }
}
