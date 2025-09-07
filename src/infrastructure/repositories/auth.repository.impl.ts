import {
  AuthDataSource,
  AuthRepository,
  CreateRoleDto,
  LoginUserDto,
  RegisterUserDto,
  Role,
  User,
} from "../../domain";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authDatasource: AuthDataSource) {}

  createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.authDatasource.createRole(createRoleDto);
  }

  register(registerUserDto: RegisterUserDto): Promise<User> {
    return this.authDatasource.registerUser(registerUserDto);
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
}
