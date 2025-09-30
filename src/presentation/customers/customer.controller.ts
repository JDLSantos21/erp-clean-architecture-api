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

export class CustomerController {
  constructor(private readonly customerRepository: CustomerRepository) {}

  private handleError = (error: unknown, res: Response, req: Request) => {
    console.error("Error Customer Controller:", error);

    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json(ResponseBuilder.error(error.statusCode, error.message, req));
    }

    return res
      .status(500)
      .json(ResponseBuilder.error(500, "Ocurrió un error inesperado", req));
  };

  createCustomer = async (req: Request, res: Response) => {
    const [error, dto] = RegisterCustomerDTO.create(req.body);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    new CreateCustomer(this.customerRepository)
      .execute(dto!)
      .then((customer) => {
        res.status(201).json(customer);
      })
      .catch((error) => this.handleError(error, res, req));
  };

  getAllCustomers = async (req: Request, res: Response) => {
    const [error, dto] = CustomerQueryDTO.create(req.query);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    const { page, limit, ...filters } = dto!;
    const skip = (page - 1) * limit;

    this.customerRepository
      .list({ filters, limit, skip })
      .then((response) => {
        const { customers, total } = response;
        res.json(
          ResponseBuilder.successWithPagination(
            customers,
            {
              page,
              limit,
              total,
            },
            req
          )
        );
      })
      .catch((error) => this.handleError(error, res, req));
  };

  getCustomerById = async (req: Request, res: Response) => {
    const customerId = req.params.id;

    if (!Validators.uuid.test(customerId)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "ID de cliente inválido", req));
      return;
    }

    this.customerRepository
      .findById(customerId)
      .then((customer) => {
        if (!customer) {
          res
            .status(404)
            .json(ResponseBuilder.error(404, "Cliente no encontrado", req));
          return;
        }
        res.json(ResponseBuilder.success(customer, req));
      })
      .catch((error) => this.handleError(error, res, req));
  };

  updateCustomer = async (req: Request, res: Response) => {
    const customerId = req.params.id;
    const [error, dto] = UpdateCustomerDTO.create(req.body, customerId);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    new UpdateCustomer(this.customerRepository)
      .execute(customerId, dto!)
      .then((response) => {
        res.json(ResponseBuilder.success(response, req));
      })
      .catch((error) => this.handleError(error, res, req));
  };

  deleteCustomer = async (req: Request, res: Response) => {
    const customerId = req.params.id;

    if (!Validators.uuid.test(customerId)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "ID de cliente inválido", req));
      return;
    }

    new DeleteCustomer(this.customerRepository)
      .execute(customerId)
      .then(() => {
        res.status(204).send();
      })
      .catch((error) => this.handleError(error, res, req));
  };

  // Direcciones
  createCustomerAddress = async (req: Request, res: Response) => {
    console.log(
      "DEBUG: createCustomerAddress called with:",
      req.method,
      req.url
    );

    const customerId = req.params.id;

    const [error, dto] = CreateCustomerAddressDTO.create(req.body, customerId);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    new CreateCustomerAddress(this.customerRepository)
      .execute(customerId, dto!)
      .then((address) => {
        res.json(ResponseBuilder.success(address, req));
      })
      .catch((error) => this.handleError(error, res, req));
  };

  getCustomerAddresses = async (req: Request, res: Response) => {
    const customerId = req.params.id;

    if (!Validators.uuid.test(customerId)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "ID de cliente inválido", req));
      return;
    }

    this.customerRepository
      .listAddresses(customerId)
      .then((addresses) => {
        res.json(ResponseBuilder.success(addresses, req));
      })
      .catch((error) => this.handleError(error, res, req));
  };

  updateCustomerAddress = async (req: Request, res: Response) => {
    const addressId = Number(req.params.addressId);

    const [error, dto] = UpdateCustomerAddressDTO.create(req.body, addressId);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    new UpdateCustomerAddress(this.customerRepository)
      .execute(addressId, dto!)
      .then((response) => {
        res.json(ResponseBuilder.success(response, req));
      })
      .catch((error) => this.handleError(error, res, req));
  };

  deleteCustomerAddress = async (req: Request, res: Response) => {
    const addressId = Number(req.params.addressId);
    if (!Validators.isPositiveInteger(addressId)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "ID de dirección inválido", req));
      return;
    }
  };

  // Telefonos

  createCustomerPhone = async (req: Request, res: Response) => {
    const customerId = req.params.id;

    const [error, dto] = CreateCustomerPhoneDTO.create(req.body, customerId);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    new CreateCustomerPhone(this.customerRepository)
      .execute(customerId, dto!)
      .then((phone) => {
        res.json(ResponseBuilder.success(phone, req));
      })
      .catch((error) => this.handleError(error, res, req));
  };

  getCustomerPhones = async (req: Request, res: Response) => {
    const customerId = req.params.id;
    if (!Validators.uuid.test(customerId)) {
      res
        .status(400)
        .json(ResponseBuilder.error(400, "ID de cliente inválido", req));
      return;
    }
    this.customerRepository
      .listPhones(customerId)
      .then((phones) => {
        res.json(ResponseBuilder.success(phones, req));
      })
      .catch((error) => this.handleError(error, res, req));
  };

  updateCustomerPhone = async (req: Request, res: Response) => {
    const phoneId = Number(req.params.phoneId);
    const [error, dto] = UpdateCustomerPhoneDto.create(req.body, phoneId);

    if (error) {
      res.status(400).json(ResponseBuilder.error(400, error, req));
      return;
    }

    new UpdateCustomerPhone(this.customerRepository)
      .execute(phoneId, dto!)
      .then((response) => {
        res.json(ResponseBuilder.success(response, req));
      })
      .catch((error) => this.handleError(error, res, req));
  };
}
