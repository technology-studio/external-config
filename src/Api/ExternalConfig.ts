/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2024-04-12T14:23:07+02:00
 * @Copyright: Technology Studio
**/

import type * as yup from 'yup'

import {
  getConfigMap,
} from './GetRc'

export const getConfig = (configSchema: yup.ObjectSchema<Record<string, unknown>>, profile = 'default'): unknown => {
  const configMap = getConfigMap()
  try {
    if (configMap == null) {
      throw new Error('No config found')
    }
    const validatedConfigMap = Object.keys(configMap).reduce<Record<string, unknown>>((nextConfigMap, profileName) => {
      const config = configSchema.validateSync(configMap[profileName])
      return { ...nextConfigMap, [profileName]: config }
    }, {})
    return validatedConfigMap[profile]
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(-1)
  }
}
