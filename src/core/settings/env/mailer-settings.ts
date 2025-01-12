import { IsNumber, IsString } from "class-validator";
import { EnvironmentVariable } from "./configuration";

export class MailerSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsString()
  SMTP_USER=this.environmentVariables.SMTP_USER;
  @IsString()
  SMTP_PASSWORD=this.environmentVariables.SMTP_PASSWORD;
  @IsNumber()
  SMTP_PORT=Number(this.environmentVariables.SMTP_PORT);
  @IsString()
  SMTP_HOST=this.environmentVariables.SMTP_HOST;
}
