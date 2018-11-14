import Store from 'store'
import { Watcher } from 'reactivity'

jest.useFakeTimers()

test('state', () => {
  const store = new Store({
    state: {
      name: 'vest-pocket'
    }
  })

  expect(store.state).toEqual({
    name: 'vest-pocket'
  })
})

test('getters', () => {
  const store = new Store({
    state: {
      firstName: 'vest',
      lastName: 'pocket'
    },
    getters: {
      name(state) {
        return `${state.firstName}-${state.lastName}`
      }
    },
    mutations: {
      updateLastName(state, lastName) {
        state.lastName = lastName
      }
    }
  })

  expect(store.getters.name).toBe('vest-pocket')
  store.commit('updateLastName', 'form')
  expect(store.getters.name).toBe('vest-form')
})

describe('mutations', () => {

  let store = null

  beforeEach(() => {
    store = new Store({
      state: {
        name: 'vest-pocket'
      },
      mutations: {
        updateName(state, name) {
          state.name = name
        }
      }
    })
  })

  afterEach(() => {
    store = null
  })

  test('state can only be updated in mutations', () => {
    expect(store.state.name).toBe('vest-pocket')
    expect(() => {
      store.state.name = 'another-name'
    }).toThrowError('do not mutate store state outside mutation handler')
    store.commit('updateName', 'another-name')
    expect(store.state.name).toBe('another-name')
  })

  test('watch state changes', () => {
    const callback = jest.fn()
    new Watcher(() => store.state.name, callback)
    store.commit('updateName', 'vest-pocket')
    expect(callback).not.toBeCalled()
    store.commit('updateName', 'another-name')
    expect(callback).toBeCalledWith('another-name', 'vest-pocket')
  })
})

test('actions', (done) => {
  const store = new Store({
    state: {
      items: []
    },
    mutations: {
      appendItems(state, items) {
        state.items = state.items.concat(items)
      }
    },
    actions: {
      async loadItems({commit}, length) {
        const items = await requestItems(length)
        commit('appendItems', items)
      }
    }
  })

  const requestItems = jest.fn((length = 3) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Array(length).fill('vest'))
      }, 10000)
    })
  })

  expect(store.state.items).toHaveLength(0)
  store.dispatch('loadItems')
  expect(store.state.items).toHaveLength(0)
  store.dispatch('loadItems')
  store.dispatch('loadItems', 4).then(() => {
    expect(store.state.items).toHaveLength(7)
    expect(requestItems).toBeCalledTimes(2)
    expect(Object.keys(store._pendingActions['loadItems'])).toHaveLength(0)
    done()
  })
  expect(store.state.items).toHaveLength(0)
  jest.runAllTimers()
})

describe('modules', () => {
  let store = null

  beforeEach(() => {
    store = new Store({
      state: {
        name: 'vest'
      },
      mutations: {
        updateName(state, name) {
          state.name = name
        }
      },
      actions: {
        loadName({commit}) {
          return commit('updateName', 'lalala')
        }
      },
      modules: {
        child: {
          state: {
            firstName: 'vest',
            lastName: 'pocket'
          },
          getters: {
            name(state) {
              return `${state.firstName}-${state.lastName}`
            }
          },
          mutations: {
            updateLastName(state, lastName) {
              state.lastName = lastName
            }
          },
          actions: {
            loadLastName({commit}) {
              return commit('updateLastName', 'lalala')
            }
          }
        }
      }
    })
  })

  afterEach(() => {
    store = null
  })

  test('module state', () => {
    expect(store.state).toEqual({
      name: 'vest',
      child: {
        firstName: 'vest',
        lastName: 'pocket'
      }
    })
  })

  test('module getters', () => {
    expect(store.getters['child/name']).toBe('vest-pocket')
    expect(store._modules.child.getters.name).toBe('vest-pocket')
    store.commit('child/updateLastName', 'form')
    expect(store.getters['child/name']).toBe('vest-form')
  })

  test('module mutations', () => {
    store.commit('updateName', 'another-name')
    expect(store.state.name).toBe('another-name')
    store.commit('child/updateLastName', 'another-name')
    expect(store.state.child.lastName).toBe('another-name')
    store._modules.child.commit('updateLastName', 'origin-name')
    expect(store.state.child.lastName).toBe('origin-name')
    expect(() => {
      store._modules.child.state.lastName = 'lalala'
    }).toThrowError('do not mutate store state outside mutation handler')
  })

  test('module actions', () => {
    store.dispatch('loadName')
    expect(store.state.name).toBe('lalala')
    store.dispatch('child/loadLastName')
    expect(store.state.child.lastName).toBe('lalala')
    store._modules.child.commit('updateLastName', 'hahaha')
    expect(store.state.child.lastName).toBe('hahaha')
    store._modules.child.dispatch('loadLastName')
    expect(store.state.child.lastName).toBe('lalala')
  })

  test('dynamic module', () => {
    store.registerModule('anotherChild', {
      state: {
        firstName: 'vest',
        lastName: 'form'
      }
    })
    expect(store.state).toEqual({
      name: 'vest',
      child: {
        firstName: 'vest',
        lastName: 'pocket'
      },
      anotherChild: {
        firstName: 'vest',
        lastName: 'form'
      }
    })
    store.registerModule(['anotherChild', 'anotherGrandChild'], {
      state: {
        firstName: 'vest',
        lastName: 'form-input'
      }
    })
    expect(store.state).toEqual({
      name: 'vest',
      child: {
        firstName: 'vest',
        lastName: 'pocket'
      },
      anotherChild: {
        firstName: 'vest',
        lastName: 'form',
        anotherGrandChild: {
          firstName: 'vest',
          lastName: 'form-input',
        }
      }
    })
  })
})
