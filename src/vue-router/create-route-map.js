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