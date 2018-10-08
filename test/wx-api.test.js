import './utils'
import wxAPI from '../src/wx-api'

test('sync api', () => {
  const systemInfo = wxAPI('getSystemInfoSync')
  expect(systemInfo).toHaveProperty('platform')
})

test('async api', async () => {
  try {
    const systemInfo = await wxAPI('getSystemInfo')
    expect(systemInfo).toHaveProperty('platform')
  } catch (e) {
    expect(e).toHaveProperty('info')
  }
})
