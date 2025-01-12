import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidationException } from "../exceptions/exceptions/validation.exception";


@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
        if (!metatype) {
            return value
        }
        const obj = plainToInstance(metatype, value)
        const errors = await validate(obj)

        if (errors.length) {
            let messages = errors.map((err) => {
                return {message: `${Object.values(err.constraints as Object)}`, field: `${err.property}`}
            })
            throw new ValidationException({errorsMessages: messages})
        }
        return value
    }
}
