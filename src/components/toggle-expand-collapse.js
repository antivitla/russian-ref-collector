export default {
  template: /* html */`
    <div class="card-action" @click="handleClick">
      <svg v-if="modelValue" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-up" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <polyline points="6 15 12 9 18 15" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-down" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  `,
  props: {
    modelValue: Boolean
  },
  methods: {
    handleClick (event) {
      event.preventDefault();
      event.stopPropagation();
      this.$emit('update:modelValue', !this.modelValue);
    }
  }
}