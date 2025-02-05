/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2024-04-12T14:23:07+02:00
 * @Copyright: Technology Studio
**/

import type * as yup from 'yup'

import type {
  ProfileConfig,
  ConfigMap,
} from '../Model/Types'

import {
  getConfigMap,
} from './GetRc'

type Config = {
  getProfileValue: (
    profile: keyof ConfigMap,
    getter: (config: ProfileConfig) => unknown,
    errorHandler: (profile: keyof ConfigMap) => Error,
  ) => unknown,
} & ConfigMap

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- NOTE: this is a workaround for typescript error
function toConfigMap<T extends {}>(obj: T): T & ConfigMap {
  return obj
}

export const loadConfig = (
  relativePath: string,
  schema: yup.ObjectSchema<ProfileConfig>,
  topDir = '/',
  startDir: string | undefined = undefined,
): Config => {
  const configMap = getConfigMap(startDir, topDir, relativePath)

  if (configMap == null) {
    throw new Error('No config found')
  }

  const validatedConfigMap = Object.keys(configMap).reduce<ConfigMap>((nextConfigMap, profileName) => {
    const config = schema.validateSync(configMap[profileName])
    return { ...nextConfigMap, [profileName]: config }
  }, {})

  const getProfileValue = (profile: keyof ConfigMap, getter: (config: ProfileConfig) => unknown, errorHandler: (profile: keyof ConfigMap) => Error): unknown => {
    const { [profile]: config } = validatedConfigMap
    const value = getter(config)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TODO: figure out whether config really can be null since we validate it with schema
    if (config == null || value == null) {
      const { default: defaultConfig } = validatedConfigMap
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TODO: figure out whether config really can be null since we validate it with schema
      if (defaultConfig == null) {
        throw errorHandler(profile)
      }
      const defaultValue = getter(defaultConfig)
      return defaultValue
    }
    return value
  }

  return toConfigMap({
    ...validatedConfigMap,
    getProfileValue,
  })
}
