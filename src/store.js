import EventEmitter from 'eventemitter3'
import {clone, getPropertyByPath, setPropertyByPath} from './utils'

export default class Store extends EventEmitter {
  constructor({
    state = {}, getters = {}, mutations = {}, actions = {}, modules = {},
    namespace = 'root', parentStore = null, rootStore = null
  }) {
    super()
    this.namespace = namespace
    this.rootStore = rootStore || this
    this.parentStore = parentStore
    this.modulePath = parentStore ? parentStore.modulePath.concat(this.namespace) : []
    this._initState(state)
    this._initGetters(getters)
    this._initMutations(mutations)
    this._initActions(actions)
    this._initModules(modules)
  }

  get state() {
    return clone(this._state)
  }

  _initState(state) {
    if (this.modulePath.length > 0) {
      Object.defineProperty(this, '_state', {
        configurable: true,
        get: () => getPropertyByPath(this.rootStore._state, this.modulePath),
        set: (state) => {
          setPropertyByPath(this.rootStore._state, this.modulePath, state)
        }
      })
    }
    this._state = state
  }

  _initGetters(getters) {
    this._getters = Object.assign({}, getters)
    this.getters = (getterName) => {
      const {store, name} = this._resolvePath(getterName)
      return store._getters[name].call(
        store, store.state, store.getters,
        this.rootStore.state, this.rootStore.getters
      )
    }
  }

  _initMutations(mutations) {
    this._mutations = Object.assign({}, mutations)
  }

  _initActions(actions) {
    this._actions = Object.assign({}, actions)
    this._pendingActions = {}
  }

  _initModules(modules) {
    this.modules = {}
    Object.keys(modules).forEach(namespace => {
      this[namespace] = new Store(Object.assign({}, modules[namespace], {
        namespace,
        parentStore: this,
        rootStore: this.rootStore
      }))
    })
  }

  _resolvePath(path) {
    const names = path.split('/')
    return names.length > 1 ? {
      name: names.pop(),
      store: getPropertyByPath(this, names)
    } : {
      name: path,
      store: this
    }
  }

  _isActionPending(name, key) {
    if (this._pendingActions[name] && this._pendingActions[name][key]) {
      return this._pendingActions[name][key]
    } else {
      return false
    }
  }

  commit(mutationName, ...args) {
    const {store, name} = this._resolvePath(mutationName)
    if (!store._mutations[name]) {
      throw new Error(`mutation ${name} is undefined`)
    }
    const oldState = JSON.stringify(store._state)
    store._state = store._mutations[name].call(store, store.state, ...args)
    const newState = store.state
    if (oldState !== JSON.stringify(newState)) {
      this.emit('stateChanged', newState)
    }
    return newState
  }

  dispatch(actionName, ...args) {
    const {store, name} = this._resolvePath(actionName)
    if (!store._actions[name]) {
      throw new Error(`action ${actionName} is undefined`)
    }

    const argsKey = JSON.stringify(args)
    const pending = store._isActionPending(name, argsKey)
    if (pending) return pending

    const promise = store._actions[name].call(store, {
      state: store.state,
      commit: store.commit.bind(store),
      dispatch: store.dispatch.bind(store),
      getters: store.getters,
      rootState: this.rootStore.state,
      rootGetters: this.rootStore.getters
    }, ...args)

    if (promise instanceof Promise) {
      promise.then((value) => {
        delete store._pendingActions[name][argsKey]
        return value
      }).catch((reason) => {
        delete store._pendingActions[name][argsKey]
        return reason
      })
      store._pendingActions[name] = store._pendingActions[name] || {}
      store._pendingActions[name][argsKey] = promise
    }

    return promise
  }
}
