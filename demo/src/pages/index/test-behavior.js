import { wx, Behavior } from '@mycolorway/vest-pocket'


export default Behavior({

  methods: {
    onLoad() {
      console.log('from behavior')
    },

    onPullDownRefresh() {
      wx.stopPullDownRefresh()
      console.log('pulldown')
    }
  }

})
