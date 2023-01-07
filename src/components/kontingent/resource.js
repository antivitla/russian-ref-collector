import recognizeRank from '../../node_modules/@russian-ref/ranks/recognize.js';
import recognizeAwards from '../../node_modules/@russian-ref/awards/recognize.js';
import { 
  getRemoteItems,
  getRemoteDocument,
  // getRootFragment,
} from '../../utils/resource.js';
import ComponentCardHeroAwards from '../card-hero-awards.js';
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
        Проект «Герои Z» военно-исторического издания «Контингент» <a href="https://kontingent.press/category/geroi-z" target="_blank">↗</a>
      </template>

      <!-- Схема карточки -->
      <template #card="{ card }">
        <header class="card-hero-header">
          <component-card-hero-image :src="card.resources.kontingent.photo" position="left"></component-card-hero-image>
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
        <section class="card-hero-story" v-html="card.resources.kontingent.story"></section>
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
        pageable: 'cache/kontingent/pageable.json',
        cards: 'cache/kontingent/cards.json'
      },
      limit: 12
    }
  },
  created () {
    console.log('Kontingent resource created');    
  },
  methods: {
    async getRemoteItems () {
      return await getRemoteItems({
        selector: 'results',
        type: 'json',
        getUrl: (pageIndex, previousNodes) => {
          if (pageIndex > 0 && !previousNodes.length) {
            return false;
          }
          this.actionsProgress.active = true;
          this.actionsProgress.status = `Грузим страницу ${pageIndex}...`; // update progress label
          let limit = 50;
          const params = new URLSearchParams({
            category: 'geroi-z',
            limit,
            offset: pageIndex * limit
          });
          return `https://kontingent.press/api/v1/posts/posts/?${params.toString()}`
        },
        mapInfo: (node) => {
          return {
            name: node.title.replace('Герои Z.', '').trim(),
            // rank: '',
            photo: node.image_url,
            // story: '',
            url: `https://kontingent.press/api/v1/posts/post/${node.slug}`,
            // url: `https://kontingent.press/post/${node.slug}`,
            id: node.slug
          };
        }
      });
    },
    async getRemoteInfo (item, index, list) {
      this.actionsProgress.active = true;
      this.actionsProgress.status = `Грузим карточку ${index + 1} из ${list.length}...`;
      let { name, photo, url, id } = item;
      const node = await getRemoteDocument(url, 'json');
      let story = node.content;
      let rank = recognizeRank(story);
      let awards = recognizeAwards(story);
      // console.log(node);
      url = url.replace('/api/v1/posts', '');
      return {
        name,
        rank,
        resources: {
          kontingent: {
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
