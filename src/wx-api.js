// wrap wechat api for async functions
// should use es6 Proxy instead after mp supports Proxy
const systemInfo = wx.getSystemInfoSync()
const isWXWork = systemInfo.environment === 'wxwork'
const clientType = isWXWork ? 'wework' : 'wechat'
const syncApiWhitelist = ['uploadFile', 'downloadFile', 'createSelectorQuery', 'getUpdateManager', 'createAnimation']

const apiOverrides = {
  wework: {
    getFileInfo(obj) {
      if (obj.success) {
        obj.success({digest: null, digestType: 'qiniuhash'})
      }
    },
    getSetting(obj) {
      if (obj.success) {
        obj.success({
          authSetting: {
            'scope.userInfo': true,
            'scope.userLocation': true,
            'scope.address': true,
            'scope.invoiceTitle': true,
            'scope.werun': true,
            'scope.record': true,
            'scope.writePhotosAlbum': true,
            'scope.camera': true
          }
        })
      }
    },
    authorize(obj) {
      if (obj.success) obj.success()
    },
    getUpdateManager() {
      return wx.getUpdateManager ? wx.getUpdateManager() : false
    }
  },
  wechat: {}
}

function apiMethod(name) {
  return apiOverrides[clientType][name] || (isWXWork && wx.qy && wx.qy[name]) || wx[name]
}

class WxCallError extends Error {
  constructor(name, res) {
    super(`wx.${name} 调用失败`)
    this.name = 'WxCallError'
    this.info = res
  }
}

export default function (name, ...args) {
  if (/^on/.test(name) || /Sync$/.test(name) || syncApiWhitelist.indexOf(name) > -1 || (args[0] && typeof args[0] !== 'object')) {
    return apiMethod(name).apply(this, args)
  } else {
    return new Promise((resolve, reject) => {
      const result = apiMethod(name)(Object.assign(args[0] || {}, {
        success(...args) {
          resolve(...args, result)
        },
        fail(res) {
          reject(new WxCallError(name, res))
        }
      }))
    })
  }
}
