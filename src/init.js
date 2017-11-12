// @flow
import validate from './utils/validate'
import isObject from './utils/isObject'
import mergeConfig from './utils/mergeConfig'
import getExposed from './utils/getExposed'
import buildPlugins from './utils/buildPlugins'
import getModels from './utils/getModels'
import { preStore, postStore } from './core'
import corePlugins from './plugins'
import { initModelHooks } from './model'
import { initStore } from './redux/store'
import { initReducers } from './redux/reducers'

const validateConfig = (config: $config) =>
  validate([
    [
      !!config.plugins && !Array.isArray(config.plugins),
      'init config.plugins must be an array',
    ],
    [
      !!config.models && isObject(config.models),
      'init config.models must be an object'
    ],
    [
      !!config.middleware && !Array.isArray(config.middleware),
      'init config.middleware must be an array',
    ],
    [
      !!config.extraReducers && isObject(config.extraReducers),
      'init config.extraReducers must be an object',
    ],
    [
      (!!config.overwrites && !!config.overwrites.combineReducers) && typeof config.overwrites.combineReducers !== 'function',
      'init config.overwrites.combineReducers must be a function'
    ],
    [
      (!!config.overwrites && !!config.overwrites.createStore) && typeof config.overwrites.createStore !== 'function',
      'init config.overwrites.createStore must be a function'
    ],
  ])

const init = (initConfig: $config = {}): void => {
  validateConfig(initConfig)
  const config = mergeConfig(initConfig)
  const pluginConfigs = corePlugins.concat(config.plugins || [])
  const exposed = getExposed(pluginConfigs)
  const plugins = buildPlugins(pluginConfigs, exposed)

  // preStore: middleware, model hooks
  preStore(plugins)

  // collect all models
  const models = getModels(config, plugins)
  initModelHooks(models)
  initReducers(models, config)

  // create a redux store with initialState
  // merge in additional extra reducers
  initStore(config)

  postStore(plugins)
}

export default init
