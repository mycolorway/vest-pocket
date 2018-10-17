import Behavior from '../behavior'

export default Behavior({

  lifetimes: {
    created() {
      this._storeStateChanged = () => this.setData({})
    }
  },

  methods: {
    onLoad() {
      this._toggleStateChangedHandlers(true)
    },

    onUnload() {
      this._toggleStateChangedHandlers(false)
    },

    _toggleStateChangedHandlers(on = true) {
      const action = on ? 'on' : 'off'
      if (this.store) {
        this.store[action]('stateChanged', this._storeStateChanged)

        if (this.watchChildStore) {
          this.watchChildStore.forEach(modulePath => {
            const store = this.store.getModuleByPath(modulePath)
            store[action]('stateChanged', this._storeStateChanged)
          })
        }
      }
    }
  }
})
