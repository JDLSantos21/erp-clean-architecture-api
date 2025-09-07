import { CreateRoleDto } from "../dtos/user/create-role.dto";
import { LoginUserDto } from "../dtos/user/login-user.dto";
import { RegisterUserDto } from "../dtos/user/register-user.dto";
import { Role, User } from "../entities/Users";

export abstract class AuthDataSource {
  abstract createRole(dto: CreateRoleDto): Promise<Role>;
  abstract registerUser(dto: RegisterUserDto): Promise<User>;
  abstract loginUser(dto: LoginUserDto): Promise<User>;
  abstract getUsers(): Promise<User[]>;
  abstract findById(id: string): Promise<User | null>;
  abstract findUserByUsername(username: string): Promise<User | null>;
  abstract findRolesByIds(ids: number[]): Promise<Role[]>;
}
