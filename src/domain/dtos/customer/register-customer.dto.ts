import { Validators } from "../../../config";

export class RegisterCustomerDTO {
  private constructor(
    public name: string,
    public email: string,
    public phoneNumber: string,
    public hasWhatsapp: string,
    public addresses: string[],
    public note?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, RegisterCustomerDTO?] {
    const { name, email, phoneNumber, hasWhatsapp, addresses, note } = object;

    if (!name) return ["Name is required"];
    if (!email) return ["Email is required"];
    if (!Validators.email.test(email)) return ["Email is not valid"];
    if (!phoneNumber) return ["Phone number is required"];
    if (!hasWhatsapp) return ["WhatsApp status is required"];
    if (!addresses || addresses.length === 0)
      return ["At least one address is required"];
    if (note && note.length > 300)
      return ["Note must be at most 300 characters"];

    return [
      undefined,
      new RegisterCustomerDTO(
        name,
        email,
        phoneNumber,
        hasWhatsapp,
        addresses,
        note
      ),
    ];
  }
}
