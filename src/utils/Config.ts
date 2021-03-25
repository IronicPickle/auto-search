import fs from "fs";
import path from "path";
import { logger } from "../app";
import { Validator, Schema } from "jsonschema";

interface ConfigSchema {
  url: string | null,
  devUrl: string | null,
  port: number,
  proxy: boolean
}

const defaultConfig: ConfigSchema = {
  url: null,
  devUrl: null,
  port: 8080,
  proxy: false
}

export let config: ConfigSchema = JSON.parse(JSON.stringify(defaultConfig));

const configSchema: Schema = {
  type: "object",
  properties: {
    url: { type: [ "string", "null" ] },
    devUrl: { type: [ "string", "null" ] },
    port: { type: "number" },
    proxy: { type: "boolean" }
  }
}

const validator = new Validator();

export default class BackendConfig {
  private static path = "./config/config.json";

  public static load() {

    return new Promise<void>((resolve, reject) => {
      fs.readFile(this.path, { encoding: "utf-8" }, (err: NodeJS.ErrnoException | null, data: string) => {
        if(err) {
          this.generate();
          return resolve();
        }

        try {
          const parsedData = JSON.parse(data);
          const validation = validator.validate(parsedData, configSchema);
          if(!validation.valid) return reject(`[Backend Config] backend.json does not match schema:\n  ${validation.errors.join("\n  ")}`);
          
          config = parsedData;
          logger.info("[Backend Config] Loaded backend.json file");
          resolve();
        } catch(err) {
          reject(`[Backend Config] ${err}`);
        }
        
      });
    });

  }

  private static generate() {

    if(!fs.existsSync(path.dirname(this.path))) fs.mkdirSync(path.dirname(this.path));

    fs.writeFileSync(this.path, JSON.stringify(defaultConfig, null, 2));
    logger.info("[Backend Config] Generated default backend.json file");

  }

}