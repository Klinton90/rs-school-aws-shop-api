import { ClientConfig } from 'pg';
const Client = require('pg/lib/client.js');

export const createConnection = () => {
    const dbOptions: ClientConfig = {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT as any,
        database: process.env.PG_DATABASE,
        user: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
        ssl: {
            rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 5000
    }

    return new Client(dbOptions);
}