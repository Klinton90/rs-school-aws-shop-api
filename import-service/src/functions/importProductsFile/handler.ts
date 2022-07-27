import { middyfy } from "@libs/lambda";
import { S3 } from 'aws-sdk';
import type { APIGatewayProxyEvent } from "aws-lambda";
import { formatInvalidError, formatIternalError, formatJSONResponse } from "@libs/api-gateway";
import { UPLOADED_PATH } from "@libs/constants";

const importProductsFile = async (event: APIGatewayProxyEvent) => {
  const s3 = new S3({ region: process.env.REGION });

  if (!event.queryStringParameters.name) {
    return formatInvalidError();
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${UPLOADED_PATH}/${event.queryStringParameters.name}`,
    Expires: 60,
    ContentType: 'text/csv'
  };

  try {
    const url: string = await s3.getSignedUrl('putObject', params);

    return formatJSONResponse(url);
  } catch (error) {
    console.error('getSignedUrl failed', error);
    return formatIternalError();
  }
}

export const main = middyfy(importProductsFile);