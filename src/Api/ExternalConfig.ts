/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2024-04-12T14:23:07+02:00
 * @Copyright: Technology Studio
**/

import type * as yup from 'yup'
import { realpathSync } from 'fs'
import untildify from 'untildify'
import update from 'immutability-helper'

import { type ConfigShape } from '../Model/Types'

import {
  getConfig,
  setConfigName,
} from './GetRc'

const CONFIG_PATH = '~/.txo/config.json'

setConfigName(CONFIG_PATH)

export const getConfigMap = (configSchema: yup.ObjectSchema<ConfigShape>): ConfigShape => {
  const configMap = getConfig()
  try {
    return Object.keys(configMap).reduce<Record<string, ConfigShape>>((nextConfigMap, profileName) => {
      const config = configSchema.validateSync(configMap[profileName]) as ConfigShape
      nextConfigMap[profileName] = config.google != null
        ? update(config, {
          google: {
            serviceAccount: {
              keyFilePath: {
                $set: realpathSync(untildify(config.google.serviceAccount.keyFilePath)),
              },
            },
          },
        })
        : config
      return nextConfigMap
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
