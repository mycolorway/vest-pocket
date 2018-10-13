import { wx } from '@mycolorway/vest-pocket'

export default {

  onLoad() {
    console.log('from behavior')
  },

  onPullDownRefresh() {
    wx.stopPullDownRefresh()
    console.log('pulldown')
  }

}
