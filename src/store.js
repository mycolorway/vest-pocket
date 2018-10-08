import EventEmitter from 'eventemitter3'
import {clone} from './utils'

export default class Store extends EventEmitter {
  constructor({
    state = {}, getters = {}, mutations = {}, actions = {}
  }) {
    super()
    this._state = state
    this._initGetters(getters)
    this._initMutations(mutations)
    this._initActions(actions)
  }

  get state() {
    return clone(this._state)
  }

  _initGetters(getters) {
    this.getters = {}

    Object.keys(getters).forEach((name) => {
      Object.defineProperty(this.getters, name, {
        configurable: true,
        get: () => getters[name].call(this, this.state, this.getters)
      })
    })
  }

  _initMutations(mutations) {
    this._mutations = Object.assign({}, mutations)
  }

  _initActions(actions) {
    this._actions = Object.assign({}, actions)
    this._pendingActions = {}
  }

  _isActionPending(name, key) {
    if (this._pendingActions[name] && this._pendingActions[name][key]) {
      return this._pendingActions[name][key]
    } else {
      return false
    }
  }

  _startAction(name, ...args) {
    const argsKey = JSON.stringify(args)
    const pending = this._isActionPending(name, argsKey)
    if (pending) return pending

    const promise = this._actions[name].call(this, {
      state: this.state,
      commit: this.commit.bind(this),
      dispatch: this.dispatch.bind(this),
      getters: this.getters
    }, ...args).then((value) => {
      delete this._pendingActions[name][argsKey]
      return value
    }).catch((reason) => {
      delete this._pendingActions[name][argsKey]
      return reason
    })

    this._pendingActions[name] = this._pendingActions[name] || {}
    this._pendingActions[name][argsKey] = promise

    return promise
  }

  commit(name, ...args) {
    if (!this._mutations[name]) {
      throw new Error(`mutation ${name} is undefined`)
    }
    const oldState = JSON.stringify(this._state)
    const result = this._mutations[name].call(this, this._state, ...args)
    if (oldState !== JSON.stringify(this._state)) {
      this.emit('stateChanged', this.state)
    }
    return result
  }

  dispatch(name, ...args) {
    if (!this._actions[name]) {
      throw new Error(`action ${name} is undefined`)
    }

    return this._startAction(name, ...args)
  }
}
