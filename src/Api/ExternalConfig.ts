/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2024-04-12T14:23:07+02:00
 * @Copyright: Technology Studio
**/

import * as yup from 'yup'
import { is } from '@txo/types'

import {
  getConfigMap,
} from './GetRc'

type Config<CONFIG, PROFILE extends string> = {
  [P in PROFILE]: CONFIG
} & {
  getProfileValue: <RETURN>(
    profile: PROFILE,
    getter: (config: CONFIG) => RETURN,
    errorHandler: (profile: PROFILE) => Error,
  ) => RETURN,
}

export const loadConfig = <CONFIG extends Record<string, unknown>, PROFILE extends string>(
  relativePath: string,
  schema: yup.ObjectSchema<CONFIG>,
  topDir = '/',
): Config<CONFIG, PROFILE> => {
  const configMap = getConfigMap<CONFIG>(undefined, topDir, relativePath)

  if (configMap == null) {
    throw new Error('No config found')
  }

  const validatedConfigMap = Object.keys(configMap).reduce<{
    [P in PROFILE]: CONFIG
  } & {
    default?: CONFIG,
  }>((nextConfigMap, profileName) => {
    const config = schema.validateSync(configMap[profileName])
    return { ...nextConfigMap, [profileName]: config }
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter, @typescript-eslint/consistent-type-assertions
  }, {} as {
    [P in PROFILE]: CONFIG
  } & {
    default?: CONFIG,
  })

  return {
    ...validatedConfigMap,
    getProfileValue: (profile, getter, errorHandler) => {
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
    },
  }
}

const cfg = loadConfig<{
  apiUrl: string,
  apiKey: string,
}, 'erik-slovak' | 'default'>(
  '.test',
  yup.object({
    apiUrl: yup.string().url().required(),
    apiKey: yup.string().required(),
  }),
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const a = cfg.getProfileValue('erik-slovak', (config) => config.apiKey, (profile) => new Error(`No api key found for profile ${profile}`))
