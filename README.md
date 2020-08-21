## Vue-Router

### 模式

- history 模式
- hash 模式
- abstract （一般用不到）

hash 模式
```html
<a href="#/a">a页面</a>
<a href="#/b">b页面</a>

<script>
  let fn = function() {
    app.innerHTML = window.location.hash
  }
  fn()
  window.addEventListener('hashchange', fn)
</script>
```

history 模式
```html
<a onClick="goA()">a页面</a>
<a onClick="goB()">a页面</a>

<script>
  let fn = function() {
    app.innerHTML = window.location.pathname
  }
  function goA() {
    history.pushState({}, null, '/a')
    fn()
  }
  function goB() {
    history.pushState({}, null, '/b')
    fn()
  }
  // 只对浏览器的前进后退进行处理
  window.addEventListener('popstate', function() {
    fn()
  })
</script>
```



### 初始化

初始化一个 `VueRouter` 类，并且为该类加上一个 `install` 静态属性，成为一个插件。

```js
class VueRouter {
  constructor(options) {
    options.mode = options.mode || 'hash'  // 默认没有传入就是hash模式
	}
}
  
VueRouter.install = install

export default VueRouter
```

以下是 `install` 方法，我们在插件内部创建了两个组件，两个属性，这是核心内容：

- `router-link`
- `router-view`
- `$route`
- `$router`

```js
// main._routerRoot = this  => app._routerRoot  => home._routerRoot  => a
export default function install(Vue, options) {
  // 插件安装的入口

  // 插件一般用于定义全局组件 全局指令 过滤器 原型方法...

  Vue.component('router-link', {
    render: h => h('a', {}, '')
  })
  Vue.component('router-view', {
    render: h => h('div', {}, '')
  })

  Vue.prototype.$route = {}
  Vue.prototype.$router = {}
}

// 我的vue是2.5版本的，但是别人的是2.8版本的， 为了要使这个插件在不同的版本都可以兼容，所以将Vue传入，那么外部的Vue是什么版本，这里就是用什么版本的
```



### 给每个组件混入_routerRoot属性

首先只有根组件实例才有 `$options.render`, 我们通过混入的方式给每个组件增加 `beforeCreate` 生命周期，组件生成初给根组件增加 `_routerRoot` 和 `_router`属性，并且在根组件实例下进行初始化方法 `this._router.init(this)`，然后通过 `$parent` 给所有子组件都增加上 `_routerRoot` 属性。

```js
export default function install(Vue, options) {
  // 插件安装的入口
  
  ......
  
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
      } else {
        // 组件渲染 是一层层的渲染
        this._routerRoot = this.$parent && this.$parent._routerRoot
      }

      // 无论是父组件还是子组件 都可以通过 this._routerRoot._router 获取共同的实例
    },
  })

  ......
  
}
```



### 模式初始化



初始化实例时，在`this.history` 上设置好相应的模式实例，如下：

```js
class VueRouter {
  constructor(options) {
    ......
    options.mode = options.mode || 'hash'  // 默认没有传入就是hash模式
    switch(options.mode) {     // 根据传入的不同模式配置，得到相应的 模式实例
      case 'hash':
        this.history = new HashHistory(this)
        break;
      case 'history':
        this.history = new BrowserHistory(this)
        break
    }
    ......
  }
  
  init(app) {
    
  }  
    
}
```

当插件安装时

```js
/*
使用这个插件 内部会提供给你两个全局组件 
  router-link、router-view  
  并且还会提供两个原型上的属性 
    $route  放的都是路由相关的属性
    $router 都是方法
*/
Vue.use(Router)      
```

触发之前说到的全局混入的 `beforeCreate` 周期方法，其中加载根组件时该生命周期中有 `this._router.init(this)` 这么一个方法会进行路由实例初始化 。

```js
export default function install(Vue, options) {
 
  Vue.mixin({
    beforeCreate() { 
      if(this.$options.router) {
       	......
        this._router.init(this)      // 初始化路由实例
      } else {
        ......
      }
    },
  })

}
```

好了 现在我们来看一下 router 实例中的 init 方法。这个初始化方法中主要做了对模式绑定相应的事件触发监听器，如对于hash 模式，绑定了 `hashchange` 事件，当每次路径发送变化时都会触发该事件。

```js
class VueRouter {
	......
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
    // setupListener   放到 hash 里   hashchange  popstate   方法里是绑定各自的监听事件，路径改变触发事件
    // transitionTo    放到base中 做成公共的方法     初始化时触发 setupListener 方法，来绑定相应的事件
    // getCurrentLocation   放到自己家里  window.location.hash   window.location.path   获取路径
  }

}
```

当创建了 router 实例时，默认会定义一些属性，现在我们初始化模式类，我们创建3个类：base、hash、history。其中hash和history类都继承了base类，所以对于一些公共属性和公共方法，我们可以定义在Base类中，对于特殊属于自己的方法和属性，则定义在各自的 Hash 和 History 类中。

```js
// base

class History {

  constructor(router) {
    this.router = router    // router参数 就是 router实例
  }

  transitionTo(location, onComplete) {
    console.log(location)      // /a
    // 根据路径加载不同的组件  this.router.matcher.match(location)  组件
    // 渲染组件
    onComplete && onComplete()
  }

}

export {
  History
}
```

这里先重点讲 Hash 模式

```js
// hash

import { History } from "./base";

class HashHistory extends History {
  constructor(router) {
    super(router)
    this.router = router

    // 确保 hash 模式下 有一个 #/ 路径
    ensureSlash() 
  }

  // 获取当前的位置 即路径（去掉#的）
  getCurrentLocation() {
    // 也是要拿到 hash 值
    return getHash()
  }

  setupListener() {
    window.addEventListener('hashchange', () => {
      //当 hash 变化了， 再次拿到 hash 值 进行跳转
      // hash 变化 再次进行跳转
      this.transitionTo(
        getHash()  
      )
    })
  }

}

function ensureSlash() {
  if(window.location.hash) {  // location.hash 有兼容性问题  window.location.href
    return
  }
  window.location.hash = '/'   // 默认就是 / 路径即可
}

function getHash() {
  return window.location.hash.slice(1)   // 把#去掉，拿到后面的路径
}


export default HashHistory
```

```js
// history

class BrowserHistory  extends History {

}

export default BrowserHistory
```



### 匹配路径

现在我们对于不同的模式已经初始化好了规则，此时当路径改变时，我们要根据路径来设置相应的匹配信息，并且渲染视图。

首先我们先在 `VueRouter` 构造函数中，初始化好一个工具属性，这个属性中包含两个方法：

1. 一个是 addRoutes：用于添加路由配置信息
2. 一个是match，返回当前路径匹配到的路由相关信息



`options.routes` 是用户自定义配置信息，传入的参数：

```js
{
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
}
```

```js
class VueRouter {
  constructor(options) {
		......
    // 用户没有传递配置 就默认传入一个空数组    这个函数会导出以下两个重要方法
    // 1. match通过路由来匹配组件
    // 2. addRoutes 动态添加匹配规则
    this.matcher = createMatcher(options.routes || [])   
		......
  }
 
  // 返回的就是 匹配到的路由信息  
  match(location) {
    return this.matcher.match(location)
  }
}
```



#### createMatcher



##### 扁平化



我们来看一下 `createMatcher` 这个方法：

1. 得到 pathMap 扁平化路由信息
2. addRoutes 方法
3. match 方法     返回匹配的路由记录

```js
export function createMatcher(routes) {
    
  // 将 routes 变成下面这样的映射表
  // pathMap = {'/': Home, '/about': About, '/about/a': AboutA}
  // 这个方法里面 可以有很多映射表，可以是根据路径、可以是根据名字......，这里暂时先说路径
  // 这个方法有两个功能，1. 初始化扁平化， 2. addRoutes方法里 添加的， 对于新添加的匹配规则也添加到映射表中
  // 既有初始化功能 也有重载功能
  let { pathMap } = createRouteMap(routes) // 扁平化配置

  function addRoutes(routes) {......}
  function match(location) {......}
  return {
    addRoutes,   // 添加路由
    match        	//用于匹配路径
  }
}
```

首先我们先来说 `createRouteMap(routes)` 方法，来使用户自定义的路由信息进行扁平化操作。何为扁平化，就是如下：

```js
[
  {
    path: '/',
    children: [
      {
        path: 'a',
        children: [
          {
            path: 'b',
          }
        ]
      }
    ]
  },
  {
    path: '/ccc',
  },
]
// 转为
[
  {path: '/'},
  {path: '/a'},
  {path: '/a/b'},
  {path: '/ccc'},
]
```

`createRouteMap` 方法的功能只要有以下几点：

1. 深度遍历生成一个扁平化的路由数组信息
2. 对与path，进行按父一层层的拼接上，形成一个完成的 路径
3. 在每条路由记录上新增上一个 parent 属性，表示的是其父路由记录，如果没有父则 parent 值 为 undefined

```js
//createRouteMap 方法

// 做扁平化操作
export default function createRouteMap(routes, oldPathMap) {

  let pathMap = oldPathMap || Object.create(null)  // 默认没有传递就是直接创建映射关系

  routes.forEach(route => {
    addRouteRecod(route, pathMap)
  });
  return {
    pathMap
  }
}

// 先序深度递归
function addRouteRecod(route, pathMap, parent) {   // parent 就是父亲
  // 当访问 / 时 应该渲染 Home 组件   / > {Home, ......}
  let path = parent ? parent.path + '/' + route.path : route.path;
  let record = {
    path,
    component: route.component,
    parent    // 这个属性用来表示当前组件的父亲是谁
    // props: route.props    // ...... 还可以有很多属性 ，如 redirect、meta等，这里暂时只写上面来个两个
  }
  if(!pathMap[path]) {   // 不能定义重复的路由 否则只生效第一个
    pathMap[path] = record
  }
  // 如果当前路由里还有孩子，表示要循环递归
  if(route.children) {
    route.children.forEach(childRoute => {
      // 在遍历儿子时 将父亲的记录传入进去
      addRouteRecod(childRoute, pathMap, record)
    })
  }
}
```

ok 此时我们可以得到 `pathMap` 的值为：

```js
[
  '/': {path: "/", component: {…}, parent: undefined},
  '/about': {path: "/about", component: {…}, parent: undefined},
	'/about/a': {path: "/about/a", component: {…}, parent: {…}},
	'/about/b': {path: "/about/b", component: {…}, parent: {…}},
]
```



##### addRoutes



##### match

根据传入的 路径参数，返回该路径匹配的路由信息。同时通过 `createRoute` 方法，对得到的 匹配的路由信息进行处理，增加 `matched`属性， 这个属性里就是该路径匹配的所有相关记录

```js
function match(location) {
    let record = pathMap[location]  // 同时 一个路径也可能有多个记录
    // 这个记录可能没有， 就是没有匹配到
    if(record) {
      return createRoute(record, {
        path: location
      })
    } else {
      // 这个记录没有
    return createRoute(null, {
      path: location
    })
    }
  }
```

```js
export function createRoute(record, location) {
  let res = []
  if(record) {
    while(record) {
      res.unshift(record)
      record = record.parent
    }
  }
  return {
    ...location,
    matched: res
  }
}
```

例如 ：匹配 `/about/a` ，匹配到的相关记录有 `/about`、`/about/a` 的相应路由信息，都会被记录在 matched 属性中。并且在该History 实例中将当前路由记录信息 保存到 `current` 属性上

```js
class History {
  constructor(router) {
    this.router = router
		// 初次默认时
    this.current = createRoute(null, {   
      path: '/'
    })
  }
  
  transitionTo(location, onComplete) {
    ......
    let route = this.router.match(location)    // 调用 router 实例中的 match 方法
    
    // 匹配的问题 存在两种情况
    // 1. 但是当我们重复同一个路径， 即 从 /a -> /a 那么没必要重新渲染
    // 2. 可能一开始路径一样，只有路径一样， 但后者匹配到结果不一样，那么也是可以渲染的
    // 防止重复跳转
    if(location === this.current.path && route.matched.length === this.current.matched.length) {
      return 
    }
    
    this.updateRoute(route)
    
    ......
  }
  
  updateRoute(route) {
    this.current = route   // 每次路由切换 都会更改 current 属性， 前提是上一次和这一次是不一样的
		
  }
}
```

最后得到的 route 信息结果类似于如下：

```js
{
  path: "/about/a",
  matched: [
    {path: "/about", component: {…}, parent: undefined},
    {path: "/about/a", component: {…}, parent: {…}}
  ]  
}
```

接下来要讲的就是 当路径发生变化时，更新路由信息 `updateRoute`方法



#### updateRoute

`History.prototype.updateRoute`方法是当路径变化时会触发该方法，使路径变化做出相应的处理。

1. 更新 History 实例的 current 属性
2. 触发回调

```js
updateRoute(route) {
    // 每次你更新的是 current
    this.current = route   // 每次路由切换 都会更改 current 属性， 前提是上一次和这一次是不一样的
    this.cb && this.cb(route)
  	......
  }
```

这个回调是在什么时候定义的呢？我们给History 类增加一个原型方法，在 `VueRouter.peototype.init`触发时来触发 `History.prototype.listen`方法，并且传入一个回调函数，给 History的实例设置一个cb属性

```js
class History {
  ......
  listen(cb) {
    this.cb = cb
  }
  ......
}
```

```js
class VueRouter {
  init(app) {   // app 是根实例
    
    const history = this.history;

    history.listen((route) => {   // 每次路径变化 都会调用此方法
      app._route = route 
    })
  }
}
```

因此每次路径变化后，都会调用这里设定的 cb 方法。



### router-link

首先现将 `install` 设置插件的文件定义好相关全局组件和属性

```js
export default function install(Vue, options) {
  ......
  Vue.component('router-link', Link)
  Vue.component('router-view', View)

  
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
```

现在我们来看一下`Link`组件

```js
export default {
  name: 'RouterLink',
  props: {    // 属性接收
    to: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    }
  },
  methods: {
    handler(to) {
      this.$router.push(to)
    }
  },
  render() {
    const { tag, to } = this
    // jsx 语法  绑定事件
    return <tag onClick={this.handler.bind(this, to)}>{ this.$slots.default }</tag>
  },
}
```

此处的 `this.$router.push(to)` 就是调用了上面在Vue实例上定义的`$router` 属性，他等价于 `this._routerRoot._router` 即 router 实例对象。而在router实例对象上，

```js
class VueRouter {
  ......
  push(to) {
    this.history.push(to)    // this.history 代表的是模式实例对象，所以会调用相关的模式原型对象上的方法，这里是Hash.prototype.push
  }
}
```

如下：

```js
class Hash extends History {
  ......
  push(location) {
    // 这个方法是 History 原型对象上的方法
    this.transitionTo(location, () => {    
      window.location.hash = location
    })
  }
......
}
```

```js
class History {
  transitionTo(location, onComplete) {
    
    let route = this.router.match(location)   

    // 匹配的问题 存在两种情况
    // 1. 但是当我们重复同一个路径， 即 从 /a -> /a 那么没必要重新渲染
    // 2. 可能一开始路径一样，只有路径一样， 但后者匹配到结果不一样，那么也是可以渲染的
    // 防止重复跳转
    if(location === this.current.path && route.matched.length === this.current.matched.length) {
      return 
    }

    this.updateRoute(route)


    onComplete && onComplete()    // 上面的回调会在这里执行， 改变 hash 值

  }
}
```



### router-view

```js
// 这是一个函数式组件， 函数式组件的特点， 性能高，不需要创建实例，函数内部没有 this, data 这些状态 不用创建实例
export default {
  name: 'RouterView',
  functional: true,
  render(h, { parent, data }) {   // 调用render方法 说说明他一定是一个routerView组件,  data是数据
    // 获取 当前对应要渲染的记录
    let route = parent.$route
    
    let depth = 0
    data.routerView = true   // 表示 特意给每个 router-view 组件的虚拟节点的 data 中增加了这么一个标识，表示是一个routerView

    // 第一层router-view 渲染第一个record  第二个router-view 渲染第二个， 递归深度

    // App.vue 中渲染组件，router-view就是App的子组件，而router-veiw这个组件的.$parent就是App这个组件
    // 我们给router-view这个组件的虚拟节点上增加$$vnode.data.routerView = true 来代表这是一个 router-view 组件
    // 所以 App 组件的虚拟节点上是没有这个值的
    /*
      console.log(parent.$vnode, parent.$vnode.data.routerView, parent) 
      
      router-view
      第一次 
        parent.$vnode App这个组件的虚拟dom                  VNode {tag: "vue-component-3-App", data: {…}, children: undefined, text: undefined, elm: undefined, …}
        parent._vnode App这个组件内部元素的虚拟节点，即div    _vnode: VNode {tag: "div", data: {…}, children: Array(3), text: undefined, elm: div#app, …}
        parent.$vnode.data.routerView : undefined         是我给 router-view 组件中 定义的一个属性为true,因为现在是App组件，不是router-view，所以没有这个属性
        所以 route.matched[0] 渲染第一个组件

      第二次， 即嵌套下去的 第二个 router-view
        parent.$vnode 父的$vnode是 一个router-view， 因为是通过上面第一次的router-view中嵌套中的view，所以它的父组件是上一个router-view            VNode {tag: "vue-component-4", data: {…}, children: undefined, text: undefined, elm: undefined, …}
        因为 父的$vnode 是router-view ，所以 我之前定义了data.routerView = true， 所以depth++， 取第二个组件渲染
        就是这样实现 相应的 router-view 渲染相应的组件的
    */
    
    while(parent) {
      // parent 是该组件父组件的组件实例， 
      // 而parent.$vnode 就是父级组件的虚拟节点，， 即 <App/> 这个组件的虚拟节点
      // _vnode.parentVnode = $vnode
      if(parent.$vnode && parent.$vnode.data.routerView) {   
        depth++
      }
      parent = parent.$parent    // 不停的找父亲
    }

    let record = route.matched[depth]  // 获取对应层级的记录
    if(!record) {   
      return h()    //  空的虚拟节点 empty-vnode   注释节点
    }

    return h(record.component, data)
  },
}


/*
<app></app>   =  $vnode   {tag: 'vue-component-3-app'}   表示的是这个组件的虚拟节点
                而 _vnode  表示的则是 这个组件内部的东西，就是真实内容的虚拟节点  {tag: 'div', xxxx}
所以 这个 <app> 实例的 $vnode 可以算是占位符虚拟节点
*/
```

对于页面中嵌套的 `router-view`，即路由嵌套子路由，表示着 `router-veiw` 嵌套 `router-view`， 所以我们要在渲染中找到对应的路由匹配记录然后在 `router-view` 中进行渲染。

我们给`router-view`组件内部增加了`data.routerView=true`  就表示这个组件是 `router-view` 组件，可以通过`parent.$vnode.data.routerView`确定该组件的父亲是否也是 router-view 组件， 如果是的话，就对 `depth++` 。然后通过唯一的 depth在匹配记录中来获取相应的 路由匹配信息，进行渲染。



### 全局钩子

在router.js 文件中进行 路由 的全局钩子配置，其实也是使用了发布订阅模式，当导航变化时，会依次执行这两个方法

```js
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
```

在VueRouter上定义相关属性和方法

```js
class VueRouter {
  constructor(options) {
    this.beforeHooks = []
  }
  beforeEach(fn) {
    this.beforeHooks.push(fn)
  }
}
```

当路径发生变化时，执行以上两个方法

```js
class History {
  ......
  transitionTo(location, onComplete) {
    let route = this.router.match(location)     // {path: '/', matched: [{xx}, {xx}]}
		......
    // 在更新之前先调用注册好的导航守卫      queue 生成一个队列
		let queue= [].concat(this.router.beforeHooks);   // 拿到了注册的方法
    
		const iterator = (hook, next) => {
      // 这个hook 就是用户定义的回调方法  router.beforeEach(hook)
      hook(this.current, route, ()=>{
        next()
      })  
    }

    // 把我队列里的函数依次执行，   等执行完后才调用 更新
    runQueue(queue, iterator, () => {
      this.updateRoute(route)

      // 根据路径加载不同的组件  this.router.matcher.match(location)  组件
      // 渲染组件
      onComplete && onComplete()
    })
  }
}
```

我们先拿到所有注册的钩子函数，生成一个 queue 队列。然后把队列里的函数依次执行，等到执行完所有的钩子函数后再调用更新。

现在我们主要来讲 这个 `runQueue` 执行队列函数，他接收3个参数：

1. 第一个参数是所有beforeEach钩子函数的回调
2. 第二个参数是一个 生成器，主要功能就是按顺序依次执行queue中的一个个回调函数，只有前一个执行好后才会执行后一个，知道最后全部执行完后调用cb回调函数
3. 第三个参数是一个回调函数，比如这个回调函数里是执行更新操作

```js
function runQueue(queue, iterator, cb) {
  // 异步迭代
  function step(index) {   // 可以实现中间件逻辑
    if(index>=queue.length) return cb()
    let hook = queue[index]   // 先执行第一个 将第二个hook执行的逻辑当做参数传入
    iterator(hook, () => step(index+1))
  }
  step(0)
}
```

```js
const iterator = (hook, next) => {
  // 这个hook 就是用户定义的回调方法  router.beforeEach(hook)
  hook(this.current, route, ()=>{
    next()
  })  
}
```

最终结果就是会依次执行全局钩子函数了



