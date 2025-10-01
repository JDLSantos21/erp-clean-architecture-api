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
  Logger,
  RegisterCustomerDTO,
  UpdateCustomer,
  UpdateCustomerAddress,
  UpdateCustomerAddressDTO,
  UpdateCustomerDTO,
  UpdateCustomerPhone,
  UpdateCustomerPhoneDto,
} from "../../domain";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";
import { Validators } from "../../config";
import { BaseController } from "../shared/base.controller";

export class CustomerController extends BaseController {
  constructor(private readonly customerRepository: CustomerRepository) {
    super();
  }

  createCustomer = async (req: Request, res: Response) => {
    try {
      const [error, dto] = RegisterCustomerDTO.create(req.body);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const customer = await new CreateCustomer(
        this.customerRepository
      ).execute(dto!);
      this.handleCreated(res, customer, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getAllCustomers = async (req: Request, res: Response) => {
    try {
      const [error, dto] = CustomerQueryDTO.create(req.query);

      if (error) {
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const { page, limit, ...filters } = dto!;
      const skip = (page - 1) * limit;

      const response = await this.customerRepository.list({
        filters,
        limit,
        skip,
      });
      const { customers, total } = response;

      this.handleSuccessWithPagination(
        res,
        customers,
        { page, limit, total },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getCustomerById = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;

      if (!Validators.uuid.test(customerId)) {
        return this.handleError(
          CustomError.badRequest("ID de cliente inválido"),
          res,
          req
        );
      }

      const customer = await this.customerRepository.findById(customerId);

      if (!customer) {
        return this.handleError(
          CustomError.notFound("Cliente no encontrado"),
          res,
          req
        );
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
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const response = await new UpdateCustomer(
        this.customerRepository
      ).execute(customerId, dto!);
      this.handleSuccess(res, response, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteCustomer = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;

      if (!Validators.uuid.test(customerId)) {
        return this.handleError(
          CustomError.badRequest("ID de cliente inválido"),
          res,
          req
        );
      }

      await new DeleteCustomer(this.customerRepository).execute(customerId);
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
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const address = await new CreateCustomerAddress(
        this.customerRepository
      ).execute(customerId, dto!);
      this.handleSuccess(res, address, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getCustomerAddresses = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;

      if (!Validators.uuid.test(customerId)) {
        return this.handleError(
          CustomError.badRequest("ID de cliente inválido"),
          res,
          req
        );
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
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const response = await new UpdateCustomerAddress(
        this.customerRepository
      ).execute(addressId, dto!);
      this.handleSuccess(res, response, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  deleteCustomerAddress = async (req: Request, res: Response) => {
    try {
      const addressId = Number(req.params.addressId);

      if (!Validators.isPositiveInteger(addressId)) {
        return this.handleError(
          CustomError.badRequest("ID de dirección inválido"),
          res,
          req
        );
      }

      // Implementar el caso de uso para eliminar dirección
      // await new DeleteCustomerAddress(this.customerRepository).execute(addressId);
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
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const phone = await new CreateCustomerPhone(
        this.customerRepository
      ).execute(customerId, dto!);
      this.handleSuccess(res, phone, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getCustomerPhones = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;

      if (!Validators.uuid.test(customerId)) {
        return this.handleError(
          CustomError.badRequest("ID de cliente inválido"),
          res,
          req
        );
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
        return this.handleError(CustomError.badRequest(error), res, req);
      }

      const response = await new UpdateCustomerPhone(
        this.customerRepository
      ).execute(phoneId, dto!);
      this.handleSuccess(res, response, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
