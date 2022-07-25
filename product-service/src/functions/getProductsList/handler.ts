import { formatJSONResponse, formatNotFoundError } from '@libs/api-gateway';
import { createConnection } from '@libs/db';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { Client } from 'pg';

const getProductsList = async (event: APIGatewayProxyEvent) => {
  console.log("getProductsList event", event);

  let products;

  const client: Client = createConnection();

  try {
    await client.connect();
    const res = await client.query(`
      select p.*, s.count
      from products p
      inner join stocks s on p.id = s.product_id 
    `);
    products = res.rows;
  } catch (error) {
    console.log('DB error occured', error);
  } finally {
    client.end();
  }

  if (products?.length)  {
    return formatJSONResponse(products);
  } else {
    return formatNotFoundError();
  }
};

export const main = middyfy(getProductsList);
