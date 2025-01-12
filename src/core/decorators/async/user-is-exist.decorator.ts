import {
  registerDecorator,
  ValidationArguments, ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { Injectable } from "@nestjs/common";


@ValidatorConstraint({ name: "user-is-exist", async: true })
@Injectable()
export class UserIsExistConstraint implements ValidatorConstraintInterface {
  constructor(
  ) {
  }

  async validate(value: any, validationArguments?: ValidationArguments) {
    // try {
    //   await this.usersRepository.findUserByLogin(value);
    // } catch (e) {
    //   return false;
    // }
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return "User already exist";
  }

}

export function UserExists(property?: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: UserIsExistConstraint,
    });
  };
}

