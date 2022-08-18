import { createConnection } from "@libs/db";
import { middyfy } from "@libs/lambda"
import { SQSEvent, SQSRecord } from "aws-lambda";
import { Client } from "pg";
import { SNS } from 'aws-sdk';

const saveRecordToDb = async (client: Client, item: any) => {
    try {
        console.log('Processing record', item);

        await client.query(`
            begin;

            with last_product_id as (
                insert into products (id, title, description, price)
                values (default, '${item.title}', '${item.description}', ${item.price})
                returning id
            )

            insert into stocks (id, product_id, count)
            values (default, (select id from last_product_id), ${item.count});

            commit;
        `);
    } catch (error) {
        console.log('Error occurred while saving record', item, error);

        await client.query(`rollback;`);
    }
}

const notifyViaSNS = async (items) => {
    console.log('Start sending email');

    const sns = new SNS({
        region: process.env.REGION,
    });

    for (let item of items) {
        try {
            await sns.publish({
                Subject: 'CSV import finished',
                Message: JSON.stringify(item),
                TopicArn: process.env.CREATE_PRODUCTS_TOPIC,
                MessageAttributes: {
                    count: {
                        DataType: "Number",
                        StringValue: item.count.toString(),
                    }
                }
            }).promise();
        } catch (err) {
            console.log('Sending message failed', item, err);
        }
    }

    console.log('Finish sending email');
}

const catalogBatchProcess = async (event: SQSEvent) => {
    console.log('Received event', event);

    const items = event.Records
        .map((record: SQSRecord) => typeof record.body === 'string' ? JSON.parse(record.body) : record.body)
        .flat();

    const client: Client = createConnection();

    try {
        await client.connect();

        console.log('DB client connected');

        for (let item of items) {
            await saveRecordToDb(client, item);
        }
    } catch (error) {
        console.log('Error occurred', error);
    } finally {
        client.end();

        console.log('DB client closed');
    }

    await notifyViaSNS(items);
}

export const main = middyfy(catalogBatchProcess);