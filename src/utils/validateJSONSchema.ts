import * as Ajv from 'ajv';

const ajv = new Ajv();

type ValidateSchema = <T1>(schemaName: string, data: T1) => boolean;

export const isValidSchema: ValidateSchema = (schema: Object, data) => {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      console.log(`Пришедшие с сервера данные не соответствуют ожидаемому формату`, validate.errors, data);
      return false;
    }
    return true;
};
