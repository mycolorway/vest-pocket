import testBehavior from './test-behavior'
import testStore from './store'
import { Page } from '@mycolorway/vest-pocket'

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
