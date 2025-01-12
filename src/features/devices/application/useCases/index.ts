import { GetDevicesUseCase } from './get-devices.use-case';
import { DeleteOneDeviceUseCase } from './delete-one-device.use-case';
import { DeleteAllDevicesUseCase } from './delete-all-devices.use-case';

export const DevicesCommandHandlers = [GetDevicesUseCase, DeleteOneDeviceUseCase, DeleteAllDevicesUseCase];
