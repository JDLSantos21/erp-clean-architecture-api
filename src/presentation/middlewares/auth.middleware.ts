import { Response, Request, NextFunction } from "express";
import { JwtAdapter } from "../../config/jwt";
import { AuthRepository, CustomError, User } from "../../domain";

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

  validateJWT = async (req: Request, _: Response, next: NextFunction) => {
    try {
      const token = this.extractToken(req);
      const payload = await JwtAdapter.validateToken<{ id: string }>(token);

      if (!payload) throw CustomError.unauthorized("Token no válido");

      const user = await this.authRepository.findById(payload.id);
      if (!user) throw CustomError.unauthorized("Usuario no encontrado");

      req.user = user;

      next();
    } catch (error) {
      console.log("Error de validación de token:", error);
      throw CustomError.unauthorized("Error de autenticación");
    }
  };

  private extractToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw CustomError.unauthorized("No se proporcionó un token válido");
    }
    return authHeader.split(" ")[1];
  }
}
