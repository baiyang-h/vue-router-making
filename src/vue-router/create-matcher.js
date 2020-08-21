import createRouteMap from './create-route-map'
import { createRoute } from "./history/base"

export function createMatcher(routes) {
    
  // 将 routes 变成下面这样的映射表
  // pathMap = {'/': Home, '/about': About, '/about/a': AboutA}
  // 这个方法里面 可以有很多映射表，可以是根据路径、可以是根据名字......，这里暂时先说路径
  // 这个方法有两个功能，1. 初始化扁平化， 2. addRoutes方法里 添加的， 对于新添加的匹配规则也添加到映射表中
  // 既有初始化功能 也有重载功能
  let { pathMap } = createRouteMap(routes) // 扁平化配置

  function addRoutes(routes) {
    createRouteMap(routes, pathMap)

    console.log(pathMap)
  }


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




  return {
    addRoutes,   // 添加路由
    match        //用于匹配路径
  }
}