import Hero from '../utils/hero.js';
import ComponentModal from './modal.js';

export default {
  template: /* html */ `
    <component-modal>
      <header class="modal-header">Modal Header</header>
      <main class="modal-body">Modal Main</main>
      <footer class="modal-footer">
        <input type="button" value="cancel" @click="handleCancel">
        <!-- <span class="action-divider"></span> -->
        <input type="button" value="ok" @click="handleOk">
      </footer>
    </component-modal>
  `,
  components: {
    ComponentModal
  },
  props: {
    card: Hero,
    okCallback: Function,
    cancelCallback: Function,
  },
  methods: {
    handleOk () {
      this.okCallback();
      this.$emit('close');
    },
    handleCancel () {
      this.cancelCallback();
      this.$emit('close');
    }
  }
}