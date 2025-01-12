import { IsNumber } from "class-validator";
import { EnvironmentVariable } from "./configuration";

export class ApiSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}

  @IsNumber()
  PORT: number = Number(this.environmentVariables.PORT);
  API_URL: string = this.environmentVariables.API_URL;
  JWT_SECRET_REFRESH_TOKEN: string = this.environmentVariables.JWT_SECRET_REFRESH;
  JWT_SECRET_ACCESS_TOKEN: string = this.environmentVariables.JWT_SECRET_ACCESS;
  ADMIN: string = this.environmentVariables.ADMIN;
}
