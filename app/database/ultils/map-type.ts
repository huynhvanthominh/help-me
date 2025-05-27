import { TYPE_DATABASE_ENUM } from "../enums/type.enum";

export const mapTypeProto = (type: TYPE_DATABASE_ENUM): string => {
  if (type === TYPE_DATABASE_ENUM.NUMERIC) {
    return 'int32';
  }
  if (type === TYPE_DATABASE_ENUM.CHAR || type === TYPE_DATABASE_ENUM.DATE_TIME) {
    return 'string';
  }
  return '';
}
