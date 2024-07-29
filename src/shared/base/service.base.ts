import {
  DeepPartial,
  FindOptionsWhere,
  InsertResult,
  Not,
  Repository,
} from 'typeorm';
import { BaseEntity } from './entity.base';
import {
  IBaseDeleteOne,
  IBaseFindAll,
  IBaseFindMany,
  IBaseFindOne,
  IBaseService,
  IBaseUpdateMany,
  IBaseUpdateOne,
  ICreateOptions,
  IUpsertService,
} from './IBase.service';
import { buildFindingQuery, getNextCursor } from './build-finding-query';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Credentials } from './interface.base';
import { ERRORS_DICTIONARY } from 'src/constants/error-dictionary.constant';
import { CONSTRAINT_VALUES } from 'src/constants/constraints';

export abstract class BaseService<T extends BaseEntity>
  implements IBaseService<T>
{
  notfoundErrorCode = ERRORS_DICTIONARY.ITEM_NOTFOUND;
  existingErrorCode = ERRORS_DICTIONARY.ITEM_EXISTED;

  constructor(private readonly genericRepository: Repository<T>) {}

  async create(data: DeepPartial<T>, opts?: ICreateOptions<T>): Promise<T> {
    if (opts?.shouldCheckExists) {
      await this.checkExists({
        query: opts.validateQuery,
      });
    }

    if (opts?.credentials) {
      data.creator_id = opts.credentials.id;
    }

    const baseCreated = await this.genericRepository.save(data);
    return baseCreated;
  }

  async createMany(entities: T[], credentials?: Credentials): Promise<T[]> {
    if (credentials) {
      entities = entities.map((each) => {
        each.creator_id = credentials.id;
        return each;
      });
    }
    return this.genericRepository.save(entities);
  }

  async findOne(opts: IBaseFindOne<T>) {
    try {
      const { credentials, query, notfoundErrorCode } = opts;

      this.applyCreatedByFilter(query, credentials);

      const record = await this.genericRepository.findOne({
        where: {
          ...(query as FindOptionsWhere<T>),
          is_deleted: false,
        },
        relations: opts.relations || [],
      });

      if (!record) {
        throw new NotFoundException(
          notfoundErrorCode || this.notfoundErrorCode,
        );
      }

      return record;
    } catch (error) {
      if (opts.ignoreError) {
        return;
      }

      throw error;
    }
  }

  async updateOne(opts: IBaseUpdateOne<T>) {
    const { credentials, query, notFoundMessage, notfoundErrorCode } = opts;
    this.applyCreatedByFilter(query, credentials);
    const record = await this.genericRepository.findOne({
      where: {
        ...(opts.query as FindOptionsWhere<T>),
        is_deleted: false,
      },
    });

    if (!record) {
      throw new NotFoundException(notfoundErrorCode || this.notfoundErrorCode);
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
          opts.existingErrorCode || this.existingErrorCode,
        );
      }
    }
    Object.assign(record, opts.updateOneData);
    await this.genericRepository.save(record);

    return this.genericRepository.findOne({
      where: { id: record.id } as FindOptionsWhere<T>,
    });
  }

  async updateMany(opts: IBaseUpdateMany<T>) {
    const { credentials, query } = opts;
    this.applyCreatedByFilter(query, credentials);

    return await this.genericRepository.update(
      {
        ...(query as FindOptionsWhere<T>),
        is_deleted: false,
      },
      opts.updateData,
    );
  }

  async findMany(opts: IBaseFindMany<T>) {
    try {
      const { credentials, query } = opts;
      this.applyCreatedByFilter(query as any, credentials);
      const { sortingCondition, findingQuery, limit, offset, sort_by } =
        buildFindingQuery<T>({ query: opts.query });

      const [records, total] = await Promise.all([
        this.genericRepository.find({
          where: findingQuery,
          order: sortingCondition,
          skip: Number(offset),
          take: Number(limit),
          relations: opts.relations || [],
          select: opts.fields as any,
        }),
        this.genericRepository.count({ where: findingQuery }),
      ]);

      const nextCursor = getNextCursor({
        data: records,
        sort_by,
      });

      return {
        total,
        cursor: nextCursor,
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
        select: opts.select,
      });

      return records;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteOne(opts: IBaseDeleteOne<T>): Promise<boolean> {
    const { credentials, query, notFoundMessage, notfoundErrorCode } = opts;
    this.applyCreatedByFilter(query, credentials);

    const record = await this.genericRepository.findOne({
      where: {
        ...(opts.query as FindOptionsWhere<T>),
        is_deleted: false,
      },
    });

    if (!record) {
      throw new NotFoundException(notfoundErrorCode || this.notfoundErrorCode);
    }

    Object.assign(record, { is_deleted: true, deleted_at: new Date() });

    await this.genericRepository.save(record);
    return true;
  }

  async hardDeleteOne(opts: IBaseDeleteOne<T>): Promise<boolean> {
    const { credentials, query, notFoundMessage, notfoundErrorCode } = opts;
    this.applyCreatedByFilter(query, credentials);
    const { findingQuery, sortingCondition } = buildFindingQuery({ query });
    const record = await this.genericRepository.findOne({
      where: {
        ...findingQuery,
        is_deleted: false,
      },
      order: sortingCondition,
    });

    if (!record) {
      throw new NotFoundException(notfoundErrorCode || this.notfoundErrorCode);
    }

    await this.genericRepository.delete(record.id);
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
        opts.existingErrorCode || this.existingErrorCode,
      );
    }

    return false;
  }

  protected applyCreatedByFilter(
    query: { [key in string & keyof T]?: T | any },
    credentials?: Credentials,
  ) {
    if (credentials && !credentials.is_admin && !credentials.is_public) {
      query.creator_id = credentials.id;
    }
  }

  async upsert({
    upsertData,
    constraint,
  }: IUpsertService<T>): Promise<InsertResult> {
    return this.genericRepository.upsert(
      upsertData,
      CONSTRAINT_VALUES[constraint],
    );
  }

  async count(opts: IBaseFindAll<T>) {
    try {
      const { credentials, query } = opts;
      this.applyCreatedByFilter(query as any, credentials);
      const { findAllQuery } = buildFindingQuery<T>({ query: opts.query });
      const records = await this.genericRepository.count({
        where: findAllQuery,
        relations: opts.relations || [],
      });

      return records;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
