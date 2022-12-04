import MixinResource from '../../mixins/resource.js';

export default {
  template: /*html*/`
    <main>Telegram.{{ options.channel }}</main>
  `,
  mixins: [MixinResource],
  created () {
    console.log(`Telegram.${this.options.channel}`, this.options);
  },
}