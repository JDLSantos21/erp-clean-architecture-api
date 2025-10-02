//Customer Module - Dependency Injection Registration
import {
  CreateCustomer,
  CreateCustomerAddress,
  CreateCustomerPhone,
  DeleteCustomer,
  DeleteCustomerAddress,
  UpdateCustomer,
  UpdateCustomerAddress,
  UpdateCustomerPhone,
} from "../../../domain";
import { CustomerController } from "../../../presentation";
import { CustomerDatasourceImpl } from "../../datasources";
import { CustomerRepositoryImpl } from "../../repositories";
import { IDIContainer } from "../types";

//Registro de todas las dependencias del módulo Customer
export function registerCustomerModule(container: IDIContainer): void {
  registerCustomerDatasources(container);
  registerCustomerRepositories(container);
  registerCustomerUseCases(container);
  registerCustomerControllers(container);
}

//Datasources
function registerCustomerDatasources(container: IDIContainer): void {
  container.register(
    "CustomerDatasource",
    () => new CustomerDatasourceImpl(container.resolve("PrismaClient"))
  );
}

//Repositories
function registerCustomerRepositories(container: IDIContainer): void {
  container.register(
    "CustomerRepository",
    () => new CustomerRepositoryImpl(container.resolve("CustomerDatasource"))
  );
}

//Use Cases
function registerCustomerUseCases(container: IDIContainer): void {
  container.register(
    "CreateCustomerUseCase",
    () => new CreateCustomer(container.resolve("CustomerRepository"))
  );
  container.register(
    "UpdateCustomerUseCase",
    () => new UpdateCustomer(container.resolve("CustomerRepository"))
  );
  container.register(
    "DeleteCustomerUseCase",
    () => new DeleteCustomer(container.resolve("CustomerRepository"))
  );
  container.register(
    "CreateCustomerAddressUseCase",
    () => new CreateCustomerAddress(container.resolve("CustomerRepository"))
  );
  container.register(
    "UpdateCustomerAddressUseCase",
    () => new UpdateCustomerAddress(container.resolve("CustomerRepository"))
  );
  container.register(
    "DeleteCustomerAddressUseCase",
    () => new DeleteCustomerAddress(container.resolve("CustomerRepository"))
  );
  container.register(
    "CreateCustomerPhoneUseCase",
    () => new CreateCustomerPhone(container.resolve("CustomerRepository"))
  );
  container.register(
    "UpdateCustomerPhoneUseCase",
    () => new UpdateCustomerPhone(container.resolve("CustomerRepository"))
  );
}

//Controllers
function registerCustomerControllers(container: IDIContainer): void {
  container.register(
    "CustomerController",
    () =>
      new CustomerController(
        container.resolve("CreateCustomerUseCase"),
        container.resolve("UpdateCustomerUseCase"),
        container.resolve("DeleteCustomerUseCase"),
        container.resolve("CreateCustomerAddressUseCase"),
        container.resolve("UpdateCustomerAddressUseCase"),
        container.resolve("DeleteCustomerAddressUseCase"),
        container.resolve("CreateCustomerPhoneUseCase"),
        container.resolve("UpdateCustomerPhoneUseCase"),
        container.resolve("CustomerRepository")
      )
  );
}
