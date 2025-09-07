import { CustomError, User } from "../../domain";

export class UserMapper {
  static userEntityFromObject(object: { [key: string]: any }) {
    const { id, username, name, lastName, roles } = object;

    if (!id || !username || !name || !lastName || !roles) {
      throw CustomError.badRequest("Invalid user object");
    }

    console.log("Object UserMapper:", object);

    const userMapped: Partial<User> = {
      id,
      username,
      name,
      lastName,
      roles: roles.map((role: any) => role.role.name),
    };

    console.log("Mapped User From Mapper:", userMapped);

    return userMapped as User;
  }
}
