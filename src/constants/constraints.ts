export enum CONSTRAINTS {
  USER_BLOCKING = 'constraint_user_blockings',
}

export const CONSTRAINT_VALUES = {
  [CONSTRAINTS.USER_BLOCKING]: ['user_id', 'blocked_by_user_id'],
};
