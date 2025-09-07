// export default interface CustomerRepository {
//   findById(id: number): Promise<Customer | null>;
//   findAll(): Promise<Customer[]>;
//   create(customer: Partial<Customer>): Promise<Customer>;
//   update(customer: Customer): Promise<Customer>;
//   delete(id: number): Promise<void>;
// }

import { RegisterCustomerDTO } from "../dtos/customer/register-customer.dto";
import { User } from "../entities/Users";

export abstract class CustomerDataSource {
  abstract register(registerCustomerDto: RegisterCustomerDTO): Promise<User>;
}
