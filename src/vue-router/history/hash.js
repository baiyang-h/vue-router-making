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

  push(location) {
    this.transitionTo(location, () => {    // 去更新 hash 值， hash 值变化后 虽然会再次跳转 但是不会重新更新 current属性
      window.location.hash = location
    })
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
