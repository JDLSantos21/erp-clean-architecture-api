import { Customer, CustomerAddress, CustomerPhone } from "../../domain";

export class CustomerMapper {
  static customerEntityFromObject(object: { [key: string]: any }): Customer {
    const {
      id,
      businessName,
      representativeName,
      rnc,
      email,
      notes,
      isActive,
      createdAt,
      updatedAt,
      phones,
      addresses,
    } = object;

    let phoneEntities: CustomerPhone[] = [];
    let addressEntities: CustomerAddress[] = [];

    if (phones && Array.isArray(phones)) {
      phones.forEach((phone) => {
        phoneEntities.push(this.customerPhoneEntityFromObject(phone));
      });
    }

    if (addresses && Array.isArray(addresses)) {
      addresses.forEach((address) => {
        addressEntities.push(this.customerAddressEntityFromObject(address));
      });
    }

    return new Customer({
      id,
      businessName,
      representativeName,
      rnc,
      email,
      notes,
      phones: phoneEntities,
      addresses: addressEntities,
      isActive,
      createdAt,
      updatedAt,
    });
  }

  static customerPhoneEntityFromObject(object: {
    [key: string]: any;
  }): CustomerPhone {
    const {
      id,
      customerId,
      description,
      phoneNumber,
      type,
      hasWhatsapp,
      isPrimary,
      isActive,
      createdAt,
      updatedAt,
    } = object;

    return new CustomerPhone({
      id,
      description,
      phoneNumber,
      type,
      hasWhatsapp,
      isPrimary,
    });
  }

  static customerAddressEntityFromObject(object: {
    [key: string]: any;
  }): CustomerAddress {
    const {
      id,
      customerId,
      direction,
      city,
      isPrimary,
      isActive,
      createdAt,
      updatedAt,
    } = object;

    return new CustomerAddress({
      id,
      direction,
      city,
      isPrimary,
    });
  }
}
