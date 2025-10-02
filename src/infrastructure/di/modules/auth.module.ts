//Auth Module - Dependency Injection Registration
import { JwtAdapter } from "../../../config/jwt";
import {
  RegisterUser,
  LoginUser,
  CreateRole,
  SetRolesToUser,
} from "../../../domain";
import { AuthController, AuthMiddleware } from "../../../presentation";
import { AuthDataSourceImpl } from "../../datasources";
import { AuthRepositoryImpl } from "../../repositories";
import { IDIContainer } from "../types";

//Registro de todas las dependencias del módulo Auth
export function registerAuthModule(container: IDIContainer): void {
  registerAuthDatasources(container);
  registerAuthRepositories(container);
  registerAuthUseCases(container);
  registerAuthControllers(container);
  registerAuthMiddlewares(container);
}

// Datasources
function registerAuthDatasources(container: IDIContainer): void {
  container.register(
    "AuthDatasource",
    () =>
      new AuthDataSourceImpl(
        container.resolve("PrismaClient"),
        container.resolve("HashFunction"),
        container.resolve("CompareFunction")
      )
  );
}
// Repositories
function registerAuthRepositories(container: IDIContainer): void {
  container.register(
    "AuthRepository",
    () => new AuthRepositoryImpl(container.resolve("AuthDatasource"))
  );
}

//Use Cases
function registerAuthUseCases(container: IDIContainer): void {
  // RegisterUser
  container.register(
    "RegisterUserUseCase",
    () =>
      new RegisterUser(
        container.resolve("AuthRepository"),
        JwtAdapter.generateToken
      )
  );

  // LoginUser
  container.register(
    "LoginUserUseCase",
    () =>
      new LoginUser(
        container.resolve("AuthRepository"),
        JwtAdapter.generateToken
      )
  );

  // CreateRole
  container.register(
    "CreateRoleUseCase",
    () => new CreateRole(container.resolve("AuthRepository"))
  );

  // SetRolesToUser
  container.register(
    "SetRolesToUserUseCase",
    () => new SetRolesToUser(container.resolve("AuthRepository"))
  );
}

//Controllers
function registerAuthControllers(container: IDIContainer): void {
  container.register(
    "AuthController",
    () =>
      new AuthController(
        container.resolve("RegisterUserUseCase"),
        container.resolve("LoginUserUseCase"),
        container.resolve("CreateRoleUseCase"),
        container.resolve("SetRolesToUserUseCase"),
        container.resolve("AuthRepository")
      )
  );
}

//Middlewares
function registerAuthMiddlewares(container: IDIContainer): void {
  container.register(
    "AuthMiddleware",
    () => new AuthMiddleware(container.resolve("AuthRepository"))
  );
}
