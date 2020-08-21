import Vue from 'vue'
import App from './App.vue'
import router from './router.js'

// router.matcher.addRoutes([
//   {
//     path: '/about', children: [
//       {
//         path: 'c', component: {
//           render(h) {
//             return h('auth')
//           },
//         }
//       }
//     ]
//   }
// ])


Vue.config.productionTip = false

new Vue({
  name: 'root',
  router,   // 注入 router 实例
  render: h => h(App)
}).$mount('#app')


// 路由 两种模式的路由 （mpa 多页应用中跳转逻辑都是由后端处理）
// 前后端分离 前端需要根据路径的不同进行跳转（可以根据hash值显示变化内容） 上线时不采用这种方式

// history模式   用于生产环境（需要服务端支持， 否则一刷新页面就404了）

// hash 模式    history模式