import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Credentials } from './interface.base';

export interface IBaseUpdateOne<T> {
  query: { [key in string & keyof T]?: T | any };
  credentials?: Credentials;
  updateOneData: QueryDeepPartialEntity<T>;
  notFoundMessage?: string;
  shouldCheckExists?: boolean;
  validateQuery?: { [key in string & keyof T]?: any };
  existingErrorMessage?: string;
}

export interface IBaseDeleteOne<T> {
  query: { [key in string & keyof T]?: T | any };
  credentials?: Credentials;
  notFoundMessage?: string;
  softDelete?: boolean;
}

export interface IBaseFindOne<T> {
  query: { [key in string & keyof T]?: T | any };
  notFoundMessage?: string;
  existingErrorMessage?: string;
  credentials?: Credentials;
  relations?: string[];
}

export interface IBaseFindMany<T> {
  query: Record<string, T>;
  relations?: string[];
  credentials?: Credentials;
}

export interface IBaseFindAll<T> {
  query: Record<string, T>;
  relations?: string[];
  credentials?: Credentials;
}

export interface IBaseUpdateMany<T> {
  query: Record<string, T>;
  updateOneData: Omit<Record<string, T>, 'id'>;
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
}

export interface ICreateOptions<T> {
  shouldCheckExists?: boolean;
  validateQuery?: { [key in string & keyof T]?: any };
  existingErrorMessage?: string;
  credentials?: Credentials;
}

export interface IBaseService<T> {
  notfoundMessage: string;
  existingErrorMessage: string;
  findMany?(opts: IBaseFindMany<T>): Promise<IFindManyResult<T>>;
  findAll?(opts: IBaseFindAll<T>): Promise<T[]>;
  findOne?(opts: IBaseFindOne<T>): Promise<T>;
  updateOne?(opts: IBaseUpdateOne<T>): Promise<T>;
  updateMany?(opts: IBaseUpdateMany<T>): Promise<boolean>;
  deleteOne?(opts: IBaseDeleteOne<T>): Promise<boolean>;
  checkExists?(opts: IBaseFindOne<T>): Promise<boolean>;
  create?(entity: T, opts?: ICreateOptions<T>): Promise<T>;
  createMany?(entities: T[]): Promise<T[]>;
}
