import { Response, Request, NextFunction } from "express";
import { JwtAdapter } from "../../config/jwt";
import {
  AuthRepository,
  User,
  Logger,
  CustomError,
  CacheService,
} from "../../domain";

//Extendiendo Request de express para agregar user
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export class AuthMiddleware {
  private static readonly USER_CACHE_TTL = 900; // 15 minutos
  private static readonly USER_CACHE_PREFIX = "auth:user:";

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly cacheService: CacheService
  ) {}

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

      // Intentar obtener usuario del cache
      const cacheKey = `${AuthMiddleware.USER_CACHE_PREFIX}${payload.id}`;
      const cachedUser = await this.cacheService.get<User>(cacheKey);

      if (cachedUser) {
        req.user = cachedUser;
        return next();
      }

      // Si no está en cache, buscar en la base de datos
      const user = await this.authRepository.findById(payload.id);

      if (!user) {
        return next(CustomError.notFound("Usuario no encontrado"));
      }

      // Guardar en cache para futuras peticiones
      await this.cacheService.set(
        cacheKey,
        user,
        AuthMiddleware.USER_CACHE_TTL
      );

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
