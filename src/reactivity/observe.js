import { isObject, isPlainObject } from '../utils'
import Dependency from './dependency'

export class Observer {

  constructor(object) {
    this.value = object
    this.dependency = new Dependency()

    Object.defineProperty(object, '__observer__', {
      value: this,
      enumerable: false,
      writable: true,
      configurable: true
    })

    this.walk(object)
  }

  walk(object) {
    Object.keys(object).forEach(key => {
      defineReactive(object, key, object[key])
    })
  }

}

export function observe(object) {
  if (!isObject(object)) return

  if (object.hasOwnProperty('__observer__') && object.__observer__ instanceof Observer) {
    return object.__observer__
  } else if (isPlainObject(object) && Object.isExtensible(object)) {
    return new Observer(object)
  } else {
    return null
  }
}

export function defineReactive(object, key, value, { shallow = false } = {}) {
  const property = Object.getOwnPropertyDescriptor(object, key)
  if (property && property.configurable === false) return

  const dependency = new Dependency()
  const getter = property && property.get
  const setter = property && property.set
  let childObject = !shallow && observe(value)

  Object.defineProperty(object, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dependency.target) {
        dependency.depend()
        if (childObject) childObject.dependency.depend()
      }
      return getter ? getter.call(object) : value
    },
    set(newValue) {
      const oldValue = getter ? getter.call(object) : value
      /* eslint-disable no-self-compare */
      if (newValue === oldValue || (newValue !== newValue && oldValue !== oldValue)) {
        return
      }

      if (setter) {
        setter.call(object, newValue)
      } else {
        value = newValue
      }
      childObject = !shallow && observe(newValue)
      dependency.notify()
    }
  })
}

export function setProperty(object, key, value) {
  const observer = object.__observer__
  if (!observer || object.hasOwnProperty(key)) {
    object[key] = value
    return value
  }

  defineReactive(observer.value, key, value)
  observer.dependency.notify()
  return value
}

export function deleteProperty(object, key) {
  if (object.hasOwnProperty(key)) {
    delete object[key]
  }

  if (object.__observer__) {
    object.__observer__.dependency.notify()
  }
}
