import { cleanEnv, port, str } from 'envalid'

// eslint-disable-next-line no-process-env
const ENVS = process.env

export const validateEnv = () => {
  cleanEnv(ENVS, {
    NODE_ENV: str(),
    PORT: port(),
    DATABASE_URL: str(),
    CLIENT_ID: str(),
    CLIENT_SECRET: str(),
    SIGNING_SECRET: str(),
    SESSION_SECRET: str(), 
    SLACK_CLIENT_SECRET: str(), 
    SLACK_CLIENT_ID: str(),
    JWT_SECRET: str(),     
  })
}
