import { CreateRoleDto } from "../dtos/user/create-role.dto";
import { LoginUserDto } from "../dtos/user/login-user.dto";
import { RegisterUserDto } from "../dtos/user/register-user.dto";
import { Role, User } from "../entities/Users";

export abstract class AuthRepository {
  abstract register(registerUserDto: RegisterUserDto): Promise<User>;
  abstract login(loginUserDto: LoginUserDto): Promise<User>;
  abstract setRolesToUser(userId: string, roleIds: number[]): Promise<User>;
  abstract createRole(createRoleDto: CreateRoleDto): Promise<Role>;
  abstract getUsers(): Promise<User[]>;
  abstract findById(id: string): Promise<User | null>;
  abstract findUserByUsername(username: string): Promise<User | null>;
  abstract findRolesByIds(ids: number[]): Promise<Role[]>;
  abstract getUserRoles(userId: string): Promise<Role[]>;
}
