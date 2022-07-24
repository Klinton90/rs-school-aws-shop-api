import { formatJSONResponse, formatNotFoundError } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';

var products = require('../../assets/products.json');

const getProductsList = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
  console.log("id", id);
  console.log("event", event);
  if (!id) {
    return formatNotFoundError();
  }
  const product = products.find(product => product.id === id);
  if (!product) {
    return formatNotFoundError();
  }
  return formatJSONResponse({
    product,
  });
};

export const main = middyfy(getProductsList);
