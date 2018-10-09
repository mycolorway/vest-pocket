# vest-pocket

vest-pocket 是对小程序官方框架的补充，提供了官方框架缺少的一些实用 module 和组件。

### 微信接口封装

wxAPI module 对微信小程序的接口做了封装，让异步接口返回 Promise，配合 [vest](https://github.com/mycolorway/vest) 的 async/await 的语法支持，可以大大简化调用 API 的代码，例如：

```js
import { wxAPI } from '@mycolorway/vest-pocket'

Page({
  async onLoad() {
    this.setData(await wxAPI('request', {
      url: 'xxx'
    }))
  }
})
```

wxAPI module 还对企业微信小程序的接口做了兼容性处理，在企业微信客户端里会优先调用 wx.qy 对象里的接口。

### Page 构造方法封装

vest-pocket 的 Page module 对默认的页面构造方法做了封装，让页面可以像自定义组件那样支持 behavior 扩展。

官方文档里面有提到，我们可以[使用 Component 构造器构造页面](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html#%E4%BD%BF%E7%94%A8-component-%E6%9E%84%E9%80%A0%E5%99%A8%E6%9E%84%E9%80%A0%E9%A1%B5%E9%9D%A2)，
而 Component 构造器是支持 behavior 扩展的。那么我们为什么还需要让 Page 构造方法支持 behavior 呢？原因是使用 Component 构造器构造页面对页面生命周期函数对支持不好。一方面页面生命周期函数无法在组件方法中通过 `this` 访问，另一方面 behavior 里定义生命周期函数会被页面构造方法里定义对生命周期函数覆盖，而不是按顺序依次调用，例如：

```js
import { Page } from '@mycolorway/vest-pocket'

const testBehavior = {
  onLoad() {
    console.log('from behavior')
  }
}

Page({

  behaviors: [testBehavior],

  onLoad() {
    console.log('from page')
  }

})
```

上面的代码在控制台里的输出依次是：

```
from page
from behavior
```

另外，Page behavior 中定义的其他同名属性或方法的合并覆盖规则跟 Component behabior 是一样的。

### Store

在一些业务比较复杂的 Web 项目里，我们通常会借助 [Vuex](https://vuex.vuejs.org/) 或者 [Redux](https://redux.js.org/) 来实现应用的状态管理。vest-pocket 的 Store 填补了小程序在这方面的空白。

vest-pocket Store 的设计借鉴了 [Vuex](https://vuex.vuejs.org/)，大部分接口都跟 Vuex.Store 保持一致：

```js
// stores/index.js

import {Store} from '@mycolorway/vest-pocket'

export default new Store({
  state: {
    name: 'vest'
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
        lastName: 'pocket'
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

* store.getters 是一个方法：`store.getters('name')`
* store.state 是只读的，只能在 mutation 里面修改，修改的方式是返回一个新的 state
* module 对象本身也是一个 Store 的实例，可以通过 `parentStore.moduleName` 来获取
* store.state 发生变化的时候会触发 store 上的 `stateChanged` 事件:

```js
store.on('stateChanged', (newState) => {
  console.log(newState)
})
```
