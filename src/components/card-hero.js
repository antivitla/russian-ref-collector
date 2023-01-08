import ComponentCardHeroAwards from './card-hero-awards.js';
import ComponentCardHeroFallen from './card-hero-fallen.js';
import ComponentCardHeroImage from './card-hero-image.js';
import ComponentToggleExpandCollapse from './toggle-expand-collapse.js';

export default {
  template: /* html */`
    <div>
      <header class="card-hero-header" :class="{ 'show-details': ui.showDetails }">
        <component-card-hero-image :src="card.getPhoto(resourceKey)" position="top" />
        <div class="card-hero-info">
          <h3 class="card-hero-info__name">
            <span>{{ card.name }}</span>
            <component-card-hero-fallen v-if="card.fallen" />
          </h3>
          <div class="card-hero-info__rank">{{ card.rank }}</div>
          <component-card-hero-awards :awards="card.awards"></component-card-hero-awards>
        </div>
        <component-toggle-expand-collapse position="bottom right"  v-model="ui.showDetails" />
      </header>
      <section class="card-hero-story" v-if="ui.showDetails">
        <div class="pre-line">{{ card.getStory(resourceKey) }}</div>
      </section>
    </div>  
  `,
  props: {
    card: Object,
    resourceKey: String,
  },
  components: {
    ComponentCardHeroAwards,
    ComponentCardHeroFallen,
    ComponentCardHeroImage,
    ComponentToggleExpandCollapse,
  },
  data () {
    return {
      ui: {
        showDetails: false
      }
    };
  }
};
