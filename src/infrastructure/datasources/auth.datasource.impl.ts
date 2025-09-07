import {
  AuthDataSource,
  CreateRoleDto,
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  Role,
  User,
} from "../../domain";

import { prisma } from "../../data/postgresql";
import { BcryptAdapter } from "../../config";
import { UserMapper } from "../mappers/user.mapper";

type HashFunction = (password: string) => string;
type CompareFunction = (password: string, hashed: string) => boolean;

export class AuthDataSourceImpl extends AuthDataSource {
  constructor(
    private readonly hash: HashFunction = BcryptAdapter.hash,
    private readonly compare: CompareFunction = BcryptAdapter.compare
  ) {
    super();
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const exist = await prisma.role.findUnique({
        where: { name: createRoleDto.role },
      });

      if (exist) throw CustomError.badRequest("Role already exists");

      const newRole = await prisma.role.create({
        data: { name: createRoleDto.role },
      });
      return new Role(newRole);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    const { username, password, lastName, name, roles } = registerUserDto;

    try {
      const hashedPassword = this.hash(password);

      const newUser = await prisma.user.create({
        data: {
          name,
          lastName,
          username,
          password: hashedPassword,
        },
      });

      await prisma.userRole.createMany({
        // Assign roles to the new user
        data: roles.map((roleId) => ({
          userId: newUser.id,
          roleId,
        })),
        skipDuplicates: true,
      });

      const userWithRoles = await prisma.user.findUnique({
        where: { id: newUser.id },
        include: { roles: { select: { role: { select: { name: true } } } } },
      });

      return UserMapper.userEntityFromObject(userWithRoles!);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<User> {
    const { username, password } = loginUserDto;

    //To-do: fix bug with dto and User entity in the mapper

    console.log("Dto: ", loginUserDto);

    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          roles: {
            select: { role: { select: { name: true } } },
          },
        },
      });

      if (!user) throw CustomError.notFound("Usuario no encontrado");

      console.log("User found: ", user); //log for debugging

      const isMatch = this.compare(password, user.password);
      if (!isMatch) throw CustomError.unauthorized("Credenciales inválidas");

      const mapper = UserMapper.userEntityFromObject(user);
      console.log("Mapped user from Datasource: ", mapper); //log for debugging
      return mapper;
    } catch (error) {
      console.log("Ocurrio el error en login", error); // log for debugging
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const dbUsers = await prisma.user.findMany({
        include: { roles: { select: { role: { select: { name: true } } } } },
      });

      return dbUsers.map((user) =>
        UserMapper.userEntityFromObject({ ...user })
      );
    } catch (error) {
      throw CustomError.internalServer();
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { roles: { select: { role: { select: { name: true } } } } },
      });
      if (!user) return null;

      return UserMapper.userEntityFromObject(user);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async findUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include: { roles: { select: { role: { select: { name: true } } } } },
      });

      if (!user) return null;

      return UserMapper.userEntityFromObject(user);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async findRolesByIds(ids: number[]): Promise<Role[]> {
    try {
      const roles = await prisma.role.findMany({
        where: { id: { in: ids } },
      });
      return roles.map((role) => new Role(role));
    } catch (error) {
      throw CustomError.internalServer();
    }
  }
}
