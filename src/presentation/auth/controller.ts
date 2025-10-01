import {
  AuthRepository,
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  RegisterUser,
  LoginUser,
  CreateRoleDto,
  CreateRole,
  SetRolesToUser,
  SetRolesToUserDto,
} from "../../domain";
import { Request, Response } from "express";
import { StatusCode } from "../../domain/constants";
import { BaseController } from "../shared/base.controller";

export class AuthController extends BaseController {
  constructor(private readonly authRepository: AuthRepository) {
    super();
  }

  createRole = async (req: Request, res: Response) => {
    try {
      const [error, createRoleDto] = CreateRoleDto.create(req.body.role_name);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const role = await new CreateRole(this.authRepository).execute(
        createRoleDto!
      );
      this.handleCreated(res, role, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  registerUser = async (req: Request, res: Response) => {
    try {
      const [error, registerUserDto] = RegisterUserDto.create(req.body);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const userToken = await new RegisterUser(this.authRepository).execute(
        registerUserDto!
      );
      this.handleCreated(res, userToken, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const [error, loginUserDto] = LoginUserDto.create(req.body);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const sessionData = await new LoginUser(this.authRepository).execute(
        loginUserDto!
      );
      this.handleSuccess(res, sessionData, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.authRepository.getUsers();
      this.handleSuccess(res, users, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const user = await this.authRepository.findById(id);
      this.handleSuccess(res, user, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  setRolesToUser = async (req: Request, res: Response) => {
    try {
      const paramUserId = req.params.id;
      const roles: number[] = req.body.roles;

      const [error, dto] = SetRolesToUserDto.create(roles, paramUserId);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const { roleIds, userId } = dto!;

      await new SetRolesToUser(this.authRepository).execute(userId, roleIds);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
