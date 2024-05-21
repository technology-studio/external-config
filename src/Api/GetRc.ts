/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2023-12-05T08:12:43+01:00
 * @Copyright: Technology Studio
 */

import fs from 'fs'
import path from 'path'
import { Log } from '@txo/log'

import {
  type Config,
} from '../Model/Types'

const log = new Log('txo.external-config.Api.GetRc')

let configFileName = ''
let topDir = '/'

const getHomePath = (): string | undefined => process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']

const parseConfigFile = (file: string): Config | null => {
  try {
    return JSON.parse(file) as Config
  } catch (e) {
    log.error('parseConfigFile', e)
    return null
  }
}

const combineConfigs = (configs: (Config | null)[]): Config => {
  const filteredConfigs = configs.reverse()
    .filter(config => config != null) as Config[]
  return Object.assign({}, ...filteredConfigs) as Config
}

const getConfigInDir = (dir: string): null | Config => {
  let config: null | Config = null

  try {
    const fileName = path.join(dir, configFileName)
    const file = fs.readFileSync(fileName, 'utf8')
    config = parseConfigFile(file)
  } catch (e) {
    // no config present
  }
  return config
}

const walkUpTree = (startDir: string, endDir: string, callback: (path: string) => void): void => {
  let currentDir = startDir

  while (true) {
    callback(currentDir)
    currentDir = path.join(currentDir, '..')
    if (currentDir === endDir) {
      break
    }
  }
}

export const getConfig = (dir: string = process.cwd()): Config => {
  if (configFileName === '') {
    throw new Error('What is your config file name?  Use setConfigName.')
  }

  const configs: (Config | null)[] = []

  walkUpTree(dir, topDir, (currentDir) => {
    configs.push(getConfigInDir(currentDir))
  })
  const homePath = getHomePath()
  if (homePath != null && homePath !== '') {
    configs.push(getConfigInDir(homePath))
  }

  return combineConfigs(configs)
}

export const setConfigName = (name: string): void => {
  configFileName = name
}

export const setTopDir = (dir: string): void => {
  topDir = dir
}
