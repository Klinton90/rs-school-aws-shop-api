import { formatJSONResponse, formatNotFoundError } from '@libs/api-gateway';
import { createConnection } from '@libs/db';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { Client } from 'pg';

const getProductById = async (event: APIGatewayProxyEvent) => {
  console.log("getProductById pathParameters", event.pathParameters);

  const { id } = event.pathParameters;

  if (!id) {
    return formatNotFoundError();
  }

  let product;
  const client: Client = createConnection();

  try {
    await client.connect();
    const res = await client.query(`
      select p.*, s.count
      from products p
      inner join stocks s on p.id = s.product_id 
      where p.id = '${id}'
    `);
    product = res.rows[0];
  } catch (error) {
    console.log('DB error occured', error);
  } finally {
    client.end();
  }

  if (!product) {
    return formatNotFoundError();
  }
  return formatJSONResponse({
    product,
  });
};

export const main = middyfy(getProductById);
