export default {
  template: /* html */`
    <div class="modal-container">
      <div class="modal-backdrop" @click="$emit('close')"></div>
      <div class="modal">
        <slot></slot>
      </div>
    </div>
  `,
}