import { Repository, ObjectLiteral, FindOptionsWhere, DeepPartial } from 'typeorm';
import { NotFoundException, BadRequestException } from '../exceptions';
import { AppDataSource } from '../config/data-source';

export abstract class BaseService<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(entity: new () => T) {
    this.repository = AppDataSource.getRepository(entity);

  }


  public getRepository(): Repository<T>{
    return this.repository;
  }
  
  async findById(id: string, relations?: string[]): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations,
    });
    if (!entity) throw new NotFoundException(`${this.repository.metadata.name} not found`);
    return entity;
  }

  async findAll(options?: { where?: FindOptionsWhere<T>; relations?: string[]; order?: any; skip?: number; take?: number }): Promise<[T[], number]> {
    return this.repository.findAndCount({
      where: options?.where,
      relations: options?.relations,
      order: options?.order,
      skip: options?.skip,
      take: options?.take,
    });
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findById(id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`${this.repository.metadata.name} not found`);
  }
}