import { RegisterUserDto, LoginUserDto, CreateRoleDto } from "../dtos";
import { Role, User } from "../entities";

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
}
