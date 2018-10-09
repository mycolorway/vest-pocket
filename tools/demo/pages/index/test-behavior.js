import { wxAPI } from '../../vest-pocket/index'

export default {

  onLoad() {
    console.log('from behavior')
  },

  onPullDownRefresh() {
    wxAPI('stopPullDownRefresh')
    console.log('pulldown')
  }

}
