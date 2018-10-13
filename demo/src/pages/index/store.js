import Store from '@mycolorway/vest-pocket/store'

export default new Store({

  state: {
    name: ''
  },

  mutations: {
    updateName(state, name) {
      return Object.assign({}, state, {name})
    }
  },

  actions: {
    loadName({ commit, state }) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('updateName', 'vest-pocket')
          resolve(state)
        }, 500)
      })
    }
  }

})
