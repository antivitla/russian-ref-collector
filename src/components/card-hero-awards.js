import awards from '../node_modules/@russian-ref/awards/awards.js';

export default {
  template: /* html */`
    <div class="card-hero-awards" v-show="awards.length">
      <div class="card-hero-awards__text">{{ awards.join(', ') }}</div>
      <div class="card-hero-awards__images">
        <div 
          class="card-hero-awards__image" 
          v-for="award in awards" 
          :style="getAwardStyle(award)"
          :title="award"></div>
      </div>
    </div>
  `,
  props: {
    awards: {
      type: Array,
      default: []
    }
  },
  methods: {
    getAwardStyle (name) {
      const foundAward = awards[name];
      return {
        backgroundImage: `url(node_modules/@russian-ref/awards/${foundAward?.images[0].main})`,
      };
    }
  }
}