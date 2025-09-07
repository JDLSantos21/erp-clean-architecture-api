import { RegisterCustomerDTO } from "../dtos/customer/register-customer.dto";
import { User } from "../entities/Users";

export abstract class CustomerDataSource {
  abstract register(registerCustomerDto: RegisterCustomerDTO): Promise<User>;
}
