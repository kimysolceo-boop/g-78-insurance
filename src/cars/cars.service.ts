import { Injectable } from '@nestjs/common';
import { CarsRepository } from './cars.repository.js';
import { UsersService } from '../users/users.service.js';
import { CarsMapper } from './dto/cars.mapper.js';
import { CarSaveDto } from './dto/car.save-dto.js';
import { CarDto } from './dto/car.dto.js';
import { Car } from './car.entity.js';
import { CarUpdateDto } from './dto/car.update-dto.js';
import { User } from '../users/user.entity.js';
import { EntitySaveException } from '../exceptions/entity-save.exception.js';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception.js';
import { EntityUpdateException } from '../exceptions/entity-update.exception.js';

@Injectable()
export class CarsService {
  constructor(
    private readonly repository: CarsRepository,
    private readonly userService: UsersService,
    private readonly mapper: CarsMapper,
  ) {}

  async create(saveDto: CarSaveDto): Promise<CarDto> {
    if (await this.repository.isVinExists(saveDto.vin)) {
      throw new EntitySaveException('Car', 'VIN');
    }

    const entity: Car = this.mapper.mapDtoToEntity(saveDto);
    entity.active = true;
    await this.repository.save(entity);
    return this.mapper.mapEntityToDto(entity);
  }
  async getAllActiveCars(): Promise<CarDto[]> {
    const cars: Car[] = await this.repository.findAllActive();
    if (cars.length === 0) {
      throw new EntityNotFoundException('Car');
    }
    return this.mapper.mapEntityListToDtoList(cars);
  }

  async getActiveCarById(id: number): Promise<CarDto | null> {
    const car: Car | null = await this.getActiveEntityById(id);

    if (!car || !car.active) {
      return null;
    }

    return this.mapper.mapEntityToDto(car);
  }
// вспомогательный
  async getActiveEntityById(id: number): Promise<Car | null> {
    const car: Car | null = await this.repository.findById(id);

    if (!car || !car.active) {
      throw new EntityNotFoundException('Car', id);
    }

    return car;
  }

  async update(id: number, updateDto: CarUpdateDto): Promise<void> {
    const foundCar: Car | null = await this.repository.findById(id);

    if (foundCar) {
      foundCar.color = updateDto.newColor;
      await this.repository.save(foundCar);
    } else {
      throw new EntityNotFoundException('Car', id);
    }
  }
  async deleteById(id: number): Promise<void> {
    const car: Car | null = await this.getActiveEntityById(id);

    if (car) {
      car.active = false;
      await this.repository.save(car);
    }
  }

  async restoreById(id: number): Promise<void> {
    const car: Car | null = await this.repository.findById(id);

    if (car && !car.active) {
      car.active = true;
      await this.repository.save(car);
    }
  }

  async setActiveOwnerToActiveCar(
    carId: number,
    ownerId: number,
  ): Promise<void> {
    const car: Car | null = await this.getActiveEntityById(carId);
    const owner: User | null =
      await this.userService.getActiveEntityById(ownerId);

    if (!car || car.owner.id === ownerId) {
      throw new EntityUpdateException(
        'Car not found or this user is already owner',
      );
    }

    if (car && owner) {
      car.owner = owner;
      await this.repository.save(car);
    }
  }
}
