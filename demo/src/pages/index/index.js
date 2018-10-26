import testBehavior from './test-behavior'
import { Component } from '@mycolorway/vest-pocket'
import { mapActions, mapMutations, mapGetters, mapState } from '@mycolorway/vest-pocket/store'

Component({

  behaviors: [testBehavior],

  data: {
    age: 10
  },

  computed: {
    ...mapState(['name']),

    ...mapGetters('child', {
      childName: 'name'
    }),

    info() {
      return `name: ${this.data.name}; childName: ${this.data.childName}; Age: ${this.data.age}`
    }
  },

  lifetimes: {
    attached() {
      console.log('from page')
      this.updateName('lalala')
      this.updateLastName('hahaha')
      this.loadChildLastName()

      setTimeout(() => {
        this.setData({ age: 20 })
      }, 1000)
    }
  },

  methods: {
    ...mapMutations(['updateName']),

    ...mapMutations('child', ['updateLastName']),

    ...mapActions(['loadName']),

    ...mapActions('child', {
      loadChildLastName: 'loadLastName'
    })
  }

})
