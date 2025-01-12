import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import cors from 'cors-ts';
import { useContainer } from 'class-validator';
import { AppModule } from '../../app.module';
import cookieParser from 'cookie-parser';
import { BadRequestExceptionFilter } from '../exceptions/exception-filters/bad-request-exception-filter';


export function applyAppSettings(app: INestApplication) {
  // app.setGlobalPrefix('api')
  app.use(cors({
    // credentials: true,
  }));
  app.useGlobalFilters(new BadRequestExceptionFilter())
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const customErrors = [];
        errors.forEach((e) => {
          const constraintKeys = Object.keys(e.constraints as any);
          constraintKeys.forEach((cKey, index) => {
            if (index >= 1) return;
            const msg = e.constraints?.[cKey] as any;
            // @ts-ignore
            customErrors.push({ field: e.property, message: msg });
          });
        });
        throw new BadRequestException(customErrors);
      },
    }),
  );
  app.use(cookieParser());
}
