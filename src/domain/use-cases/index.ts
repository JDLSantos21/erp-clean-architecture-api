//auth
export * from "./auth/login-user.use-case";
export * from "./auth/register-user.use-case";
export * from "./auth/create-role.use-case";
export * from "./auth/set-roles-to-user.use-case";

//vehicles
export * from "./vehicle/create-vehicle.use-case";
export * from "./vehicle/update-vehicle.use-case";
export * from "./vehicle/maintenance/create-maintenance-procedure.use-case"; //maintenances
export * from "./vehicle/maintenance/generate-maintenance-alerts.use-case";
export * from "./vehicle/maintenance/process-maintenance-completion.use-case";

//employees
export * from "./employee/create-employee.use-case";
export * from "./employee/update-employee.use-case";

//inventory
export * from "./inventory/create-material.use-case";
export * from "./inventory/update-material.use-case";
export * from "./inventory/create-stock-move.use-case";
export * from "./inventory/delete-material.use-case";
export * from "./inventory/delete-unit.use-case";
export * from "./inventory/delete-category.use-case";

//fuel
export * from "./fuel/create-fuel-consumption.use-case";
export * from "./fuel/update-fuel-consumption.use-case";
export * from "./fuel/create-fuel-tank-refill.use-case";
export * from "./fuel/delete-fuel-consumption.use-case";
export * from "./fuel/get-dashboard-metrics.use-case";
export * from "./fuel/get-dashboard-summary.use-case";
export * from "./fuel/get-vehicle-metrics.use-case";
export * from "./fuel/create-update-fuel-tank.use-case";

//customers
export * from "./customer/create-customer.use-case";
export * from "./customer/create-customer-address.use-case";
export * from "./customer/create-customer-phone.use-case";
export * from "./customer/delete-customer.use-case";
export * from "./customer/update-customer-phone.use-case";
export * from "./customer/update-customer.use-case";
export * from "./customer/update-customer-address.use-case";
