export let _Vue
import Link from './components/link'
import View from './components/view'

// main._routerRoot = this  => app._routerRoot  => home._routerRoot  => a
export default function install(Vue, options) {
  // 插件安装的入口

  _Vue = Vue   // 这样别的文件都可以使用Vue变量

  // 给所有的组件都混入一个属性 router
  Vue.mixin({
    // 就是给每个组件增加一个 _routerRoot 属性，指向 根实例，所以可以拿到 _routerRoot._router 拿到 路由实例
    beforeCreate() {   // this 指向的是当前组件的实例
      // 将父亲传入的 router 实例共享给所有子组件
      if(this.$options.router) {
        this._routerRoot = this  // 我给当前根组件增加一个属性
        // _routerRoot 代表的是他自己
        this._router = this.$options.router

        // 是在根组件下初始化
        this._router.init(this)   // 这里的 this 是根实例
        
        // 如何获取 current 属性, 将这个 current 属性变成响应式 属性。 将current属性定义在_route 上
        // Vue.util.defineReactive 是 Vue 内部的工具方法
        Vue.util.defineReactive(this, '_route', this._router.history.current)
        
        // 当current变化后 更新 _route 属性
        // 如果 current 中的path或者matched的其他属性变化 也是响应式的

      } else {
        // 组件渲染 是一层层的渲染
        this._routerRoot = this.$parent && this.$parent._routerRoot
      }

      // 无论是父组件还是子组件 都可以通过 this._routerRoot._router 获取共同的实例
    },
  })

  // 插件一般用于定义全局组件 全局指令 过滤器 原型方法...

  Vue.component('router-link', Link)
  Vue.component('router-view', View)

  // 代表理由中 所有的属性
  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route    // 就是 current  有  path，有matched
    }
  })
  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router     // 就是 路由实例。 这个实例里有 push、go replace 等返回 
    }
  })
}

// 我的vue是2.5版本的，但是别人的是2.8版本的， 为了要使这个插件在不同的版本都可以兼容，所以将Vue传入，那么外部的Vue是什么版本，这里就是用什么版本的