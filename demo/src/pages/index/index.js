import testBehavior from './test-behavior'
import store from './store'
import { Component } from '@mycolorway/vest-pocket'
import { mapActions, mapMutations, mapGetters, mapState } from '@mycolorway/vest-pocket/store'

Component({

  store,

  watchChildStore: ['child'],

  behaviors: [testBehavior],

  computed: {
    ...mapState(['name']),

    ...mapGetters('child', {
      childName: 'name'
    })
  },

  methods: {
    ...mapMutations(['updateName']),

    ...mapMutations('child', ['updateLastName']),

    ...mapActions(['loadName']),

    ...mapActions('child', {
      loadChildLastName: 'loadLastName'
    }),

    onLoad() {
      console.log('from page')
      this.updateName('lalala')
      this.loadChildLastName()
    }
  }

})
