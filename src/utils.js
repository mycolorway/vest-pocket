
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function getPropertyByPath(obj, path, { innerProperty } = {}) {
  if (typeof path === 'string') {
    path = path.split('/')
  }

  return path.reduce((property, name) => {
    if (name) {
      return (innerProperty ? getPropertyByPath(property, innerProperty) : property)[name]
    } else {
      return property
    }
  }, obj)
}

export function setPropertyByPath(obj, path, value) {
  if (typeof path === 'string') {
    path = path.split('/')
  }

  return path.reduce((property, name, index) => {
    if (!name) return property
    if (index === path.length - 1) {
      property[name] = value
    } else if (!property[name]) {
      property[name] = {}
    }
    return property[name]
  }, obj)
}

export function uniqueId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function removeFromArray(array, item) {
  const index = array.indexOf(item)
  if (index > -1) {
    array.splice(index, 1)
  }
}

export function isObject(object) {
  return object !== null && typeof object === 'object'
}

export function isPlainObject(object) {
  return object.toString() === '[object Object]'
}
