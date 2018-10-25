
export function createNamespacedHelpers (namespace) {
  return {
    mapState: mapState.bind(null, namespace),
    mapGetters: mapGetters.bind(null, namespace),
    mapMutations: mapMutations.bind(null, namespace),
    mapActions: mapActions.bind(null, namespace)
  }
}

export const mapState = normalizeNamespace((namespace, states) => {
  return normalizeMap(states).reduce((result, { key, val }) => {
    result[key] = function() {
      const store = namespace ? this.store.getModuleByPath(namespace) : this.store
      return typeof val === 'function'
        ? val.call(this, store.state, store.getters)
        : store.state[val]
    }
    return result
  }, {})
})

export const mapGetters = normalizeNamespace((namespace, getters) => {
  return normalizeMap(getters).reduce((result, { key, val }) => {
    result[key] = function() {
      const store = namespace ? this.store.getModuleByPath(namespace) : this.store
      return store._getters[val].getter()
    }
    return result
  }, {})
})

export const mapMutations = normalizeNamespace((namespace, mutations) => {
  return normalizeMap(mutations).reduce((result, { key, val }) => {
    result[key] = function(...args) {
      const store = namespace ? this.store.getModuleByPath(namespace) : this.store
      return typeof val === 'function'
        ? val.apply(this, [store.commit].concat(args))
        : store.commit(val, ...args)
    }
    return result
  }, {})
})

export const mapActions = normalizeNamespace((namespace, actions) => {
  return normalizeMap(actions).reduce((result, { key, val }) => {
    result[key] = function(...args) {
      const store = namespace ? this.store.getModuleByPath(namespace) : this.store
      return typeof val === 'function'
        ? val.apply(this, [store.dispatch].concat(args))
        : store.dispatch(val, ...args)
    }
    return result
  }, {})
})

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}
