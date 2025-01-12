import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async createSession(deviceData: any) {
    const result = await this.dataSource.query(
      `
                INSERT INTO devices ("userId", "deviceId", "title", "ip", "lastActiveDate") VALUES ($1, $2, $3, $4, $5) RETURNING *
`, [
        deviceData.userId,
        deviceData.deviceId,
        deviceData.title,
        deviceData.ip,
        deviceData.lastActiveDate,
      ]);
    return result;
  }

  async findManyDevices(filter: any) {
    const findedDevice = await this.dataSource.query(
      `
                SELECT * 
                FROM devices 
                WHERE "userId" = $1 AND "ip" = $2 AND "title" = $3
    `, [
        filter.userId,
        filter.ip,
        filter.title,
      ],
    );
    return findedDevice[0];
  }

  async findDeviceByUserId(filter: any) {
    const findedDevice = await this.dataSource.query(
      `
                SELECT * 
                FROM devices 
                WHERE "userId" = $1
      `,
      [filter.userId],
    );
    if (!findedDevice.length) {
      throw new NotFoundException('Device not found');
    }
    return findedDevice;
  }

  async findDeviceByDeviceId(filter: any) {
    const findedDevice = await this.dataSource.query(
      `
                SELECT * 
                FROM devices 
                WHERE "deviceId" = $1
      `,
      [filter.deviceId],
    );
    if (!findedDevice.length) {
      throw new NotFoundException('Device not found');
    }
    return findedDevice;
  }

  // update device info

  async updateDeviceById(id: string, deviceData: any) {
    return await this.dataSource.query('UPDATE devices SET "lastActiveDate" = $1 WHERE id = $2', [deviceData, id]);
  }

  // update device info after refresh tokens

  async updateDeviceByIdAndByDeviceId(id: string, deviceId: string, deviceData: any) {
    return await this.dataSource.query(`
    UPDATE devices SET "lastActiveDate" = $1 WHERE "userId" = $2 AND "deviceId" = $3
    `,
      [deviceData, id, deviceId]);
  }

  async deleteDeviceByDeviceId(filter: any) {
    const findedDevice = this.findDeviceByDeviceId(filter);
    return await this.dataSource.query(
      `
                DELETE FROM devices 
                WHERE "deviceId" = $1
      `,
      [
        filter.deviceId
      ]);
  }

  async deleteAllDevicesExceptCurrent(filter: any) {
    const deleteDevices = await this.dataSource.query(
      `
                DELETE
                FROM devices
                WHERE "deviceId" <> $1 AND "userId" = $2
            `,
      [
        filter.deviceId, filter.userId,
      ],
    );
    return deleteDevices;
  }

}
