import { DeepPartial, FindOptionsWhere, Not, Repository } from 'typeorm';
import { BaseEntity } from './entity.base';
import {
  IBaseDeleteOne,
  IBaseFindAll,
  IBaseFindMany,
  IBaseFindOne,
  IBaseService,
  IBaseUpdateOne,
  ICreateOptions,
} from './IBase.service';
import { buildFindingQuery } from './build-finding-query';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Credentials } from './interface.base';

export abstract class BaseService<T extends BaseEntity>
  implements IBaseService<T>
{
  notfoundMessage: string = 'Item not found';
  existingErrorMessage: string = 'Existing item';
  constructor(private readonly genericRepository: Repository<T>) {}

  async create(data: DeepPartial<T>, opts?: ICreateOptions<T>): Promise<T> {
    if (opts?.shouldCheckExists) {
      await this.checkExists({
        query: opts.validateQuery,
      });
    }

    if (opts?.credentials) {
      data.created_by = opts.credentials.id;
    }

    const baseCreated = await this.genericRepository.save(data);
    return baseCreated;
  }

  async createMany(entities: T[], credentials?: Credentials): Promise<T[]> {
    if (credentials) {
      entities = entities.map((each) => {
        each.created_by = credentials.id;
        return each;
      });
    }
    return this.genericRepository.save(entities);
  }

  async findOne(opts: IBaseFindOne<T>) {
    const { credentials, query, notFoundMessage } = opts;

    this.applyCreatedByFilter(query, credentials);

    const record = await this.genericRepository.findOne({
      where: {
        ...(query as FindOptionsWhere<T>),
        is_deleted: false,
      },
      relations: opts.relations || [],
    });

    if (!record) {
      throw new NotFoundException(notFoundMessage || this.notfoundMessage);
    }

    return record;
  }

  async updateOne(opts: IBaseUpdateOne<T>) {
    const { credentials, query } = opts;
    this.applyCreatedByFilter(query, credentials);
    const record = await this.genericRepository.findOne({
      where: {
        ...(opts.query as FindOptionsWhere<T>),
        is_deleted: false,
      },
    });

    if (!record) {
      throw new NotFoundException(opts.notFoundMessage || this.notfoundMessage);
    }

    if (
      opts.shouldCheckExists &&
      Object.values(opts.validateQuery)?.filter((each) => each !== undefined)
        ?.length
    ) {
      const existingRecord = await this.checkExists({
        query: { ...opts.validateQuery, id: Not(record.id) },
        credentials,
      });

      if (existingRecord) {
        throw new BadRequestException(
          opts.existingErrorMessage || this.existingErrorMessage,
        );
      }
    }

    await this.genericRepository.update(record.id, opts.updateOneData);

    return this.genericRepository.findOne({
      where: { id: record.id } as FindOptionsWhere<T>,
    });
  }

  async findMany(opts: IBaseFindMany<T>) {
    try {
      const { credentials, query } = opts;
      this.applyCreatedByFilter(query as any, credentials);
      const { sortingCondition, findingQuery, limit, offset } =
        buildFindingQuery<T>({ query: opts.query });

      const [records, total] = await Promise.all([
        this.genericRepository.find({
          where: findingQuery,
          order: sortingCondition,
          skip: Number(offset),
          take: Number(limit),
          relations: opts.relations || [],
        }),
        this.genericRepository.count({ where: findingQuery }),
      ]);

      return {
        total,
        records: records,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findAll(opts: IBaseFindAll<T>) {
    try {
      const { credentials, query } = opts;
      this.applyCreatedByFilter(query as any, credentials);
      const { findAllQuery } = buildFindingQuery<T>({ query: opts.query });
      const records = await this.genericRepository.find({
        where: findAllQuery,
        relations: opts.relations || [],
      });

      return records;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteOne(opts: IBaseDeleteOne<T>): Promise<boolean> {
    const { credentials, query } = opts;
    this.applyCreatedByFilter(query, credentials);

    const record = await this.genericRepository.findOne({
      where: {
        ...(opts.query as FindOptionsWhere<T>),
        is_deleted: false,
      },
    });

    if (!record) {
      throw new NotFoundException(opts.notFoundMessage || this.notfoundMessage);
    }

    await this.genericRepository.softDelete(record.id);
    return true;
  }

  async checkExists(opts: IBaseFindOne<T>) {
    const { credentials, query } = opts;
    this.applyCreatedByFilter(query, credentials);
    const record = await this.genericRepository.findOne({
      where: {
        ...(opts.query as FindOptionsWhere<T>),
        is_deleted: false,
      },
    });

    if (record) {
      throw new BadRequestException(
        opts.existingErrorMessage || this.existingErrorMessage,
      );
    }

    return false;
  }

  private applyCreatedByFilter(
    query: { [key in string & keyof T]?: T | any },
    credentials?: Credentials,
  ) {
    if (credentials && !credentials.isAdmin) {
      query.created_by = credentials.id;
    }
  }
}
