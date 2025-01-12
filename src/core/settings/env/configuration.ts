import { ValidateNested, validateSync } from "class-validator";
import { EnvironmentSettings } from "./env-settings";
import { ApiSettings } from "./api-settings";
import { DatabaseSettings } from "./database-settings";
import { MailerSettings } from "./mailer-settings";
import * as process from 'node:process';

export type EnvironmentVariable = { [key: string]: string };
export type ConfigurationType = Configuration;

export class Configuration {
  @ValidateNested()
  apiSettings: ApiSettings;
  @ValidateNested()
  databaseSettings: DatabaseSettings;
  @ValidateNested()
  mailerSettings: MailerSettings;
  @ValidateNested()
  environmentSettings: EnvironmentSettings;

  private constructor(configuration: Configuration) {
    Object.assign(this, configuration);
  }

  static createConfig(
    environmentVariables: Record<string, string>,
  ): Configuration {
    return new this({
      apiSettings: new ApiSettings(environmentVariables),
      databaseSettings: new DatabaseSettings(environmentVariables),
      mailerSettings: new MailerSettings(environmentVariables),
      environmentSettings: new EnvironmentSettings(environmentVariables),
    });
  }
}

export function validate(environmentVariables: Record<string, string>) {
  const config = Configuration.createConfig(environmentVariables);
  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length > 0) {
    console.log(errors);
    throw new Error(errors.toString());
  }
  return config;
}

export default () => {
  const environmentVariables = process.env as EnvironmentVariable;
  // console.log('process.env.ENV =', environmentVariables.ENV);
  return Configuration.createConfig(environmentVariables);
};
