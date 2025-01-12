import { Controller, Delete, Get, HttpCode, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { GetDevicesCommand } from '../application/useCases/get-devices.use-case';
import { DeleteOneDeviceCommand } from '../application/useCases/delete-one-device.use-case';
import { DeleteAllDevicesCommand } from '../application/useCases/delete-all-devices.use-case';


@Controller('security')
export class DevicesController {

  constructor(
    private readonly commandBus: CommandBus,
  ) {
  }

  @Get('devices')
  async getDevices(@Req() req: Request) {
    const devices = await this.commandBus.execute(new GetDevicesCommand(req.cookies))
    return devices
  }


  @Delete('devices/:id')
  @HttpCode(204)
  async deleteSessionById(@Req() req: Request, @Param('id') id: string) {
    const deleteDevice = await this.commandBus.execute(new DeleteOneDeviceCommand(req.cookies, id))
    return deleteDevice
  }

  @Delete('devices')
  @HttpCode(204)
  async deleteAllMyDevicesExceptCurrent(@Req() req: Request) {
    const deleteDevices = await this.commandBus.execute(new DeleteAllDevicesCommand(req.cookies))
    return deleteDevices
  }

}
