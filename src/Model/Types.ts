/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2024-04-12T15:29:16+02:00
 * @Copyright: Technology Studio
**/

export type GoogleConfig = {
  google?: {
    serviceAccount: {
      keyFilePath: string,
    },
  },
}

export interface Config {
  [key: string]: Config | string,
}

export type ConfigShape = Config & GoogleConfig
