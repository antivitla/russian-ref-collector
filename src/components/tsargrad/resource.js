import { capitalize } from '../../utils/common.js';
import { 
  getRemoteItems,
  getRemoteDocument,
  getRootFragment,
} from '../../utils/resource.js';
import ComponentCardHeroImage from '../card-hero-image.js';
import ComponentResource from '../resource.js';

export default {
  template: /* html */`
    <ComponentResource
      :actions-progress="actionsProgress"
      :cache-urls="cacheUrls"
      :getRemoteItems="getRemoteItems"
      :getRemoteInfo="getRemoteInfo"
      :limit="limit">

      <!-- Заголовок ресурса -->
      <template #header>
        Проект «Наши Герои» телеканала «Царьград» <a href="https://ug.tsargrad.tv/ourheroes" target="_blank">↗</a>
      </template>

      <!-- Схема карточки -->
      <template #card="{ card }">
        <header class="card-hero-header">
          <component-card-hero-image :src="card.resources.tsargrad.photo" position="top"></component-card-hero-image>
          <div class="card-hero-info">
            <h3 class="card-hero-info__name">
              <span>{{ card.name }}</span>
              <span 
                class="card-hero-info__fallen" 
                title="Погиб. Вечная память герою"
                v-if="card.fallen"></span>
            </h3>
            <div class="card-hero-info__rank">{{ card.rank }}</div>
            <component-card-hero-awards :awards="card.awards"></component-card-hero-awards>
          </div>
        </header>
        <section class="card-hero-story" v-html="card.resources.tsargrad.story"></section>
      </template>
    </ComponentResource>
  `,
  components: {
    ComponentCardHeroImage,
    ComponentResource,
  },
  data () {
    return {
      actionsProgress: {
        active: false,
        status: ''
      },
      cacheUrls: {
        pageable: 'cache/tsargrad/pageable.json',
        cards: 'cache/tsargrad/cards.json'
      },
      limit: 8
    }
  },
  created () {
    console.log('Tsargrad resource created');    
  },
  methods: {
    async getRemoteItems () {
      return await getRemoteItems({
        selector: '.heroes__item',
        getUrl: (pageIndex, previousNodes) => {
          if (pageIndex > 0 && !previousNodes.length) {
            return false;
          }
          this.actionsProgress.active = true;
          this.actionsProgress.status = `Грузим страницу ${pageIndex}...`; // update progress label
          const params = new URLSearchParams({
            page: pageIndex,
            referer: 'https://ug.tsargrad.tv/ourheroes',
            oneParam: ''
          });
          return `https://ug.tsargrad.tv/ajax/moreourheroes?${params.toString()}`;
        },
        mapInfo: (node) => {
          const photo = node.querySelector('.heroes__photo img')?.src.trim() || '';
          const name = node.querySelector('.heroes__item-head h3')?.textContent.trim() || '';
          const rank = capitalize(node.querySelector('.heroes__item-head h4')?.textContent.trim() || '');
          let story = node.querySelector('.article__content');
          Array.from(story.querySelectorAll('iframe')).forEach(iframe => iframe.remove());
          let endIndex = Array.from(story.children).findIndex(item => item.textContent.match(/К ЧИТАТЕЛЯМ/g));
          while (story.children[endIndex]) {
            story.children[endIndex].remove();
          }
          story = story.innerHTML.trim().replace(/<p>\s*<\/p>/g, '').replace(/\s\s+/g, ' ');
          const url = photo;
          const id = photo;
          return { name, rank, photo, story, url, id };
        }
      });
    },
    async getRemoteInfo (item, index, list) {
      this.actionsProgress.active = true;
      this.actionsProgress.status = `Грузим карточку ${index + 1} из ${list.length}...`;
      let { name, rank, photo, story, url, id } = item;
      return {
        name,
        rank,
        resources: {
          tsargrad: {
            photo,
            story,
            url,
            id,
          }
        }
      };
    }
  }
}
