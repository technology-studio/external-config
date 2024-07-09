/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2024-04-12T14:23:07+02:00
 * @Copyright: Technology Studio
**/

import type * as yup from 'yup'
import { is } from '@txo/types'

import {
  type ProfileConfig,
  type ConfigMap,
} from '../Model/Types'

import {
  getConfigMap,
} from './GetRc'

type Config = {
  configMap: ConfigMap,
  getProfileValue: (
    profile: keyof ConfigMap,
    getter: (config: ProfileConfig) => unknown,
    errorHandler: (profile: keyof ConfigMap) => Error,
  ) => unknown,
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
    const config = validatedConfigMap[profile]
    const value = getter(config)
    if (config == null || value == null) {
      const defaultConfig = is(validatedConfigMap.default)
      if (defaultConfig == null) {
        throw errorHandler(profile)
      }
      const defaultValue = getter(defaultConfig)
      return defaultValue
    }
    return value
  }

  return {
    configMap: validatedConfigMap,
    getProfileValue,
  }
}
