export default {
  template: /*html*/`
    <nav class="tabs">
      <a 
        v-for="tab in tabs"
        class="tab"
        :class="{ active: tab.path === modelValue.path }"
        @click="$emit('update:modelValue', tab)">
        <span class="tab__subtitle">{{ tab.subtitle }}</span>
        <span class="tab__title">{{ tab.title }}</span>
      </a>
    </nav>
  `,
  props: {
    tabs: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Object,
      required: true
    }
  }
};