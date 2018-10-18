# vest-pocket

vest-pocket 是对小程序官方框架的补充，提供了官方框架缺少的一些实用 module 和组件。

## 微信接口封装

wx-api module 对微信小程序的接口做了封装，让异步接口返回 Promise，配合 [vest](https://github.com/mycolorway/vest) 的 async/await 的语法支持，可以大大简化调用 API 的代码，例如：

```js
import { wx } from '@mycolorway/vest-pocket'

Page({
  async onLoad() {
    this.setData(await wx.request({
      url: 'xxx'
    }))
  }
})
```

## 自定义组件增强

使用小程序自定义组件的 [Component 构造器构造页面](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html#%E4%BD%BF%E7%94%A8-component-%E6%9E%84%E9%80%A0%E5%99%A8%E6%9E%84%E9%80%A0%E9%A1%B5%E9%9D%A2)有很多好处，最大的好处是可以在开发页面的时候使用 [Behaviors](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/behaviors.html) 和 [definitionFilter](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/extend.html)。

但是使用 Component 构造器构造页面的时候也有一个缺陷，页面和 Behaviors 里面定义的页面的生命周期函数（例如 onLoad 和 onUnload）会相互覆盖，而不是像组件生命周期函数那样依次调用。为了解决这个问题，我们对官方 Component/Behavior 构造器做了一些封装，让页面的生命周期函数在使用 Behavior 的时候也能被依次调用，例如：

```js
import { Component, Behavior } from '@mycolorway/vest-pocket'

const testBehavior = Behavior({
  methods: {
    onLoad() {
      console.log('from behavior')
    }
  }
})

Component({
  behaviors: [testBehavior],

  methods: {
    onLoad() {
      console.log('from page')
    }
  }
})
```

上面的代码在控制台里的输出依次是：

```
from page
from behavior
```

另外封装之后的 Component 构造器还会自动给自定义组件添加两个默认的 Behavior：

* [computedBehavior](https://github.com/wechat-miniprogram/computed)：让自定义组件支持类似 Vue 的 computed 属性。
* [storeBehavior](https://github.com/mycolorway/vest-pocket/tree/master/src/behaviors/store.js)：让自定义组件可以支持 Store 相关 helper 方法，下一节会详细说明。

## Store

在一些业务比较复杂的 Web 项目里，我们通常会借助 [Vuex](https://vuex.vuejs.org/) 或者 [Redux](https://redux.js.org/) 来实现应用的状态管理。vest-pocket 的 Store 填补了小程序在这方面的空白。

vest-pocket Store 的设计借鉴了 [Vuex](https://vuex.vuejs.org/)，大部分接口都跟 Vuex.Store 保持一致：

```js
// store/index.js
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
    async loadName({commit}) {
      return commit('updateName', await requestName())
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
          return Object.assign({}, state, {lastName})
        }
      },
      actions: {
        async loadLastName({commit}) {
          return commit('updateLastName', await requestLastName())
        }
      }
    }
  }
})
```

跟 Vuex 主要的区别有：

* store.state 是只读的，只能在 mutation 里面修改，修改的方式是返回一个新的 state
* state 发生变化的时候会在对应的 store 或者 module 上触发 `stateChanged` 事件:

```js
store.on('stateChanged', (newState) => {
  console.log(newState)
})
```

### Map Helpers

为了方便页面开发，跟 Vuex 一样，vest-pocket 也提供了类似的 helper 方法，可以把 store 的 state properties、getters、mutations 和 actions 映射到自定义组件里。这个特性需要配合 Component 构造器构造页面 和 Component/Bahavior 的封装来使用：

```js
// pages/index/index.js
import store from './store'
import { Component } from '@mycolorway/vest-pocket'
import { mapActions, mapMutations, mapGetters, mapState } from '@mycolorway/vest-pocket/store'

Component({
  store,

  watchChildStore: ['child'], // child module 的 state 发生变化之后会自动重新计算 computed 并调用 setData

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
```

另外，为了避免在每个页面里都重复的去绑定 store，我们可以在 app.js 里面统一绑定：

```js
// app.js
import store from './store/index'

App({
  store
})
```

这样 Component module 会自动将 getApp().store 绑定到每一个自定义组件上。
