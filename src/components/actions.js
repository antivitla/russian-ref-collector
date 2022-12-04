import ComponentProgress from './progress.js';

export default {
  template: /*html*/`
    <nav class="actions">
      <template v-for="action in actions">
        <span class="action-divider" :class="{ disabled: progress.active }"></span>
        <input
          type="button"
          class="button"
          :disabled="progress.active"
          :value="action.label"
          @click="$emit('action', action.key)">
      </template>
      <component-progress :active="progress.active">{{ progress.status || 'Грузим...' }}</component-progress>
    </nav>
  `,
  components: {
    ComponentProgress,
  },
  props: {
    actions: {
      type: Array,
      default: []
    },
    progress: {
      type: Object,
      default: null,
    }
  }
}