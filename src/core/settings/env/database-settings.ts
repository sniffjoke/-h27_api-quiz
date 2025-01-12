import { IsNumber, IsString } from "class-validator";
import { EnvironmentVariable } from "./configuration";

export class DatabaseSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsString()
  DB_HOST: string = this.environmentVariables.DB_HOST;
  @IsNumber()
  DB_PORT= Number(this.environmentVariables.DB_PORT);
  @IsString()
  DB_USERNAME = this.environmentVariables.DB_USERNAME;
  @IsString()
  DB_PASSWORD = this.environmentVariables.DB_PASSWORD;
  @IsString()
  DATABASE_NAME = this.environmentVariables.DATABASE_NAME;
  @IsString()
  SSL_CONNECTION = this.environmentVariables.SSL_CONNECTION;
}
