export default {
  template: /*html*/`
    <span class="progress" :class="{ active: active }">
      <span class="progress-indicator"></span>
      <span class="progress-label"><slot></slot></span>
    </span>
  `,
  props: {
    active: Boolean,
  }
}
