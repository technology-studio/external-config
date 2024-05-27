/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2023-12-05T08:12:43+01:00
 * @Copyright: Technology Studio
 */

import fs from 'fs'
import path from 'path'
import { Log } from '@txo/log'

const log = new Log('txo.external-config.Api.GetRc')

let configFileName = ''
let topDir = '/'

const getHomePath = (): string | undefined => process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']

const parseConfigFile = (file: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(file) as Record<string, unknown>
  } catch (e) {
    log.error('parseConfigFile', e)
    return null
  }
}

const getConfigInDir = (dir: string): Record<string, unknown> | null => {
  let config: Record<string, unknown> | null = null

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

export const getConfigMap = (dir: string = process.cwd()): Record<string, unknown> | null => {
  if (configFileName === '') {
    throw new Error('What is your config file name?  Use setConfigName.')
  }

  walkUpTree(dir, topDir, (currentDir) => {
    const _config = getConfigInDir(currentDir)
    if (_config != null) {
      return _config
    }
  })
  const homePath = getHomePath()
  if (homePath != null && homePath !== '') {
    const _config = getConfigInDir(homePath)
    if (_config != null) {
      return _config
    }
  }

  return null
}

export const setConfigName = (name: string): void => {
  configFileName = name
}

export const setTopDir = (dir: string): void => {
  topDir = dir
}
