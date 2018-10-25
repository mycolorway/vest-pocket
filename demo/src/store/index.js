import Store from '@mycolorway/vest-pocket/store'

export default new Store({
  state: {
    name: ''
  },

  mutations: {
    updateName(state, name) {
      state.name = name
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
  },

  modules: {
    child: {
      state: {
        firstName: 'vest',
        lastName: ''
      },
      getters: {
        name(state) {
          return `${state.firstName}-${state.lastName}`
        }
      },
      mutations: {
        updateLastName(state, lastName) {
          state.lastName = lastName
        }
      },
      actions: {
        loadLastName({ commit, state }) {
          return new Promise((resolve) => {
            setTimeout(() => {
              commit('updateLastName', 'pocket')
              resolve(state)
            }, 500)
          })
        }
      }
    }
  }
})
