const LIFECYCLE_METHODS = 'onLoad onReady onShow onHide onUnload onPullDownRefresh onReachBottom onShareAppMessage onPageScroll onTabItemTap'.split(' ')

export function mergeLifecycleMethod(method1, method2) {
  if (!method1) {
    return method2
  } else if (!method2) {
    return method1
  } else {
    return function (...args) {
      method1.apply(this, args)
      method2.apply(this, args)
    }
  }
}

function patchBehavior(config, behavior) {
  config.methods = config.methods || {}
  Object.keys(behavior.methods || {}).forEach(key => {
    if (LIFECYCLE_METHODS.indexOf(key) > -1) {
      config.methods[key] = mergeLifecycleMethod(config.methods[key], behavior.methods[key])
    }
  })
}

export function patchBehaviors(config) {
  config.behaviors = (config.behaviors || []).reduce((result, behavior) => {
    if (typeof behavior === 'object' && behavior._vest) {
      patchBehavior(config, patchBehaviors(behavior.config))
      result.push(behavior.id)
    } else {
      result.push(behavior)
    }
    return result
  }, [])

  return config
}
