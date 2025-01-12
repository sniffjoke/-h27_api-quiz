import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateUserDto, EmailConfirmationModel } from '../api/models/input/create-user.dto';


@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async createUser(userData: CreateUserDto, emailConfirmation: EmailConfirmationModel) {
    const result = await this.dataSource.query(
      `
                INSERT INTO users ("login", "email", "password") 
                VALUES ($1, $2, $3)
                RETURNING "id", "login", "email", "createdAt"
            `,
      [
        userData.login,
        userData.email,
        userData.password,
      ],
    );
    const resultEmailConfirmation = await this.dataSource.query(
      `
            INSERT INTO "emailConfirmation" ("userId", "isConfirm", "confirmationCode", "expirationDate")
            VALUES ($1, $2, $3, $4)
            RETURNING *      
      `,
      [
        result[0].id,
        emailConfirmation.isConfirm,
        emailConfirmation.confirmationCode,
        emailConfirmation.expirationDate
      ]
    )
    return result[0];
  }


  async updateUserByActivateEmail(userId: any) {
    const updateUserInfo = await this.dataSource.query(
      `
                UPDATE "emailConfirmation" 
                SET "isConfirm" = true
                WHERE "userId" = $1
            `,
      [userId]);
    return updateUserInfo;
  }

  async updateUserByResendEmail(userId: number, emailConfirmation: EmailConfirmationModel) {
    const updateUserInfo = await this.dataSource.query(
      `
                UPDATE "emailConfirmation" 
                SET "expirationDate" = $2, "confirmationCode" = $3
                WHERE "userId" = $1
            `,
      [
        userId,
        emailConfirmation.expirationDate,
        emailConfirmation.confirmationCode,
      ]);
    return updateUserInfo;
  }

  async findUserById(id: string) {
    const findedUser = await this.dataSource.query(
      `
                SELECT * FROM users WHERE id = $1
            `,
      [id]);
    if (!findedUser.length) {
      throw new NotFoundException('User not found');
    }
    return findedUser[0];
  }

  async findUserByIdOrNull(id: string) {
    const findedUser = await this.dataSource.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!findedUser.length) {
      return null;
    } else return findedUser[0];
  }

  async findUserByLogin(login: string) {
    const findedUser = await this.dataSource.query('SELECT * FROM users WHERE login = $1', [login]);
    if (!findedUser.length) {
      throw new UnauthorizedException('User not found');
    }
    return findedUser[0];
  }

  async findUserByEmail(email: string) {
    const findedUser = await this.dataSource.query(
      `
                SELECT u."id", u."email", e."confirmationCode", e."isConfirm" 
                FROM users u
                LEFT JOIN "emailConfirmation" e
                ON e."userId" = u."id" 
                WHERE email = $1
            `,
      [email],
    );
    if (!findedUser.length) {
      throw new BadRequestException('Email not exists');
    }
    return findedUser[0];
  }

  async findUserByCode(code: string) {
    const findedUser = await this.dataSource.query(
      `
                SELECT u."id", u."login", e."confirmationCode", e."isConfirm" 
                FROM users u
                LEFT JOIN "emailConfirmation" e
                ON e."userId" = u."id" 
                WHERE "confirmationCode" = $1
            `,
      [code]);
    if (!findedUser.length) {
      throw new BadRequestException('Code not found');
    }
    return findedUser[0];
  }

  async deleteUserById(id: string) {
    const findedUser = await this.findUserById(id);
    return await this.dataSource.query('DELETE FROM users WHERE "id" = $1', [id]);
  }

  async checkIsUserExists(login: string, email: string) {
    const findedUserByLogin = await this.dataSource.query(
      'SELECT * FROM users WHERE "login" = $1',
      [login],
    );
    if (findedUserByLogin.length) {
      throw new BadRequestException(
        'Login already exists',
      );
    }
    const findedUserByEmail = await this.dataSource.query(
      'SELECT * FROM users WHERE "email" = $1',
      [email],
    );
    if (findedUserByEmail.length) {
      throw new BadRequestException('Email already exists');
    }
  }

}
