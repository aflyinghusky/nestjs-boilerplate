import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Credentials } from './interface.base';
import {
  DeepPartial,
  FindOptionsSelect,
  FindOptionsWhere,
  InsertResult,
  UpdateResult,
} from 'typeorm';
import { CONSTRAINTS } from 'src/constants/constraints';

export interface IBaseUpdateOne<T> {
  query: { [key in string & keyof T]?: T | any };
  credentials?: Credentials;
  updateOneData: QueryDeepPartialEntity<T>;
  notFoundMessage?: string;
  notfoundErrorCode?: string;
  existingErrorCode?: string;
  shouldCheckExists?: boolean;
  validateQuery?: { [key in string & keyof T]?: any };
  existingErrorMessage?: string;
}

export interface IBaseDeleteOne<T> {
  query: { [key in string & keyof T]?: T | any } & {
    limit?: number;
    offset?: number;
    sort_by?: keyof DeepPartial<T>;
    sort_direction?: 'ASC' | 'DESC';
    page?: number;
    cursor?: string;
  };
  credentials?: Credentials;
  notFoundMessage?: string;
  notfoundErrorCode?: string;
  softDelete?: boolean;
}

export interface IBaseFindOne<T> {
  query: { [key in string & keyof T]?: T | any } & {
    limit?: number;
    offset?: number;
    sort_by?: keyof DeepPartial<T>;
    sort_direction?: 'ASC' | 'DESC';
    page?: number;
    cursor?: string;
  };
  notFoundMessage?: string;
  notfoundErrorCode?: string;
  existingErrorMessage?: string;
  existingErrorCode?: string;
  credentials?: Credentials;
  relations?: string[];
  ignoreError?: boolean;
}

export interface IBaseFindMany<T> {
  query: FindOptionsWhere<T> & {
    limit?: number;
    offset?: number;
    sort_by?: keyof DeepPartial<T>;
    sort_direction?: 'ASC' | 'DESC';
    page?: number;
    cursor?: string;
  };
  relations?: string[];
  fields?: string[];
  credentials?: Credentials;
}

export interface IBaseFindAll<T> {
  query: FindOptionsWhere<T> & {
    sort_by?: keyof DeepPartial<T>;
    sort_direction?: 'ASC' | 'DESC';
  };
  select?: FindOptionsSelect<T>;
  relations?: string[];
  credentials?: Credentials;
}

export interface IBaseUpdateMany<T> {
  query: FindOptionsWhere<T>;
  updateData: QueryDeepPartialEntity<T>;
  credentials?: Credentials;
}

export interface IFindManyOptions {
  limit?: number;
  offset?: number;
  field?: number;
}

export interface IFindManyResult<T> {
  records: T[];
  total: number;
  cursor?: string;
}

export interface ICreateOptions<T> {
  shouldCheckExists?: boolean;
  validateQuery?: { [key in string & keyof T]?: any };
  existingErrorMessage?: string;
  existingErrorCode?: string;
  credentials?: Credentials;
}

export interface IBaseService<T> {
  notfoundErrorCode: string;
  existingErrorCode: string;
  findMany?(opts: IBaseFindMany<T>): Promise<IFindManyResult<T>>;
  findAll?(opts: IBaseFindAll<T>): Promise<T[]>;
  findOne?(opts: IBaseFindOne<T>): Promise<T>;
  updateOne?(opts: IBaseUpdateOne<T>): Promise<T>;
  updateMany?(opts: IBaseUpdateMany<T>): Promise<UpdateResult>;
  deleteOne?(opts: IBaseDeleteOne<T>): Promise<boolean>;
  checkExists?(opts: IBaseFindOne<T>): Promise<boolean>;
  create?(entity: T, opts?: ICreateOptions<T>): Promise<T>;
  createMany?(entities: T[]): Promise<T[]>;
  upsert?(opts: IUpsertService<T>): Promise<InsertResult>;
}

export interface IUpsertService<T> {
  upsertData: QueryDeepPartialEntity<T>;
  constraint: CONSTRAINTS;
}
