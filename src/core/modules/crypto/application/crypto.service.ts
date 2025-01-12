import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt";

@Injectable()
export class CryptoService {
  constructor(
  ) {
  }

  async hashPassword(password: string): Promise<string> {
    const hashPassword = await hash(password, 3)
    return hashPassword
  }

  async comparePassword(password: string, hashPassword: string): Promise<boolean> {
    const isCompare = await compare(password, hashPassword)
    return isCompare
  }

}
