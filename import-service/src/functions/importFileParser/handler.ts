import { middyfy } from "@libs/lambda";
import { S3 } from 'aws-sdk';
import type { S3Event, S3EventRecord } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import csv from 'csv-parser'
import { PARSED_PATH, UPLOADED_PATH } from "@libs/constants";

const importFileParser = async (event: S3Event) => {
    const s3 = new S3({ region: process.env.REGION });

    const promises: Promise<any>[] = event.Records.map((record: S3EventRecord) => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: record.s3.object.key
            };
        
            const results = [];

            s3.getObject(params)
                .createReadStream()
                .pipe(csv())
                .on('data', (data) => {
                    results.push(data);
                })
                .on('error', (error) => {
                    reject(error);
                })
                .on('end', () => {
                    resolve(results);
                });
        });
    });

    try {
        const resolvedResults = await Promise.all(promises);
        console.log(resolvedResults);
    } catch (error) {
        console.error(error);
    }

    for (const record of event.Records) {
        await s3.copyObject({
            Bucket: process.env.BUCKET_NAME,
            CopySource: `${process.env.BUCKET_NAME}/${record.s3.object.key}`,
            Key: record.s3.object.key.replace(UPLOADED_PATH, PARSED_PATH)
        }).promise();

        await s3.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: record.s3.object.key
        }).promise();
    }

    return formatJSONResponse('success');
}

export const main = middyfy(importFileParser);