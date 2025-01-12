import { Module } from "@nestjs/common";
import { CryptoService } from "./application/crypto.service";

@Module({
  imports: [],
  controllers: [],
  providers: [
    CryptoService
  ],
  exports: [
    CryptoService
  ]
})
export class CryptoModule {}
