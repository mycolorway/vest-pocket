import { wx } from '../../vest-pocket/index'

export default {

  onLoad() {
    console.log('from behavior')
  },

  onPullDownRefresh() {
    wx.stopPullDownRefresh()
    console.log('pulldown')
  }

}
