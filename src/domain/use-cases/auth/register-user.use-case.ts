import { JwtAdapter } from "../../../config/jwt";
import { RegisterUserDto } from "../../dtos";
import { CustomError } from "../../errors";
import { AuthRepository } from "../../repositories";

type User = {
  id: string;
  name: string;
  lastName: string;
  roles: string[];
};

interface UserToken {
  token: string;
  user: User;
}

type signToken = (payload: Object, duration?: number) => Promise<string | null>;

interface RegisterUserUseCase {
  execute(registerUserDto: RegisterUserDto): Promise<UserToken>;
}

export class RegisterUser implements RegisterUserUseCase {
  private static readonly TOKEN_DURATION_HOURS = 2;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly signToken: signToken = JwtAdapter.generateToken
  ) {}

  async execute(registerUserDto: RegisterUserDto): Promise<UserToken> {
    await this.existsUser(registerUserDto.username);
    await this.verifyRoleExists(registerUserDto.roles);

    // crear usuario
    const user = await this.authRepository.register(registerUserDto);
    // token
    const tokenDurationInSeconds = RegisterUser.TOKEN_DURATION_HOURS * 3600;

    const token = await this.signToken({ id: user.id }, tokenDurationInSeconds);

    if (!token)
      throw CustomError.internalServer("Error register user ErrC:Ax01");

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        roles: user.roles.map((role) => role.toString()),
      },
    };
  }

  private async existsUser(username: string): Promise<void> {
    const user = await this.authRepository.findUserByUsername(username);
    if (user) {
      throw CustomError.badRequest("User already exists");
    }
  }

  private async verifyRoleExists(roleIds: number[]): Promise<void> {
    const roles = await this.authRepository.findRolesByIds(roleIds);
    if (roles.length !== roleIds.length) {
      throw CustomError.badRequest("Some roles do not exist");
    }
  }
}
