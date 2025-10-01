import {
  AuthDataSource,
  CreateRoleDto,
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  Role,
  User,
} from "../../domain";

import { BcryptAdapter } from "../../config";
import { UserMapper } from "../mappers/user.mapper";
import { PrismaClient } from "@prisma/client";

type HashFunction = (password: string) => string;
type CompareFunction = (password: string, hashed: string) => boolean;

export class AuthDataSourceImpl extends AuthDataSource {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly hash: HashFunction = BcryptAdapter.hash,
    private readonly compare: CompareFunction = BcryptAdapter.compare
  ) {
    super();
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const exist = await this.prisma.role.findUnique({
        where: { name: createRoleDto.role },
      });

      if (exist) throw CustomError.badRequest("Este rol ya existe");

      const newRole = await this.prisma.role.create({
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

      const newUser = await this.prisma.user.create({
        data: {
          name,
          lastName,
          username,
          password: hashedPassword,
        },
      });

      await this.prisma.userRole.createMany({
        // Assign roles to the new user
        data: roles.map((roleId) => ({
          userId: newUser.id,
          roleId,
        })),
        skipDuplicates: true,
      });

      const userWithRoles = await this.prisma.user.findUnique({
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

  async setRolesToUser(userId: string, roleIds: number[]): Promise<User> {
    try {
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId, roleId })),
        skipDuplicates: true,
      });

      const userWithRoles = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { select: { role: { select: { name: true } } } } },
      });

      if (!userWithRoles) throw CustomError.notFound("Usuario no encontrado");

      return UserMapper.userEntityFromObject(userWithRoles);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<User> {
    const { username, password } = loginUserDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
        include: {
          roles: {
            select: { role: { select: { name: true } } },
          },
        },
      });

      if (!user) throw CustomError.notFound("Usuario no encontrado");

      const isMatch = this.compare(password, user.password);
      if (!isMatch) throw CustomError.unauthorized("Credenciales inválidas");

      return UserMapper.userEntityFromObject(user);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const dbUsers = await this.prisma.user.findMany({
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
      const user = await this.prisma.user.findUnique({
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
      const user = await this.prisma.user.findUnique({
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
      const roles = await this.prisma.role.findMany({
        where: { id: { in: ids } },
      });
      return roles.map((role) => new Role(role));
    } catch (error) {
      throw CustomError.internalServer();
    }
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId },
        include: { role: true },
      });

      return userRoles.map((UserRole) => new Role(UserRole.role));
    } catch (error) {
      throw CustomError.internalServer();
    }
  }
}
