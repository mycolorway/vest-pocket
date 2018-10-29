import { wx, Behavior } from '@mycolorway/vest-pocket'

export default Behavior({

  computed: {
    test() {
      return 'test'
    }
  },

  lifetimes: {
    attached() {
      console.log('from behavior')
    }
  },

  methods: {
    onPullDownRefresh() {
      wx.stopPullDownRefresh()
      console.log('pulldown')
    }
  }

})
