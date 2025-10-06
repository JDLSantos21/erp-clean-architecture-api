import { buildWhere } from "../prisma-where.mapper";

describe("buildWhere", () => {
  describe("Filtros básicos", () => {
    it("debe construir where con filtros simples", () => {
      const filters = {
        name: "John",
        age: 25,
        isActive: true,
      };

      const where = buildWhere(filters, [], "createdAt");

      expect(where).toEqual({
        name: { contains: "John", mode: "insensitive" },
        age: { equals: 25 },
        isActive: { equals: true },
      });
    });

    it("debe ignorar valores undefined, null y vacíos", () => {
      const filters = {
        name: "John",
        email: undefined,
        phone: null,
        address: "",
      };

      const where = buildWhere(filters, [], "createdAt");

      expect(where).toEqual({
        name: { contains: "John", mode: "insensitive" },
      });
    });

    it("debe manejar arrays con operador IN", () => {
      const filters = {
        status: ["ACTIVE", "PENDING"],
      };

      const where = buildWhere(filters, [], "createdAt");

      expect(where).toEqual({
        status: { in: ["ACTIVE", "PENDING"] },
      });
    });
  });

  describe("Búsqueda con searchTerm", () => {
    it("debe crear OR condition con campos simples", () => {
      const filters = {
        search: "test",
      };

      const searchFields = ["name", "email", "phone"];

      const where = buildWhere(filters, searchFields, "createdAt");

      expect(where).toEqual({
        OR: [
          { name: { contains: "test", mode: "insensitive" } },
          { email: { contains: "test", mode: "insensitive" } },
          { phone: { contains: "test", mode: "insensitive" } },
        ],
      });
    });

    it("debe manejar campos anidados con notación de punto", () => {
      const filters = {
        search: "Acme",
      };

      const searchFields = [
        "trackingCode",
        "customer.businessName",
        "customer.representativeName",
      ];

      const where = buildWhere(filters, searchFields, "orderDate");

      expect(where).toEqual({
        OR: [
          { trackingCode: { contains: "Acme", mode: "insensitive" } },
          {
            customer: {
              businessName: { contains: "Acme", mode: "insensitive" },
            },
          },
          {
            customer: {
              representativeName: { contains: "Acme", mode: "insensitive" },
            },
          },
        ],
      });
    });

    it("debe manejar múltiples niveles de anidamiento", () => {
      const filters = {
        search: "test",
      };

      const searchFields = ["user.profile.name", "user.email"];

      const where = buildWhere(filters, searchFields, "createdAt");

      expect(where).toEqual({
        OR: [
          {
            user: {
              profile: {
                name: { contains: "test", mode: "insensitive" },
              },
            },
          },
          {
            user: {
              email: { contains: "test", mode: "insensitive" },
            },
          },
        ],
      });
    });

    it("no debe crear OR si no hay searchTerm", () => {
      const filters = {
        name: "John",
      };

      const searchFields = ["name", "email"];

      const where = buildWhere(filters, searchFields, "createdAt");

      expect(where).toEqual({
        name: { contains: "John", mode: "insensitive" },
      });
      expect(where.OR).toBeUndefined();
    });
  });

  describe("Filtros de fecha", () => {
    it("debe construir date range con startDate y endDate", () => {
      const filters = {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      };

      const where = buildWhere(filters, [], "createdAt");

      expect(where.createdAt).toBeDefined();
      expect(where.createdAt.gte).toBeInstanceOf(Date);
      expect(where.createdAt.lt).toBeInstanceOf(Date);
    });

    it("debe usar campo de fecha personalizado", () => {
      const filters = {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      };

      const where = buildWhere(filters, [], "orderDate");

      expect(where.orderDate).toBeDefined();
      expect(where.createdAt).toBeUndefined();
    });

    it("debe manejar solo startDate", () => {
      const filters = {
        startDate: "2025-01-01",
      };

      const where = buildWhere(filters, [], "createdAt");

      expect(where.createdAt).toBeDefined();
      expect(where.createdAt.gte).toBeInstanceOf(Date);
      expect(where.createdAt.lt).toBeUndefined();
    });

    it("debe manejar solo endDate", () => {
      const filters = {
        endDate: "2025-12-31",
      };

      const where = buildWhere(filters, [], "createdAt");

      expect(where.createdAt).toBeDefined();
      expect(where.createdAt.lt).toBeInstanceOf(Date);
      expect(where.createdAt.gte).toBeUndefined();
    });
  });

  describe("Casos combinados", () => {
    it("debe combinar filtros simples + searchTerm + date range", () => {
      const filters = {
        search: "test",
        isActive: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      };

      const searchFields = ["name", "customer.businessName"];

      const where = buildWhere(filters, searchFields, "createdAt");

      expect(where.isActive).toEqual({ equals: true });
      expect(where.OR).toHaveLength(2);
      expect(where.createdAt).toBeDefined();
    });

    it("debe manejar filtros complejos para órdenes", () => {
      const filters = {
        search: "Acme",
        isActive: true,
        customerId: "customer-123",
        startDate: "2025-10-01",
        endDate: "2025-10-31",
      };

      const searchFields = [
        "trackingCode",
        "customer.businessName",
        "customer.representativeName",
      ];

      const where = buildWhere(filters, searchFields, "orderDate");

      expect(where).toHaveProperty("isActive");
      expect(where).toHaveProperty("customerId");
      expect(where).toHaveProperty("OR");
      expect(where).toHaveProperty("orderDate");
      expect(where.OR).toHaveLength(3);
    });
  });

  describe("Casos extremos", () => {
    it("debe manejar filtros vacíos", () => {
      const filters = {};

      const where = buildWhere(filters, [], "createdAt");

      expect(where).toEqual({});
    });

    it("debe manejar searchFields vacío", () => {
      const filters = {
        search: "test",
      };

      const where = buildWhere(filters, [], "createdAt");

      expect(where.OR).toBeUndefined();
    });

    it("debe manejar search vacío", () => {
      const filters = {
        search: "",
      };

      const searchFields = ["name", "email"];

      const where = buildWhere(filters, searchFields, "createdAt");

      expect(where.OR).toBeUndefined();
    });
  });
});
