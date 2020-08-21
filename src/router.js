import Vue from 'vue'
import Router from './vue-router'   // Router 是一个插件
import Home from './views/Home.vue'
import About from './views/About.vue'

/*
使用这个插件 内部会提供给你两个全局组件 
  router-link、router-view  
  并且还会提供两个原型上的属性 
    $route  放的都是路由相关的属性
    $router 都是方法
*/
Vue.use(Router)    

// 路由：不同的路径 渲染不同的组件

// 路由导出后 需要被注册到实例中
const router = new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/about',
      component: About,
      children: [
        { 
          path: 'a',   // 这里有 / 就是根路径了，不是子路径
          component: {
            render: (h) => <h1>about A</h1>
          }
        },
        {
          path: 'b',
          component: {
            render: (h) => <h1>about B</h1>
          }
        }
      ]
    }
  ]
})

//  就是 发布订阅模式
// 当导航变化时 会依次执行这两个方法
router.beforeEach((form, to, next) => {
  console.log(1)
  setTimeout(() => {
    next()
  }, 1000)
})

router.beforeEach((form, to, next) => {
  console.log(2)
  setTimeout(() => {
    next()
  }, 1000)
})

export default router

