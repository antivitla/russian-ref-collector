export default {
  template: /*html*/`<div class="card-hero-image" :style="style"></div>`,
  props: {
    src: {
      type: String,
      default: ''
    },
    position: {
      type: String,
      default: 'center'
    }
  },
  computed: {
    style () {
      return {
        'background-image': `url(${this.src})`,
        'background-position': this.position,
        'background-size': 'cover'
      };
    }
  }
}
