import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

interface MyResponse {
  statusCode: number;
  body?: string;
}

export const formatJSONResponse = (response?: any): MyResponse => {
  return {
    statusCode: 200,
    body: response ? JSON.stringify(response) : '',
  };
}

export const formatNotFoundError = (): MyResponse => {
  return {
    statusCode: 404,
    body: ''
  }
}

export const formatInvalidError = (): MyResponse => {
  return {
    statusCode: 400,
    body: ''
  }
}