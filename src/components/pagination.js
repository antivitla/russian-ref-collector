export default {
  template: /*html*/`
    <nav class="actions">
      <input
        type="button"
        class="button"
        value="Первое"
        :disabled="info.isFirstPage || disabled"
        @click="$emit('action', 'first')">

      <span 
        class="action-divider" 
        :class="{ disabled: info.isFirstPage || disabled }"></span>
      
      <input
        type="button"
        class="button"
        value="Предыдущее"
        :disabled="info.isFirstPage || disabled"
        @click="$emit('action', 'previous')">

      <span class="pagination-current" v-if="displayInfo">{{ displayInfo }}</span>

      <input
        type="button"
        class="button"
        value="Следующее"
        :disabled="info.isLastPage || disabled"
        @click="$emit('action', 'next')">
      
      <span 
        class="action-divider" 
        :class="{ disabled: info.isLastPage || disabled }"></span>

      <input
        type="button"
        class="button"
        value="Последнее"
        :disabled="info.isLastPage || disabled"
        @click="$emit('action', 'last')">
    </nav>
  `,
  props: {
    info: {
      type: Object,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    displayInfo () {
      if (this.info) {
        return `Страница ${this.info.index + 1} из ${this.info.total}`;
      }
    }
  }
}