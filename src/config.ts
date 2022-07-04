import path from "path";
import dotenv from "dotenv";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, "../config/config.env") });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
  POSTGRES_PW: string | undefined;
  POSTGRES_HOST: string | undefined;
  POSTGRES_PORT: number | undefined;
  POSTGRES_DB: string | undefined;
  POSTGRES_USER: string | undefined;
  DATABASE_URL: string | undefined;
}

interface Config {
  POSTGRES_PW: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  DATABASE_URL: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    POSTGRES_PW: process.env.POSTGRES_PW,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : undefined,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_DB: process.env.POSTGRES_DB,
    DATABASE_URL: process.env.DATABASE_URL,
  };
};

// Throwing an Error if any field was undefined we don't 
// want our app to run if it can't connect to DB and ensure 
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type 
// definition.

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;