import { mapKeys, camelCase } from 'lodash';

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = mapKeys(obj, (_value, key) => camelCase(key));

    for (const [key, value] of Object.entries(newObj)) {
      newObj[key] = toCamelCase(value);
    }

    return newObj;
  }
  return obj;
}

export default toCamelCase;
