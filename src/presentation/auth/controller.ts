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
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";
import { StatusCode } from "../../domain/constants";

export class AuthController {
  constructor(private readonly authRepository: AuthRepository) {}

  private handleError = (error: unknown, res: Response, req: Request) => {
    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json(ResponseBuilder.error(error.statusCode, error.message, req));
    }

    return res
      .status(500)
      .json(ResponseBuilder.error(500, "Error interno del servidor"));
  };

  createRole = (req: Request, res: Response) => {
    const [error, createRoleDto] = CreateRoleDto.create(req.body.role_name);

    if (error) {
      res.status(400).json({ error });
      return;
    }

    new CreateRole(this.authRepository)
      .execute(createRoleDto!)
      .then((role) => res.json(role))
      .catch((error) => this.handleError(error, res, req));
  };

  registerUser = (req: Request, res: Response) => {
    const [error, registerUserDto] = RegisterUserDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }

    new RegisterUser(this.authRepository)
      .execute(registerUserDto!)
      .then((userToken) => res.json(userToken))
      .catch((error) => this.handleError(error, res, req));
  };

  login = (req: Request, res: Response) => {
    const [error, loginUserDto] = LoginUserDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }

    new LoginUser(this.authRepository)
      .execute(loginUserDto!)
      .then((sessionData) => res.json(sessionData))
      .catch((error) => this.handleError(error, res, req));
  };

  getUsers = (req: Request, res: Response) => {
    this.authRepository
      .getUsers()
      .then((users) => res.json(users))
      .catch((error) => this.handleError(error, res, req));
  };

  findById = (req: Request, res: Response) => {
    const id = req.params.id;
    this.authRepository
      .findById(id)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res, req));
  };

  setRolesToUser = (req: Request, res: Response) => {
    const paramUserId = req.params.id;
    const roles: number[] = req.body.roles;

    const [error, dto] = SetRolesToUserDto.create(roles, paramUserId);

    if (error) {
      res
        .status(400)
        .json(ResponseBuilder.error(StatusCode.BAD_REQUEST, error, req));
      return;
    }

    const { roleIds, userId } = dto!;

    new SetRolesToUser(this.authRepository)
      .execute(userId, roleIds)
      .then(() => res.status(204).send())
      .catch((error) => this.handleError(error, res, req));
  };
}
