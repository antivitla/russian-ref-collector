import recognizeRank from '../../node_modules/@russian-ref/ranks/recognize.js';
import recognizeAwards from '../../node_modules/@russian-ref/awards/recognize.js';
import { capitalize } from '../../utils/common.js';
import Hero from '../../utils/hero.js';
import { 
  getRemoteItems,  
  getRemoteDocument, 
  getRootFragment,
} from '../../utils/resource.js';
import ComponentCardHero from '../card-hero.js';
import ComponentResource from '../resource.js';
import ModalDiffHero from '../modal-diff-hero.js';

export default {
  template: /* html */`
    <ComponentResource
      :actions-progress="actionsProgress"
      :cache-urls="cacheUrls"
      :getRemoteItems="getRemoteItems"
      :getRemoteInfo="getRemoteInfo">

      <!-- Заголовок ресурса -->
      <template #header>Проект Минобороны РФ «Герои Z» <a href="https://z.mil.ru/spec_mil_oper/heroes_z.htm" target="_blank">↗</a></template>

      <!-- Схема карточки -->
      <template #card="{ card }">
        <component-card-hero :card="card" resource-key="zmil" />
      </template>
    </ComponentResource>
  `,
  components: {
    ComponentCardHero,
    ComponentResource,
  },
  inject: ['library'],
  data () {
    return {
      actionsProgress: {
        active: false,
        status: ''
      },
      cacheUrls: {
        pageable: 'cache/zmil/pageable.json',
        cards: 'cache/zmil/cards.json'
      },
    }
  },
  created () {
    console.log('Zmil resource created');
  },
  methods: {
    async getRemoteItems () {
      return await getRemoteItems({ 
        selector: '.newsitem2',
        getUrl: (pageIndex, previousNodes) => {
          // Exit if last page
          // TODO: убрать ограничение в 2 страницы для ZMIL Heroes
          if (pageIndex > 0 && !previousNodes.length || pageIndex === 2) {
            return false;
          } 
          const limit = 25;
          const base = 'https://z.mil.ru/spec_mil_oper/heroes_z.htm';
          const params = new URLSearchParams({
            f: (pageIndex * limit) + 1,
            blk: 12426247,
            objInBlock: limit
          });
          this.actionsProgress.active = true;
          this.actionsProgress.status = `Грузим страницу ${pageIndex}...`; // update progress label
          return `${base}?${params.toString()}`;
        },
        mapInfo: (node) => {
          const photo = `https://z.mil.ru/${node.querySelector('img')?.getAttribute('src') || ''}`;
          let name = node.querySelectorAll('a')[photo ? 1 : 0]?.textContent.trim().replace('ё', 'е') || '';
          name = name.split(/\s+/g).reverse().join(' ');
          const rank = capitalize(node.textContent.replace(name, '').trim() || '');
          const url = `https://z.mil.ru/${node.querySelector('a').getAttribute('href') || ''}`;
          const id = url;
          return { name, rank, photo, url, id };
        }
      });
    },
    async getRemoteInfo (item, index, list) {
      this.actionsProgress.active = true;
      this.actionsProgress.status = `Грузим карточку ${index + 1} из ${list.length}...`;
      let { name, rank, photo, url, id } = item;
      const html = await getRemoteDocument(item.url);
      const node = getRootFragment(html)?.querySelector('#center');
      // Имя
      name = node.querySelector('h1')?.textContent.trim().split(/\s+/g).reverse().join(' ') || name || '';
      // Фото, url и id не требуют вмешательства (пока)
      // История
      const story = Array.from(node.querySelectorAll('h2 ~ div, h2 ~ p'))
        .map(element => element.textContent.trim().replace(/\n+/g, '\n\n'))
        .filter(text => text)
        .join('\n\n')
        .trim() || '';
      // Звание парсим из текста, при необходимости
      rank = recognizeRank(node.querySelector('h1')?.nextSibling?.textContent.trim() || rank || '');
      if (!rank) {
        story.split(/\n+/g).some(line => {
          rank = recognizeRank(line);
          return rank;
        });
      }
      // Награды, парсим из текста
      let awards = recognizeAwards(story);
      return new Hero({ 
        name, 
        rank, 
        awards,
        resources: {
          zmil: { 
            photo, 
            story,
            url, 
            id, 
          }
        }
      });
    },
    // actionShowLibrary (card) {
    //   console.log('actionShowLibrary');

    //   this.$emit('open-modal', {
    //     modal: Vue.markRaw(ModalDiffHero),
    //     props: { 
    //       card,
    //       okCallback: () => {
    //         console.log('ok', this);
    //       },
    //       cancelCallback: () => {
    //         console.log('cancel', this);
    //       }
    //     }
    //   });

    // },
    // handleEditHero (card) {
    //   this.$emit('open-modal', {
    //     modal: Vue.markRaw(ModalEditHero),
    //     props: { 
    //       card,
    //       okCallback: () => {
    //         console.log('ok', this);
    //       },
    //       cancelCallback: () => {
    //         console.log('cancel', this);
    //       }
    //     }
    //   })
    // }
  }
}
