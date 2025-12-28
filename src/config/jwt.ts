import jwt from "jsonwebtoken";
import { envs } from "./envs";
import crypto from "crypto";

export class JwtAdapter {
  private static readonly ACCESS_TOKEN_EXPIRATION = 300 * 60; // 5 horas en segundos
  // 7 días para refresh token
  private static readonly REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60; // 7 días en segundos

  static async generateAccessToken(payload: Object): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        envs.JWT_SECRET,
        { expiresIn: this.ACCESS_TOKEN_EXPIRATION },
        (err, token) => {
          if (err) return resolve(null);
          resolve(token!);
        }
      );
    });
  }

  static async generateRefreshToken(payload: Object): Promise<string | null> {
    console.log("Generating refresh token with expiration");
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        envs.JWT_SECRET,
        { expiresIn: this.REFRESH_TOKEN_EXPIRATION },
        (err, token) => {
          if (err) return resolve(null);
          resolve(token!);
        }
      );
    });
  }

  /**
   * @deprecated Use generateAccessToken instead
   */
  static async generateToken(
    payload: Object,
    duration: number = 48800
  ): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        envs.JWT_SECRET,
        { expiresIn: duration },
        (err, token) => {
          if (err) return resolve(null);
          resolve(token!);
        }
      );
    });
  }

  static validateToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, envs.JWT_SECRET, (err, decoded) => {
        if (err) return resolve(null);
        resolve(decoded as T);
      });
    });
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(64).toString("hex");
  }

  static getAccessTokenExpiration(): number {
    return this.ACCESS_TOKEN_EXPIRATION;
  }

  static getRefreshTokenExpiration(): number {
    return this.REFRESH_TOKEN_EXPIRATION;
  }

  static getRefreshTokenExpirationDate(): Date {
    return new Date(Date.now() + this.REFRESH_TOKEN_EXPIRATION * 1000);
  }
}
