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