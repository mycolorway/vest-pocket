import testBehavior from './test-behavior'
import testStore from './store'
import { Page } from '../../vest-pocket/index'

Page({

  behaviors: [testBehavior],

  data: {
    name: ''
  },

  onLoad() {
    console.log('from page')
    testStore.on('stateChanged', (state) => {
      this.setData(state)
    }).dispatch('loadName')
  }

})
