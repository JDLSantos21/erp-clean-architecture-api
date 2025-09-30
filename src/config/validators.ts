export class Validators {
  static get email() {
    return /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
  }

  static get phoneNumber() {
    return /^(1?(809|829|849)\d{7})$/i;
  }

  static get cedula() {
    return /^\d{3}-?\d{7}-?\d{1}$/;
  }

  //validate uuid
  static get uuid() {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  }

  static get employeeCode() {
    return /^\d{1,4}$/;
  }

  static get rnc() {
    return /^\d{9}$/;
  }

  static validateAndFormatExpirationDate(
    licenseExpirationDate: any
  ): [string?, Date?] {
    if (licenseExpirationDate === undefined) {
      return [undefined, undefined];
    }

    const dateToValidate =
      licenseExpirationDate instanceof Date
        ? licenseExpirationDate
        : new Date(licenseExpirationDate);

    if (isNaN(dateToValidate.getTime())) {
      return [
        "El formato de la fecha de expiración de la licencia no es válido",
        undefined,
      ];
    }

    const year = dateToValidate.getFullYear();
    const maxYear = new Date().getFullYear() + 15; // Permitir hasta 15 años

    if (year < 1900 || year > maxYear) {
      return ["El año de la fecha de expiración no es válido", undefined];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateToValidate < today) {
      return [
        "La fecha de expiración de la licencia no puede ser una fecha pasada",
        undefined,
      ];
    }

    return [undefined, dateToValidate];
  }

  static hasAtLeastOneField(object: { [key: string]: any }): boolean {
    return Object.values(object).some(
      (field) => field !== undefined && field !== null && field !== ""
    ); // Verifica que al menos un campo no sea undefined, null o cadena vacía
    // Retorna true si hay al menos un campo válido, de lo contrario false
  }

  static isPositiveInteger(value: any): boolean {
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
  }

  static isPositiveNumber(value: any): boolean {
    const number = Number(value);
    return !isNaN(number) && number > 0;
  }

  static isValidDate(value: any): boolean {
    const date = new Date(value);
    console.log("Validating date:", value, date);
    console.log("Is valid date:", !isNaN(date.getTime()));
    return !isNaN(date.getTime());
  }

  static isValidString(value: any): boolean {
    return typeof value === "string" && value.trim().length > 0;
  }

  static isBoolean(value: any): boolean {
    const type = typeof value;
    return type === "boolean";
  }

  static validateCoordinates(lat: unknown, lon: unknown): boolean {
    if (typeof lat !== "number" || typeof lon !== "number") return false;

    const isLatValid = lat >= -90 && lat <= 90;
    const isLonValid = lon >= -180 && lon <= 180;

    return isLatValid && isLonValid;
  }
}
