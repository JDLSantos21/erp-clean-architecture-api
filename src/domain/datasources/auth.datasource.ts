import { RegisterUserDto, LoginUserDto, CreateRoleDto } from "../dtos";
import { Role, User, RefreshToken } from "../entities";

export abstract class AuthDataSource {
  abstract createRole(dto: CreateRoleDto): Promise<Role>;
  abstract registerUser(dto: RegisterUserDto): Promise<User>;
  abstract loginUser(dto: LoginUserDto): Promise<User>;
  abstract setRolesToUser(userId: string, roleIds: number[]): Promise<User>;
  abstract getUsers(): Promise<User[]>;
  abstract findById(id: string): Promise<User | null>;
  abstract findUserByUsername(username: string): Promise<User | null>;
  abstract findRolesByIds(ids: number[]): Promise<Role[]>;
  abstract getUserRoles(userId: string): Promise<Role[]>;

  // Refresh token methods
  abstract saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
    deviceInfo?: Record<string, any>
  ): Promise<RefreshToken>;
  abstract findRefreshToken(token: string): Promise<RefreshToken | null>;
  abstract revokeRefreshToken(tokenId: number): Promise<void>;
  abstract revokeAllUserTokens(userId: string): Promise<void>;
  abstract deleteExpiredTokens(): Promise<void>;
  abstract getUserActiveTokens(userId: string): Promise<RefreshToken[]>;
}
