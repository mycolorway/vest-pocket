import { uniqueId, isObject } from '../utils'
import { pushTarget, popTarget } from './dependency'

export default class Watcher {

  constructor(getter, callback, { lazy = false } = {}) {
    this.callback = callback
    this.id = uniqueId()
    this.active = true
    this.lazy = lazy
    this.dirty = this.lazy
    this.dependencies = []
    this.newDependencies = []
    this.dependencyIds = new Set()
    this.newDependencyIds = new Set()
    this.getter = getter

    this.value = this.lazy ? undefined : this.get()
  }

  get() {
    pushTarget(this)
    const value = this.getter()
    popTarget()
    this.cleanupDependencies()
    return value
  }

  addDependency(dependency) {
    const id = dependency.id
    if (!this.newDependencyIds.has(id)) {
      this.newDependencyIds.add(id)
      this.newDependencies.push(dependency)
      if (!this.dependencyIds.has(id)) {
        dependency.addSubscriber(this)
      }
    }
  }

  cleanupDependencies() {
    this.dependencies.forEach(dependency => {
      if (!this.newDependencyIds.has(dependency.id)) {
        dependency.removeSubscriber(this)
      }
    })

    let tmp = this.dependencyIds
    this.dependencyIds = this.newDependencyIds
    this.newDependencyIds = tmp
    this.newDependencyIds.clear()
    tmp = this.dependencies
    this.dependencies = this.newDependencies
    this.newDependencies = tmp
    this.newDependencies.length = 0
  }

  update() {
    if (this.lazy) {
      this.dirty = true
    } else {
      this.run()
    }
  }

  run() {
    if (!this.active) return

    const value = this.get()
    if (value !== this.value || isObject(value)) {
      const oldValue = this.value
      this.value = value
      this.callback(value, oldValue)
    }
  }

  evaluate() {
    this.value = this.get()
    this.dirty = false
  }

  teardown() {
    if (!this.active) return
    this.dependencies.forEach(dependency => {
      dependency.removeSubscriber(this)
    })
    this.active = false
  }

}
