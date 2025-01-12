import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { DeviceEntity } from '../domain/devices.entity';


@Injectable()
export class DevicesRepositoryTO {
  constructor(
    @InjectRepository(DeviceEntity) private readonly dRepository: Repository<DeviceEntity>
  ) {
  }

  async createSession(deviceData: any) {
    const result = await this.dRepository.save(
      deviceData,
    );
    return result;
  }

  async findManyDevices(filter: Partial<DeviceEntity>) {
    const findedDevice = await this.dRepository.findOne(
      { where: { userId: filter.userId, ip: filter.ip, title: filter.title } },
    );
    // if (!findedDevice) {
    //   throw new NotFoundException('Device not found');
    // }
    return findedDevice;
  }

  async findDeviceByUserId(filter: any) {
    const findedDevice = await this.dRepository.find(
      { where: { userId: filter.userId } },
    );
    if (!findedDevice) {
      throw new NotFoundException('Device not found');
    }
    return findedDevice;
  }

  async findDeviceByDeviceId(filter: any) {
    const findedDevice = await this.dRepository.findOne(
      { where: { deviceId: filter.deviceId } },
    );
    if (!findedDevice) {
      throw new NotFoundException('Device not found');
    }
    return findedDevice;
  }

  // update device info

  async updateDeviceById(id: string, newDate: any) {
    return await this.dRepository.update(
      { id },
      { lastActiveDate: newDate },
    );
  }

  // update device info after refresh tokens

  async updateDeviceByIdAndByDeviceId(id: string, deviceId: string, newDate: any) {
    return await this.dRepository.update(
      { userId: id, deviceId },
      { lastActiveDate: newDate },
    );
  }

  async deleteDeviceByDeviceId(filter: any) {
    const finderDevice = this.findDeviceByDeviceId(filter.deviceId);
    return await this.dRepository.delete(
      { deviceId: filter.deviceId },
    );
  }

  async deleteAllDevicesExceptCurrent(filter: any) {
    const deleteDevices = await this.dRepository.delete(
      { deviceId: Not(filter.deviceId), userId: filter.userId },
    );
    return deleteDevices;
  }

}
