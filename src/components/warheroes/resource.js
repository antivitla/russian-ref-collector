import recognizeRank from '../../node_modules/@russian-ref/ranks/recognize.js';
import recognizeAwards from '../../node_modules/@russian-ref/awards/recognize.js';
import { 
  postRemoteItems,
  getRemoteDocument,
  getRootFragment,
} from '../../utils/resource.js';
import ComponentCardHero from '../card-hero.js';
import ComponentResource from '../resource.js';

export default {
  template: /* html */`
    <ComponentResource
      :actions-progress="actionsProgress"
      :cache-urls="cacheUrls"
      :getRemoteItems="getRemoteItems"
      :getRemoteInfo="getRemoteInfo">

      <!-- Заголовок ресурса -->
      <template #header>Интернет-проект «Герои России» <a href="https://warheroes.ru" target="_blank">↗</a></template>

      <!-- Схема карточки -->
      <template #card="{ card }">
        <component-card-hero :card="card" resource-key="warheroes" />
      </template>
    </ComponentResource>
  `,
  components: {
    ComponentCardHero,
    ComponentResource,
  },
  data () {
    return {
      actionsProgress: {
        active: false,
        status: ''
      },
      cacheUrls: {
        pageable: 'cache/warheroes/pageable.json',
        cards: 'cache/warheroes/cards.json'
      }
    }
  },
  created () {
    console.log('Warheroes resource created');    
  },
  methods: {
    async getRemoteItems () {
      return await postRemoteItems({
        selector: '.page-look .table-overhide tr:not(:first-child)',
        contentType: 'application/x-www-form-urlencoded',
        getUrl: (pageIndex, previousNodes) => {
          if (pageIndex > 0 && !previousNodes.length) {
            return false;
          }
          const url = `https://warheroes.ru/main.asp/page/${pageIndex + 1}/filter/get`;
          this.actionsProgress.active = true;
          this.actionsProgress.status = `Грузим страницу ${pageIndex + 1}...`;
          return url;
        },
        getBody: (pageIndex, previousNodes) => {
          return 'birthday=&birthday1=&deathday=&deathday1=&dateNagrFrom=&dateNagrTo=&war=15&star=0&alpha=0&death=0&sortBy=onlyFIO&limit=50&submit=';
        },
        mapInfo: (node) => {
          let date;
          let [stars, branch, name, awarded, birth, fallen] = node.cells;
          // Branch
          branch = branch.querySelector('img')?.alt.trim();
          // Url
          let url = `https://warheroes.ru${name.querySelector('a[href]')?.getAttribute('href') || ''}`;
          // Name
          name = name.textContent.trim().split(/\s+/g).slice(0, 2);
          name.reverse();
          name = name.join(' ');
          // Death
          fallen = fallen.textContent.trim();
          if (fallen) {
            date = fallen.split(/\./g);
            date.reverse();
            date = date.join('-');
          }
          fallen = Boolean(fallen);
          let id = url;
          return { name, branch, date, fallen, url, id };
        }
      });
    },
    async getRemoteInfo (item, index, list) {
      this.actionsProgress.active = true;
      this.actionsProgress.status = `Грузим карточку ${index + 1} из ${list.length}...`;
      let { name, date = '', fallen, url, id } = item;
      const html = await getRemoteDocument(item.url);
      const node = getRootFragment(html)?.querySelector('.left-block');
      const story = node.querySelector('.history').textContent.trim().replace(/\s*\n\s*\n\s*/,'\n\n');
      // Найти звание
      let rank = '';
      story.split(/\n+/g).reverse().some(line => {
        rank = recognizeRank(line) || '';
        return rank;
      });
      // Собираем героя
      return new Hero({
        name,
        rank,
        fallen,
        awards: ['Герой Российской Федерации'],
        resources: {
          warheroes: {
            photo: `https://warheroes.ru${node.querySelector('.foto-block .foto-border img')?.getAttribute('src') || ''}`,
            date,
            story,
            url,
            id,
          }
        }
      });
    }
  }
}
