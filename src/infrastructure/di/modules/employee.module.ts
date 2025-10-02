//Employee Module - Dependency Injection Registration

import { CreateEmployee, UpdateEmployeeUseCase } from "../../../domain";
import { EmployeeController } from "../../../presentation";
import { EmployeeDatasourceImpl } from "../../datasources";
import { EmployeeRepositoryImpl } from "../../repositories";
import { IDIContainer } from "../types";

// Registro de todas las dependencias del módulo Employee
export function registerEmployeeModule(container: IDIContainer): void {
  registerEmployeeDatasources(container);
  registerEmployeeRepositories(container);
  registerEmployeeUseCases(container);
  registerEmployeeControllers(container);
}

//Datasources
function registerEmployeeDatasources(container: IDIContainer): void {
  container.register(
    "EmployeeDatasource",
    () => new EmployeeDatasourceImpl(container.resolve("PrismaClient"))
  );
}

//Repositories
function registerEmployeeRepositories(container: IDIContainer): void {
  container.register(
    "EmployeeRepository",
    () => new EmployeeRepositoryImpl(container.resolve("EmployeeDatasource"))
  );
}

//Use Cases
function registerEmployeeUseCases(container: IDIContainer): void {
  container.register(
    "CreateEmployeeUseCase",
    () => new CreateEmployee(container.resolve("EmployeeRepository"))
  );

  container.register(
    "UpdateEmployeeUseCase",
    () => new UpdateEmployeeUseCase(container.resolve("EmployeeRepository"))
  );
}

//Controllers
function registerEmployeeControllers(container: IDIContainer): void {
  container.register(
    "EmployeeController",
    () =>
      new EmployeeController(
        container.resolve("CreateEmployeeUseCase"),
        container.resolve("UpdateEmployeeUseCase"),
        container.resolve("EmployeeRepository")
      )
  );
}
