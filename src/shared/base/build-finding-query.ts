import { FindOptionsOrder, In, IsNull, LessThan, MoreThan } from 'typeorm';

export const buildFindingQuery = <T>({ query }) => {
  const {
    sortBy = 'created_at',
    limit = 15,
    page = 1,
    cursor,
    sortDirection,
    offset = 0,
    ...findingQuery
  } = query;
  const validDirection: number = sortDirection === 'ASC' ? 1 : -1;
  const sortingCondition = { [sortBy]: validDirection } as FindOptionsOrder<T>;
  for (const key in findingQuery) {
    if (!key && !findingQuery[key]) {
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

  Object.assign(findingQuery, { is_deleted: false });
  const findAllQuery = { ...findingQuery };

  if (offset && Number(offset) > 0) {
    return {
      sortingCondition,
      findingQuery,
      findAllQuery,
      limit,
      offset,
    };
  }

  let offsetByPage = 0;
  if (page > 0) {
    offsetByPage = (page - 1) * limit;
  }

  return {
    sortingCondition,
    findingQuery,
    findAllQuery,
    limit,
    offset: offsetByPage,
  };
};
