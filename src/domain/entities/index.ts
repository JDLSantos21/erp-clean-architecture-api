// Customer Management System
export * from "./customer/Customer";
export * from "./customer/CustomerAddress";
export * from "./customer/CustomerPhone";

// Equipment Management System
export * from "./equipment/Equipment";
export * from "./equipment/EquipmentModel";
export * from "./equipment/EquipmentLocation";
export * from "./equipment/EquipmentAssigment";
export * from "./equipment/EquipmetRequest";
export * from "./equipment/EquipmentReport";

// Vehicle Management System
export * from "./vehicle/Vehicle";
export * from "./vehicle/VehicleTagHistory";
export * from "./vehicle/VehicleAnalytics";
// Maintenances
export * from "./vehicle/maintenance/MaintenanceProcedure";
export * from "./vehicle/maintenance/VehicleMaintenance";
export * from "./vehicle/maintenance/MaintenanceAlert";
export * from "./vehicle/maintenance/MaintenanceSchedule";

//Employee Management System
export * from "./Employee";

// Fuel Management System
export * from "./fuel/Fuel";
export * from "./fuel/FuelAnalytics";

// Inventory Management System
export * from "./Inventory";

export * from "./Users";

// Base Entity
export { default as Entity } from "./entity";
