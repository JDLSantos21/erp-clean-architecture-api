import {
  AuthDataSource,
  AuthRepository,
  CreateRoleDto,
  LoginUserDto,
  RegisterUserDto,
  Role,
  User,
  RefreshToken,
} from "../../domain";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authDatasource: AuthDataSource) {}

  createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.authDatasource.createRole(createRoleDto);
  }

  register(registerUserDto: RegisterUserDto): Promise<User> {
    return this.authDatasource.registerUser(registerUserDto);
  }

  setRolesToUser(userId: string, roleIds: number[]): Promise<User> {
    return this.authDatasource.setRolesToUser(userId, roleIds);
  }

  login(loginUserDto: LoginUserDto): Promise<User> {
    return this.authDatasource.loginUser(loginUserDto);
  }

  getUsers(): Promise<User[]> {
    return this.authDatasource.getUsers();
  }

  findById(id: string): Promise<User | null> {
    return this.authDatasource.findById(id);
  }

  findUserByUsername(username: string): Promise<User | null> {
    return this.authDatasource.findUserByUsername(username);
  }

  findRolesByIds(ids: number[]): Promise<Role[]> {
    return this.authDatasource.findRolesByIds(ids);
  }

  getUserRoles(userId: string): Promise<Role[]> {
    return this.authDatasource.getUserRoles(userId);
  }

  saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
    deviceInfo?: Record<string, any>
  ): Promise<RefreshToken> {
    return this.authDatasource.saveRefreshToken(
      userId,
      token,
      expiresAt,
      deviceInfo
    );
  }

  findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.authDatasource.findRefreshToken(token);
  }

  revokeRefreshToken(tokenId: number): Promise<void> {
    return this.authDatasource.revokeRefreshToken(tokenId);
  }

  revokeAllUserTokens(userId: string): Promise<void> {
    return this.authDatasource.revokeAllUserTokens(userId);
  }

  deleteExpiredTokens(): Promise<void> {
    return this.authDatasource.deleteExpiredTokens();
  }

  getUserActiveTokens(userId: string): Promise<RefreshToken[]> {
    return this.authDatasource.getUserActiveTokens(userId);
  }
}
