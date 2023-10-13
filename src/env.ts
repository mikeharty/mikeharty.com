import dotenv from 'dotenv';
dotenv.config();

const penv = process.env;
const ENV: { [key: string]: any } = {};

ENV.NODE_ENV = penv.NODE_ENV || 'development';
ENV.HOST = penv.HOST || 'localhost';
ENV.PORT = penv.PORT ? parseInt(penv.PORT) : 7331;
ENV.LOG_FILE = penv.LOG_FILE || false;
ENV.LOG_LEVEL = penv.LOG_LEVEL || 'info';
ENV.OWNER = penv.OWNER || 'mikeharty';

export default ENV;
