import { patchBehaviors, mergeLifecycleMethod } from './behaviors/utils'
import storeBehavior from './behaviors/store'
import computedBehavior from 'miniprogram-computed'

export default function (config) {
  config.behaviors = [storeBehavior, computedBehavior].concat(config.behaviors || [])

  const initStore = function() {
    this.store = config.store
    this.watchChildStore = config.watchChildStore
  }

  if (config.lifetimes && config.lifetimes.created) {
    config.lifetimes.created = mergeLifecycleMethod(initStore, config.lifetimes.created)
  } else if (config.created) {
    config.created = mergeLifecycleMethod(initStore, config.created)
  } else {
    config.lifetimes = config.lifetimes || {}
    config.lifetimes.created = initStore
  }

  Component(patchBehaviors(config))
}
