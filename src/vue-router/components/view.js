// 这是一个函数式组件， 函数式组件的特点， 性能高，不需要创建实例，函数内部没有 this, data 这些状态 不用创建实例 new Ctor().$mount()
export default {
  name: 'RouterView',
  functional: true,
  render(h, { parent, data }) {   // 调用render方法 说说明他一定是一个routerView组件,  data是数据
    // 获取 当前对应要渲染的记录
    let route = parent.$route
    
    let depth = 0
    data.routerView = true   // 表示 特意给每个 router-view 组件的虚拟节点的 data 中增加了这么一个标识，表示是一个routerView

    // 第一层router-view 渲染第一个record  第二个router-view 渲染第二个， 递归深度

    // App.vue 中渲染组件时，默认会调用render函数，父亲中没有 data.routerView 属性
    // 渲染第一次，并且标识当前routerView 为 true
    

    /*
      console.log(parent.$vnode, parent.$vnode.data.routerView, parent) 
      
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