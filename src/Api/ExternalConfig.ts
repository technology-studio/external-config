/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2024-04-12T14:23:07+02:00
 * @Copyright: Technology Studio
**/

import type * as yup from 'yup'

import { type Config } from '../Model/Types'

import {
  getConfig,
  setConfigName,
} from './GetRc'

const CONFIG_PATH = '~/.txo/config.json'

setConfigName(CONFIG_PATH)

export const getConfigMap = (configSchema: yup.ObjectSchema<Config>): Config => {
  const configMap = getConfig()
  try {
    return Object.keys(configMap).reduce<Record<string, Config>>((nextConfigMap, profileName) => {
      const config = configSchema.validateSync(configMap[profileName]) as Config
      return { ...nextConfigMap, [profileName]: config }
    }, {})
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`${CONFIG_PATH} is not valid: `, error)

    if (error != null && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
      error.errors?.forEach(error => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    }
    process.exit(-1)
  }
}
