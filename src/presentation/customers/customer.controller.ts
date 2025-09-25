import { Request, Response } from "express";
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateCustomerPhoneDto,
  CreateCustomerAddressDto,
  CreateEquipmentAssignmentDto,
  CustomerFilters,
} from "../../domain/datasources/customer.datasource";
import { PhoneType } from "../../domain";

export class CustomerController {
  /**
   * Crear un nuevo cliente
   * POST /api/customers
   */
  public createCustomer = async (req: Request, res: Response) => {
    try {
      const createCustomerDto: CreateCustomerDto = req.body;

      // Validaciones básicas
      if (!createCustomerDto.name?.trim()) {
        return res.status(400).json({
          ok: false,
          message: "Customer name is required",
        });
      }

      if (createCustomerDto.isBusiness === undefined) {
        return res.status(400).json({
          ok: false,
          message: "isBusiness field is required",
        });
      }

      // TODO: Implementar el caso de uso aquí
      // const customer = await this.createCustomerUseCase.execute(createCustomerDto);

      return res.status(201).json({
        ok: true,
        message: "Customer created successfully",
        data: {
          // customer
          message:
            "Sistema de clientes implementado - usar caso de uso para crear cliente",
        },
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Obtener todos los clientes con filtros
   * GET /api/customers
   */
  public getAllCustomers = async (req: Request, res: Response) => {
    try {
      const filters: CustomerFilters = {
        name: req.query.name as string,
        email: req.query.email as string,
        rnc: req.query.rnc as string,
        isBusiness: req.query.isBusiness
          ? req.query.isBusiness === "true"
          : undefined,
        isActive: req.query.isActive
          ? req.query.isActive === "true"
          : undefined,
      };

      // TODO: Implementar el caso de uso aquí
      // const customers = await this.getAllCustomersUseCase.execute(filters);

      return res.status(200).json({
        ok: true,
        message: "Customers retrieved successfully",
        data: {
          filters,
          message:
            "Sistema de clientes implementado - usar caso de uso para obtener clientes",
        },
      });
    } catch (error) {
      console.error("Error getting customers:", error);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Obtener un cliente por ID con datos completos
   * GET /api/customers/:id
   */
  public getCustomerById = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;

      if (!customerId) {
        return res.status(400).json({
          ok: false,
          message: "Customer ID is required",
        });
      }

      // TODO: Implementar el caso de uso aquí
      // const customer = await this.getCustomerWithFullDataUseCase.execute(customerId);

      return res.status(200).json({
        ok: true,
        message: "Customer retrieved successfully",
        data: {
          customerId,
          message:
            "Sistema de clientes implementado - usar caso de uso para obtener cliente completo",
        },
      });
    } catch (error) {
      console.error("Error getting customer:", error);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Agregar teléfono a un cliente
   * POST /api/customers/:id/phones
   */
  public addCustomerPhone = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;
      const phoneData = req.body;

      if (!customerId) {
        return res.status(400).json({
          ok: false,
          message: "Customer ID is required",
        });
      }

      if (!phoneData.phoneNumber?.trim()) {
        return res.status(400).json({
          ok: false,
          message: "Phone number is required",
        });
      }

      const createPhoneDto: CreateCustomerPhoneDto = {
        customerId,
        phoneNumber: phoneData.phoneNumber,
        phoneType: phoneData.phoneType || PhoneType.MOVIL,
        hasWhatsapp: phoneData.hasWhatsapp || false,
        isPrimary: phoneData.isPrimary || false,
      };

      // TODO: Implementar el caso de uso aquí
      // const phone = await this.addCustomerPhoneUseCase.execute(createPhoneDto);

      return res.status(201).json({
        ok: true,
        message: "Customer phone added successfully",
        data: {
          createPhoneDto,
          message:
            "Sistema de clientes implementado - usar caso de uso para agregar teléfono",
        },
      });
    } catch (error) {
      console.error("Error adding customer phone:", error);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Agregar dirección a un cliente
   * POST /api/customers/:id/addresses
   */
  public addCustomerAddress = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;
      const addressData = req.body;

      if (!customerId) {
        return res.status(400).json({
          ok: false,
          message: "Customer ID is required",
        });
      }

      if (!addressData.street?.trim()) {
        return res.status(400).json({
          ok: false,
          message: "Street address is required",
        });
      }

      if (!addressData.city?.trim()) {
        return res.status(400).json({
          ok: false,
          message: "City is required",
        });
      }

      const createAddressDto: CreateCustomerAddressDto = {
        customerId,
        branchName: addressData.branchName?.trim(),
        street: addressData.street.trim(),
        city: addressData.city.trim(),
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        isPrimary: addressData.isPrimary || false,
      };

      // TODO: Implementar el caso de uso aquí
      // const address = await this.addCustomerAddressUseCase.execute(createAddressDto);

      return res.status(201).json({
        ok: true,
        message: "Customer address added successfully",
        data: {
          createAddressDto,
          message:
            "Sistema de clientes implementado - usar caso de uso para agregar dirección",
        },
      });
    } catch (error) {
      console.error("Error adding customer address:", error);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Asignar equipo al cliente
   * POST /api/customers/:id/assign-equipment
   */
  public assignEquipment = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;
      const { equipmentId, customerAddressId, notes } = req.body;

      if (!customerId) {
        return res.status(400).json({
          ok: false,
          message: "Customer ID is required",
        });
      }

      if (!equipmentId) {
        return res.status(400).json({
          ok: false,
          message: "Equipment ID is required",
        });
      }

      // TODO: Obtener el usuario actual de la autenticación
      const assignedBy = "current-user-id"; // Placeholder

      const assignmentDto: CreateEquipmentAssignmentDto = {
        equipmentId,
        customerId,
        customerAddressId,
        assignedBy,
        notes: notes?.trim(),
      };

      // TODO: Implementar el caso de uso aquí
      // const assignment = await this.assignEquipmentUseCase.execute(assignmentDto);

      return res.status(201).json({
        ok: true,
        message: "Equipment assigned successfully",
        data: {
          assignmentDto,
          message:
            "Sistema de clientes implementado - usar caso de uso para asignar equipo",
        },
      });
    } catch (error) {
      console.error("Error assigning equipment:", error);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Obtener equipos asignados a un cliente
   * GET /api/customers/:id/equipment
   */
  public getCustomerEquipment = async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;

      if (!customerId) {
        return res.status(400).json({
          ok: false,
          message: "Customer ID is required",
        });
      }

      // TODO: Implementar el caso de uso aquí
      // const assignments = await this.getCustomerAssignmentsUseCase.execute(customerId);

      return res.status(200).json({
        ok: true,
        message: "Customer equipment retrieved successfully",
        data: {
          customerId,
          message:
            "Sistema de clientes implementado - usar caso de uso para obtener equipos del cliente",
        },
      });
    } catch (error) {
      console.error("Error getting customer equipment:", error);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Devolver equipo del cliente
   * PUT /api/customers/:customerId/equipment/:assignmentId/return
   */
  public returnEquipment = async (req: Request, res: Response) => {
    try {
      const { customerId, assignmentId } = req.params;
      const { notes } = req.body;

      if (!customerId || !assignmentId) {
        return res.status(400).json({
          ok: false,
          message: "Customer ID and Assignment ID are required",
        });
      }

      const assignmentIdNum = parseInt(assignmentId);
      if (isNaN(assignmentIdNum)) {
        return res.status(400).json({
          ok: false,
          message: "Invalid assignment ID",
        });
      }

      // TODO: Obtener el usuario actual de la autenticación
      const unassignedBy = "current-user-id"; // Placeholder

      // TODO: Implementar el caso de uso aquí
      // const assignment = await this.returnEquipmentUseCase.execute(assignmentIdNum, unassignedBy, notes);

      return res.status(200).json({
        ok: true,
        message: "Equipment returned successfully",
        data: {
          customerId,
          assignmentId: assignmentIdNum,
          unassignedBy,
          notes,
          message:
            "Sistema de clientes implementado - usar caso de uso para devolver equipo",
        },
      });
    } catch (error) {
      console.error("Error returning equipment:", error);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Obtener resumen del cliente
   * GET /api/customers/summary
   */
  public getCustomersSummary = async (req: Request, res: Response) => {
    try {
      // TODO: Implementar el caso de uso aquí
      // const summary = await this.getCustomerSummaryUseCase.execute();

      return res.status(200).json({
        ok: true,
        message: "Customer summary retrieved successfully",
        data: {
          summary: {
            totalCustomers: 0,
            businessCustomers: 0,
            individualCustomers: 0,
            activeAssignments: 0,
            totalEquipmentAssigned: 0,
            pendingReports: 0,
          },
          message:
            "Sistema de clientes implementado - usar caso de uso para obtener resumen",
        },
      });
    } catch (error) {
      console.error("Error getting customer summary:", error);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
