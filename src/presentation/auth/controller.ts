import {
  AuthRepository,
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  RegisterUser,
  LoginUser,
  CreateRoleDto,
  CreateRole,
} from "../../domain";
import { Request, Response } from "express";

export class AuthController {
  constructor(private readonly authRepository: AuthRepository) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal server error" });
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
      .catch((error) => this.handleError(error, res));
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
      .catch((error) => this.handleError(error, res));
  };

  login = (req: Request, res: Response) => {
    const [error, loginUserDto] = LoginUserDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }

    console.log(loginUserDto);

    new LoginUser(this.authRepository)
      .execute(loginUserDto!)
      .then((sessionData) => res.json(sessionData))
      .catch((error) => this.handleError(error, res));
  };

  getUsers = (req: Request, res: Response) => {
    this.authRepository
      .getUsers()
      .then((users) => res.json(users))
      .catch((error) => this.handleError(error, res));
  };

  findById = (req: Request, res: Response) => {
    const id = req.params.id;
    this.authRepository
      .findById(id)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };
}
