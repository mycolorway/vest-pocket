import { observe, Watcher } from '../reactivity'
import { mergeLifecycleMethod } from './utils'
import { isObject } from '../utils'

export default Behavior({
  lifetimes: {
    created() {
      this._originalSetData = this.setData
      this.setData = this._setData
      this._dataQueue = []
      this._dataCallbackQueue = []
    }
  },

  definitionFilter(defFields) {
    const computed = defFields.computed || {}
    const computedKeys = Object.keys(computed)
    const initialData = defFields.data = defFields.data || {}

    Object.keys(computed).forEach(key => {
      initialData[key] = computed[key].call(defFields)
    })

    defFields.lifetimes = defFields.lifetimes || {}
    defFields.lifetimes.attached = mergeLifecycleMethod(function() {
      observe(this.data)
      this.computed = computedKeys.reduce((result, key) => {
        result[key] = new Watcher(computed[key].bind(this), (value) => {
          this.queueData({ [key]: value }, { allowComputed: true })
        })
        return result
      }, {})
    }, defFields.lifetimes.attached)
    defFields.lifetimes.detached = mergeLifecycleMethod(function() {
      computedKeys.forEach(key => {
        this.computed[key].teardown()
      })
      this.computed = {}
    }, defFields.lifetimes.detached)

    defFields.methods = defFields.methods || {}
    defFields.methods._filterComputedData = function(data) {
      Object.keys(data).forEach(key => {
        if (computed[key]) {
          delete data[key]
        }
      })
      return data
    }
    defFields.methods._setData = function(data, callback, options = {}) {
      if (isObject(callback)) {
        options = callback
        callback = undefined
      }
      if (!options.allowComputed) this._filterComputedData(data)
      this._originalSetData(data, callback)
    }
  },

  methods: {
    queueData(data, callback, options = {}) {
      if (isObject(callback)) {
        options = callback
        callback = undefined
      }
      if (this._dataQueue.length === 0) {
        wx.nextTick(this._flushDataQueue.bind(this))
      }

      if (!options.allowComputed) this._filterComputedData(data)
      this._dataQueue.push(data)
      if (callback) this._dataCallbackQueue.push(callback)
    },

    _flushDataQueue() {
      const data = this._dataQueue.reduce((data, item) => {
        Object.assign(data, item)
        return data
      }, {})
      const callbacks = this._dataCallbackQueue.slice()

      this._dataQueue.length = 0
      this._dataCallbackQueue.length = 0

      this._originalSetData(data, () => {
        callbacks.forEach(callback => {
          callback.call(this)
        })
      })
    }
  }
})
