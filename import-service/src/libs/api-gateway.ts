import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = (response: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response)
  }
}

export const formatNotFoundError = () => {
  return {
    statusCode: 404,
    body: ''
  }
}

export const formatInvalidError = () => {
  return {
    statusCode: 400,
    body: ''
  }
}

export const formatIternalError = () => {
  return {
    statusCode: 500,
    body: ''
  }
}