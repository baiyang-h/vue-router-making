class History {

  constructor(router) {
    this.router = router

    // 当我们创建好路由后，先有一个默认值 路径 和 匹配到的记录做成一个映射表
    // {'/': Record, '/about': Record, '/about/a': recordA, '/ablut/b': recordB}    如 '/about/a' 匹配到两个规则，  先匹配到 '/bout'  再匹配到 '/about/a'
    // /about/a  => matches : [Record, recordA]  所以一个路径，这个 matches 可能是匹配多个记录，，那做这样一个数组的目的是什么呢？
    // 答案是 在页面中 有 一个个递归的 router-view， 可以根据这个数组，对应一个个的router-view 来进行渲染哪个组件

    // 默认当创建 history 时 路径应该是 '/' 并且匹配到的记录是 []
    this.current = createRoute(null, {   // 第一个参数是record， 第二个参数是一个location属性
      path: '/'
    })
    // this.current = {path: '/', matched: []}
  }

  listen(cb) {
    this.cb = cb
  }

  transitionTo(location, onComplete) {
    // 跳转时都会调用此方法 from to
    // 路径变化了 视图还要刷新，   响应式数据原理
    

    // location 是一个字符串路径
    // 返回得到的值类似于 {'/': matched: []}
    // 这个route 就是当前最新的匹配到的结果
    let route = this.router.match(location)   

    // 匹配的问题 存在两种情况
    // 1. 但是当我们重复同一个路径， 即 从 /a -> /a 那么没必要重新渲染
    // 2. 可能一开始路径一样，只有路径一样， 但后者匹配到结果不一样，那么也是可以渲染的
    // 防止重复跳转
    if(location === this.current.path && route.matched.length === this.current.matched.length) {
      return 
    }

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

  updateRoute(route) {
    // 每次你更新的是 current
    this.current = route   // 每次路由切换 都会更改 current 属性， 前提是上一次和这一次是不一样的
    this.cb && this.cb(route)
    // 视图重新渲染有几个要求？ 响应式  1. 模板中要用  渲染routerView时用  2. current 得是响应式的
    // 那么怎么让 current 属性编程响应式的呢
  }

}

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

export {
  History
}

function runQueue(queue, iterator, cb) {
  // 异步迭代
  function step(index) {   // 可以实现中间件逻辑
    if(index>=queue.length) return cb()
    let hook = queue[index]   // 先执行第一个 将第二个hook执行的逻辑当做参数传入
    iterator(hook, () => step(index+1))
  }

  step(0)
}

