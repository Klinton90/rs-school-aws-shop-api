import { middyfy } from "@libs/lambda";
import { S3, SQS } from 'aws-sdk';
import type { S3Event, S3EventRecord } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import csv from 'csv-parser'
import { PARSED_PATH, UPLOADED_PATH } from "@libs/constants";

const getParseRecordPromise = (record: S3EventRecord, s3: S3): Promise<any[]> => {
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
}

const sentToQueue = async (resolvedResults: any[]): Promise<void> => {
    console.log('Start send message into queue');

    const sqs = new SQS({
        region: process.env.REGION
    });

    const chunkSize = 10;
    for (let i = 0; i < resolvedResults.length; i += chunkSize) {
        const chunk: any[] = resolvedResults.slice(i, i + chunkSize);

        try {
            await sqs.sendMessageBatch({
                QueueUrl: process.env.CATALOG_ITEMS_QUEUE,
                Entries: chunk.map((item: any, index: number) => ({
                    Id: index.toString(),
                    MessageBody: JSON.stringify(item),
                }))
            }).promise();
            
            console.log('Message sucessfully sumbitted into queue');
        } catch (error) {
            console.log('Error when sending message to queue', error);
    
            throw error;
        }
    }

    console.log('Finish send message into queue');
}

const cleanupS3 = async (event: S3Event, s3: S3): Promise<void> => {
    console.log('Start S3 migration');

    for (const record of event.Records) {
        let copyResult;
        try {
            copyResult = await s3.copyObject({
                Bucket: process.env.BUCKET_NAME,
                CopySource: `${process.env.BUCKET_NAME}/${record.s3.object.key}`,
                Key: record.s3.object.key.replace(UPLOADED_PATH, PARSED_PATH)
            }).promise();

            console.log('Record copied to parsed', record.s3.object.key);
        } catch (err) {
            console.log('Error while copying file to parsed', record.s3.object.key);
        }

        if (copyResult) {
            try {
                await s3.deleteObject({
                    Bucket: process.env.BUCKET_NAME,
                    Key: record.s3.object.key
                }).promise();
        
                console.log('Record deleted from uploaded', record.s3.object.key);
            } catch (err) {
                console.log('Error while deleting file from uploaded', record.s3.object.key);
            }
        }
    }

    console.log('Finish S3 migration');
}

const importFileParser = async (event: S3Event) => {
    const s3 = new S3({ region: process.env.REGION });

    let resolvedResults;
    try {
        resolvedResults = (await Promise.all(event.Records.map((record: S3EventRecord) => getParseRecordPromise(record, s3)))).flat();

        console.log('Parsed records', resolvedResults);
    } catch (error) {
        console.error('Error occurred when parsing records', error);
    }

    if (resolvedResults?.length) {
        await sentToQueue(resolvedResults);

        await cleanupS3(event, s3);
    }

    return formatJSONResponse('success');
}

export const main = middyfy(importFileParser);