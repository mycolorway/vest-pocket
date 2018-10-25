import { observe, Watcher } from '../reactivity'
import { mergeLifecycleMethod } from './utils'

export default Behavior({
  lifetimes: {
    created() {
      this._originalSetData = this.setData
      this.setData = this._setData
    }
  },
  definitionFilter(defFields) {
    const computed = defFields.computed || {}
    const computedKeys = Object.keys(computed)
    const data = defFields.data = defFields.data || {}

    Object.keys(computed).forEach(key => {
      data[key] = computed[key].call(defFields)
    })

    defFields.lifetimes = defFields.lifetimes || {}
    defFields.lifetimes.attached = mergeLifecycleMethod(function() {
      observe(this.data)
      this.computed = computedKeys.reduce((result, key) => {
        result[key] = new Watcher(computed[key].bind(this), (value) => {
          this._originalSetData({ [key]: value })
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
    defFields.methods._setData = function(data, callback) {
      // filter computed keys
      Object.keys(data).forEach(key => {
        if (computed[key]) {
          delete data[key]
        }
      })

      this._originalSetData(data, callback)
    }
  }
})
