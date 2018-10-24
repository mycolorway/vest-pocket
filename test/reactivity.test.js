import { observe, Watcher } from 'reactivity'

describe('watcher', () => {
  let project = null
  let projectName = null
  let callback = null

  beforeEach(() => {
    project = {
      name: {
        firstName: 'vest',
        lastName: 'pocket'
      },
      age: 1
    }
    projectName = (function() {
      return `${this.name.firstName}-${this.name.lastName}`
    }).bind(project)
    callback = jest.fn()
    observe(project)
  })

  test('normal watcher', () => {
    const watcher = new Watcher(projectName, callback)

    expect(callback).not.toBeCalled()
    expect(watcher.value).toBe('vest-pocket')
    project.age = 2
    expect(callback).not.toBeCalled()
    expect(watcher.value).toBe('vest-pocket')
    project.name.lastName = 'form'
    expect(callback).toBeCalledWith('vest-form', 'vest-pocket')
    expect(watcher.value).toBe('vest-form')
  })

  test('lazy watcher', () => {
    const watcher = new Watcher(projectName, callback, { lazy: true })

    expect(watcher.value).toBeUndefined()
    expect(watcher.dirty).toBe(true)
    watcher.evaluate()
    expect(watcher.value).toBe('vest-pocket')
    expect(watcher.dirty).toBe(false)
    project.name.lastName = 'form'
    expect(watcher.value).toBe('vest-pocket')
    expect(watcher.dirty).toBe(true)
    watcher.evaluate()
    expect(watcher.value).toBe('vest-form')
    expect(watcher.dirty).toBe(false)
  })

  test('teardown', () => {
    const watcher = new Watcher(projectName, callback)
    watcher.teardown()
    project.name.lastName = 'pocket'
    expect(callback).not.toBeCalled()
  })
})
