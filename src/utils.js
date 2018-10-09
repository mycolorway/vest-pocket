
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function getPropertyByPath(obj, path) {
  if (typeof path === 'string') {
    path = path.split('/')
  }

  return path.reduce((property, name) => property[name], obj)
}

export function setPropertyByPath(obj, path, value) {
  if (typeof path === 'string') {
    path = path.split('/')
  }

  return path.reduce((property, name, index) => {
    if (index === path.length - 1) {
      property[name] = value
    } else if (!property[name]) {
      property[name] = {}
    }
    return property[name]
  }, obj)
}
