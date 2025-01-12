import {Module} from '@nestjs/common';
import {TestingController} from "./api/testing.controller";
import {TestingService} from "./application/testing.service";
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
      TypeOrmModule.forFeature([])
    ],
    controllers: [TestingController],
    providers: [
        TestingService,
    ],
})
export class TestingModule {
}
