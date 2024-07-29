import { FindOptionsOrder, In, IsNull, LessThan, MoreThan } from 'typeorm';
import { SortBy } from './dto.base';

export const buildFindingQuery = <T>({ query }) => {
  const {
    sort_by = 'id',
    limit = 15,
    page,
    cursor,
    sort_direction,
    offset = 0,
    ...findingQuery
  } = query;

  const validDirection: number = sort_direction === 'ASC' ? 1 : -1;
  const sortingCondition = { [sort_by]: validDirection } as FindOptionsOrder<T>;
  for (const key in findingQuery) {
    if (!key || !findingQuery[key]) {
      delete findingQuery[key];
      continue;
    }

    if (Array.isArray(findingQuery[key]) && findingQuery[key].length) {
      findingQuery[key] = In(findingQuery[key]);

      continue;
    }

    if (findingQuery[key] === 'null') {
      findingQuery[key] = IsNull();
    }
  }

  if (!findingQuery.is_deleted) {
    findingQuery.is_deleted = false;
  }

  const findAllQuery = { ...findingQuery };

  if (offset && Number(offset) > 0) {
    return {
      sortingCondition,
      sort_by,
      findingQuery,
      findAllQuery,
      limit,
      offset,
      page,
    };
  }
  if (page > 0) {
    let offsetByPage = 0;
    offsetByPage = (page - 1) * limit;
    return {
      sortingCondition,
      sort_by,
      findingQuery,
      findAllQuery,
      limit,
      offset: offsetByPage,
      page,
    };
  }
  if (cursor) {
    const condition: any = validDirection === 1 ? MoreThan : LessThan;
    findingQuery[sort_by] = condition(cursor);
  }

  return {
    sortingCondition,
    sort_by,
    findingQuery,
    findAllQuery,
    limit,
    offset,
  };
};

export const getNextCursor = ({ data, sort_by }) => {
  let nextCursor = 'END';

  if (data.length) {
    nextCursor = data[data.length - 1].created_at;
  }

  if (data.length && sort_by) {
    let cursor = data[data.length - 1][sort_by];

    if (!!cursor && typeof cursor === 'object' && cursor[sort_by]) {
      cursor = cursor[sort_by];
    }
    nextCursor = cursor;
  }

  return nextCursor;
};

export const buildNativeQueryBuilder = ({ query, repositoryKey }) => {
  const {
    sort_by,
    limit,
    page,
    cursor,
    sort_direction,
    offset,
    ...findingQuery
  } = query;

  const clauses = [`${repositoryKey}.is_deleted = false`];

  for (const key in findingQuery) {
    if (!key || !query[key] || !query[key].length) {
      continue;
    }

    if (Array.isArray(query[key]) && query[key].length > 0) {
      clauses.push(`${repositoryKey}.${key} IN('${query[key].join("' , '")}')`);
      continue;
    }

    if (typeof query[key] === 'number') {
      clauses.push(`${repositoryKey}.${key} = ${query[key]}`);
      continue;
    }

    clauses.push(`${repositoryKey}.${key} = '${query[key]}'`);
  }

  if (!clauses.length) {
    return null;
  }

  const query_string = `${clauses.join(' and ')}`;

  return { query_string, metadata: query };
};

export const getNativeSortCondition = ({
  sort_by,
  sort_direction,
  repo_key,
}) => {
  return `ORDER BY ${repo_key}.${sort_by} ${sort_direction}`;
};
