import install from "./install"
import { createMatcher } from "./create-matcher"
import BrowserHistory from './history/history'
import HashHistory from './history/hash'

class VueRouter {
  constructor(options) {
    // 根据用户的配置 和 当前请求的路径 渲染对应的组件

    // 创建匹配器 可用于后续的匹配操作
    // 用户没有传递配置 就默认传入一个空数组    这个函数会导出以下两个重要方法
      // 1. match通过路由来匹配组件
      // 2. addRoutes 动态添加匹配规则
    this.matcher = createMatcher(options.routes || [])

    // 我需要根据不同的 路径进行切换
    // hash  history abstract  模式
    options.mode = options.mode || 'hash'  // 默认没有传入就是hash模式
    switch(options.mode) {
      case 'hash':
        this.history = new HashHistory(this)
        break;
      case 'history':
        this.history = new BrowserHistory(this)
        break
    }

    this.beforeHooks = []
  }

  push(to) {
    this.history.push(to)    // 跳转
  }

  to() {

  }

  // 就是 调用 this.matcher 中 createMatcher 方法 导出的 match 方法， 这里这么写就是为了简化操作，直接掉这个就行了
  match(location) {
    return this.matcher.match(location)
  }

  init(app) {   // app 是根实例
    /**@descripition 监听 hash 值变化，默认跳转带对应的路径中 */

    const history = this.history;

    const setUpHashListener = () => {
      history.setupListener()    // 监听路由变化 hashchange
    }

    history.transitionTo(
      history.getCurrentLocation(),  // 获取当前的位置
      setUpHashListener      //对 hash 变化时 触发的监听器
    )
    
    // 初始化的时候 给 History类的实例增加一个 回调，即 (route => app._route = route)
    history.listen((route) => {   // 每次路径变化 都会调用此方法
      app._route = route 
    })

    // setupListener   放到 hash 里   hashchange  popstate
    // transitionTo    放到base中 做成公共的方法
    // getCurrentLocation   放到自己家里  window.location.hash   window.location.path
  }

  beforeEach(fn) {
    this.beforeHooks.push(fn)
  }
}

VueRouter.install = install

export default VueRouter

// 默认 vue-router 插件导出一个类， 用户会 new Router({})

