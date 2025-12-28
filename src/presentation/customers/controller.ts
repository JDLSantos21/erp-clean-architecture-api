import { Request, Response } from "express";
import {
  CreateCustomer,
  CreateCustomerAddress,
  CreateCustomerAddressDTO,
  CreateCustomerPhone,
  CreateCustomerPhoneDTO,
  CustomerQueryDTO,
  CustomerRepository,
  CustomError,
  DeleteCustomer,
  DeleteCustomerAddress,
  RegisterCustomerDTO,
  UpdateCustomer,
  UpdateCustomerAddress,
  UpdateCustomerAddressDTO,
  UpdateCustomerDTO,
  UpdateCustomerPhone,
  UpdateCustomerPhoneDto,
} from "../../domain";
import { Validators } from "../../config";
import { BaseController } from "../shared/base.controller";
import { OrderResponseDto } from "../dtos";

export class CustomerController extends BaseController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomer,
    private readonly updateCustomerUseCase: UpdateCustomer,
    private readonly deleteCustomerUseCase: DeleteCustomer,
    private readonly createCustomerAddressUseCase: CreateCustomerAddress,
    private readonly updateCustomerAddressUseCase: UpdateCustomerAddress,
    private readonly deleteCustomerAddressUseCase: DeleteCustomerAddress,
    private readonly createCustomerPhoneUseCase: CreateCustomerPhone,
    private readonly updateCustomerPhoneUseCase: UpdateCustomerPhone,
    private readonly customerRepository: CustomerRepository
  ) {
    super();
  }

  createCustomer = async (req: Request, res: Response) => {
    try {
      const [error, dto] = RegisterCustomerDTO.create(req.body);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const customer = await this.createCustomerUseCase.execute(dto!);
      this.handleCreated(res, customer, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getAllCustomers = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CustomerQueryDTO.create(req.query);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const filterParams = { filters, limit, skip };

      const { customers, total } = await this.customerRepository.list(
        filterParams
      );

      const pagination = { page, limit, total };
      this.handleSuccessWithPagination(res, customers, pagination, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getCustomerById = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;
      const relations = { orders: true };

      if (!Validators.uuid.test(customerId)) {
        const customError = CustomError.badRequest("ID de cliente inválido");
        return this.handleError(customError, res, req);
      }

      const customer = await this.customerRepository.findById(
        customerId,
        relations
      );

      if (!customer) {
        const customError = CustomError.notFound("Cliente no encontrado");
        return this.handleError(customError, res, req);
      }

      const { orders } = customer;

      if (orders) {
        this.handleSuccess(
          res,
          { ...customer, orders: OrderResponseDto.fromEntities(orders) },
          req
        );
        return;
      }

      this.handleSuccess(res, customer, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateCustomer = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;
      const [error, dto] = UpdateCustomerDTO.create(req.body, customerId);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const customer = await this.updateCustomerUseCase.execute(
        customerId,
        dto!
      );
      this.handleSuccess(res, customer, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteCustomer = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;

      if (!Validators.uuid.test(customerId)) {
        const customError = CustomError.badRequest("ID de cliente inválido");
        return this.handleError(customError, res, req);
      }

      await this.deleteCustomerUseCase.execute(customerId);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Direcciones
  createCustomerAddress = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;
      const [error, dto] = CreateCustomerAddressDTO.create(
        req.body,
        customerId
      );

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const address = await this.createCustomerAddressUseCase.execute(
        customerId,
        dto!
      );
      this.handleSuccess(res, address, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getCustomerAddresses = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;

      if (!Validators.uuid.test(customerId)) {
        const customError = CustomError.badRequest("ID de cliente inválido");
        return this.handleError(customError, res, req);
      }

      const addresses = await this.customerRepository.listAddresses(customerId);
      this.handleSuccess(res, addresses, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateCustomerAddress = async (req: Request, res: Response) => {
    try {
      const addressId = Number(req.params.addressId);
      const [error, dto] = UpdateCustomerAddressDTO.create(req.body, addressId);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const response = await this.updateCustomerAddressUseCase.execute(
        addressId,
        dto!
      );
      this.handleSuccess(res, response, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteCustomerAddress = async (req: Request, res: Response) => {
    //todo
    try {
      const addressId = Number(req.params.addressId);

      if (!Validators.isPositiveInteger(addressId)) {
        const customError = CustomError.badRequest("ID de dirección inválido");
        return this.handleError(customError, res, req);
      }

      await this.deleteCustomerAddressUseCase.execute(addressId);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  // Telefonos

  createCustomerPhone = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;
      const [error, dto] = CreateCustomerPhoneDTO.create(req.body, customerId);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const phone = await this.createCustomerPhoneUseCase.execute(
        customerId,
        dto!
      );
      this.handleSuccess(res, phone, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getCustomerPhones = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;

      if (!Validators.uuid.test(customerId)) {
        const customError = CustomError.badRequest("ID de cliente inválido");
        return this.handleError(customError, res, req);
      }

      const phones = await this.customerRepository.listPhones(customerId);
      this.handleSuccess(res, phones, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateCustomerPhone = async (req: Request, res: Response) => {
    try {
      const phoneId = Number(req.params.phoneId);
      const [error, dto] = UpdateCustomerPhoneDto.create(req.body, phoneId);

      if (error) {
        const customError = CustomError.badRequest(error);
        return this.handleError(customError, res, req);
      }

      const response = await this.updateCustomerPhoneUseCase.execute(
        phoneId,
        dto!
      );
      this.handleSuccess(res, response, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
