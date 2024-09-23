import { mapKeys, snakeCase } from 'lodash';

function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item));
  } else if (obj !== null && typeof obj === 'object') {
    return mapKeys(obj, (_value, key) => snakeCase(key));
  }
  return obj;
}

export default toSnakeCase;
