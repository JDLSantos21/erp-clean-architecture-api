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
import { BaseController } from "../shared/base.controller";

export class AuthController extends BaseController {
  constructor(
    private readonly registerUserUseCase: RegisterUser,
    private readonly loginUserUseCase: LoginUser,
    private readonly createRoleUseCase: CreateRole,
    private readonly setRolesToUserUseCase: SetRolesToUser,
    private readonly authRepository: AuthRepository
  ) {
    super();
  }

  createRole = async (req: Request, res: Response) => {
    try {
      const [error, createRoleDto] = CreateRoleDto.create(req.body.role_name);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const role = await this.createRoleUseCase.execute(createRoleDto!);
      this.handleCreated(res, role, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  registerUser = async (req: Request, res: Response) => {
    try {
      const [error, registerUserDto] = RegisterUserDto.create(req.body);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const userToken = await this.registerUserUseCase.execute(
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
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const sessionData = await this.loginUserUseCase.execute(loginUserDto!);
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
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const { roleIds, userId } = dto!;

      await this.setRolesToUserUseCase.execute(userId, roleIds);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
