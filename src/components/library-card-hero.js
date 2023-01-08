import { Routes } from '../app.js';
import ComponentCardHeroAwards from './card-hero-awards.js';
import ComponentCardHeroImage from './card-hero-image.js';
import ComponentCardHeroFallen from './card-hero-fallen.js';
import ComponentToggleExpandCollapse from './toggle-expand-collapse.js';

export default {
  template: /* html */`
    <div>
      <header class="card-hero-header mb-0">
        <div class="card-hero-info">
          <h3 class="card-hero-info__name">
            <span>{{ card.name }}</span>
            <component-card-hero-fallen v-if="card.fallen" />
          </h3>
          <div class="card-hero-info__rank">{{ card.rank }}</div>
          <component-card-hero-awards :awards="card.awards" />
        </div>
      </header>
      <section v-for="(resource, key) in card.resources" class="card-hero-resource">
        <!-- Переключатель деталей -->
        <div 
          class="card-hero-resource__toggle" 
          @click="ui[key + 'ShowDetails'] = !ui[key + 'ShowDetails']">
          <span>{{ getResourceTitle(key) }}</span>
          <component-toggle-expand-collapse 
            position="top right" 
            v-model="ui[key + 'ShowDetails']" />
        </div>
        <!-- Детали -->
        <div v-if="ui[key + 'ShowDetails']" class="card-hero-resource__details">
          <component-card-hero-image :src="getPhotoSrc(key)" />
          <div v-html="getStoryHtml(key)"></div>
        </div>
      </section>
    </div>
  `,
  components: {
    ComponentCardHeroAwards,
    ComponentCardHeroImage,
    ComponentCardHeroFallen,
    ComponentToggleExpandCollapse,
  },
  props: {
    card: Object
  },
  data () {
    return {
      ui: {}
    };
  },
  methods: {
    getResourceTitle (key) {
      const titles = {
        ancestor: '#ПредковДостойны',
        'telegram.mod_russia': 'Телеграм минобороны РФ',
      };
      return titles[key] || Routes[key]?.title || key;
    },
    getStoryHtml (key) {
      let resourceKey = key.match(/\./) ? key.split('.')[1] : key;
      return this.card.getStoryHtml(resourceKey);
    },
    getPhotoSrc (key) {
      let src = this.card.getPhoto(key);
      if (!src.match(/^http/)) {
        return `russian-ref-heroes/${src}`;
      } else {
        return src;
      }
    }
  }
};




