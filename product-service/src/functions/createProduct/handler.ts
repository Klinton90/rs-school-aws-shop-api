import { formatInvalidError, formatJSONResponse, formatNotFoundError } from '@libs/api-gateway';
import { createConnection } from '@libs/db';
import { middyfy } from '@libs/lambda';
import { Client } from 'pg';

const createProduct = async (event) => {
  let product;

  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  if (!body.title || !body.price || !body.count || typeof body.price != 'number' || typeof body.count != 'number') {
    return formatInvalidError();
  }

  const client: Client = createConnection();

  try {
    await client.connect();
    const res = await client.query(`
      insert into products (id, title, description, price)
      values (default, '${body.title}', '${body.description}', ${body.price})
      RETURNING *;
    `);
    product = res.rows[0];

    if (product?.id) {
      await client.query(`
        insert into stocks (id, product_id, "count")
        values (default, '${product.id}', ${body.count});
      `);
    }
  } catch (error) {
    console.log('DB error occured', error);
  } finally {
    client.end();
  }

  if (product)  {
    return formatJSONResponse(product);
  } else {
    return formatNotFoundError();
  }
};

export const main = middyfy(createProduct);
