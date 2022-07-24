import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';

var products = require('../../assets/products.json');

const getProductsList = async (event: APIGatewayProxyEvent) => {
  return formatJSONResponse(products);
};

export const main = middyfy(getProductsList);
