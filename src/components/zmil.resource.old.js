import { capitalize } from '../../utils/common.js';
import { AsyncPageable } from '../../utils/pageable.js';
import { 
  getRemoteItems, 
  postRemoteItems, 
  getRemoteDocument, 
  saveLocalDocument,
  getLocalDocument,
  deleteLocalDocument,
  getRootFragment 
} from '../../utils/resource.js';
import MixinResource from '../../mixins/resource.js';
import ComponentActions from '../actions.js';
import ComponentPagination from '../pagination.js';
import ComponentCards from '../cards.js';

export default {
  template: /* html */`
    <main class="resource">
      <header>
        <h2>Проект Минобороны РФ «Герои Z» <a href="https://z.mil.ru/spec_mil_oper/heroes_z.htm" target="_blank">↗</a></h2>
      </header>

      <!-- Actions-->
      <component-actions
        class="resource-actions"
        :actions="resourceActions.list"
        :progress="resourceActions.progress"
        @action="handleResourceAction">
      </component-actions>

      <!-- Pagination -->
      <component-pagination
        v-if="pageableCards?.pages.length"
        class="resource-pagination"
        :info="pageableCards"
        @action="handlePaginationAction">
      </component-pagination>

      <!-- Errors -->
      <p class="error" v-if="error" v-html="error"></p>

      <!-- Cards -->
      <component-cards
        v-if="cards.length"
        class="resource-cards"
        :cards="cards">
      </component-cards>

      <!-- Pagination -->
      <component-pagination
        v-if="pageableCards?.pages.length"
        class="resource-pagination"
        :info="pageableCards"
        @action="handlePaginationAction">
      </component-pagination>
    </main>
  `,
  mixins: [MixinResource],
  components: {
    ComponentActions,
    ComponentCards,
    ComponentPagination,
  },
  data () {
    return {
      resourceActions: {
        list: [
          { key: 'actionLoadHeroes', label: 'Загрузить героев' },
          { key: 'actionClearCache', label: 'Очистить кэш' },
        ],
        progress: {
          active: false,
          status: ''
        },
      },
      pageableCards: null,
      cards: [],
      error: '',
      cache: {
        pageableUrl: 'cache/zmil/pageable.json',
        cardsUrl: 'cache/zmil/cards.json'
      }
    }
  },
  created () {
    console.log('Zmil resource created');
  },
  async mounted () {
    window.addEventListener('app-error', this.handleAppError);
    this.resourceActions.progress.active = true;
    await this.fromCache();
    this.resourceActions.progress.active = false;
  },
  unmounted () {
    window.removeEventListener('app-error', this.handleAppError)
  },
  methods: {
    async handleResourceAction (action) {
      this.resourceActions.progress.active = true;
      await this[action]();
      this.resourceActions.progress.active = false;
    },
    async handlePaginationAction (action) {
      this.resourceActions.progress.active = true;
      this.cards = await this.pageableCards.getPage(action);
      this.toCache();
      this.resourceActions.progress.active = false;
    },
    handleAppError (event) {
      this.error = event.detail.message;
    },

    // 
    // Cache
    // 

    async fromCache () {
      const { items, limit, index } = await getLocalDocument(this.cache.pageableUrl, 'json', true);
      this.pageableCards = new AsyncPageable({
        items: items || [],
        limit, 
        index,
        asyncMapInfo: this.getRemoteInfo.bind(this)
      });
      this.cards = await getLocalDocument(this.cache.cardsUrl, 'json', true);
    },
    async toCache (only) {
      if (!only || only.match('pageable')) {
        await saveLocalDocument(this.cache.pageableUrl, this.pageableCards.json);
      }
      if (!only || only.match('cards')) {
        await saveLocalDocument(this.cache.cardsUrl, this.cards);
      }
    },
    async clearCache () {
      await deleteLocalDocument(this.cache.pageableUrl);
      await deleteLocalDocument(this.cache.cardsUrl)
    },

    // 
    // Actions
    //

    async actionLoadHeroes () {
      this.pageableCards = new AsyncPageable({ 
        items: await this.getRemoteItems(), 
        limit: 10, 
        index: 0,
        asyncMapInfo: this.getRemoteInfo.bind(this)
      });
      this.cards = await this.pageableCards.getPage();
      this.toCache();
    },
    async actionClearCache () {
      this.cards = [];
      this.pageableCards = new AsyncPageable({ items: [] });
      await this.clearCache();
    },

    // 
    // Zmil
    //
    async getRemoteItems () {
      return await getRemoteItems({ 
        selector: '.newsitem2',
        getUrl: (pageIndex, previousNodes) => {
          // Exit if last page
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
          this.resourceActions.progress.status = `Грузим страницу ${pageIndex}...`; // update progress label
          return `${base}?${params.toString()}`;
        },
        mapInfo: (node) => {
          const photo = `https://z.mil.ru/${node.querySelector('img')?.getAttribute('src') || ''}`;
          const name = node.querySelectorAll('a')[photo ? 1 : 0]?.textContent.trim().replace('ё', 'е') || '';
          const rank = capitalize(node.textContent.replace(name, '').trim() || '');
          const url = `https://z.mil.ru/${node.querySelector('a').getAttribute('href') || ''}`;
          const id = url;
          return { name, rank, photo, url, id }
        }
      });
    },
    async getRemoteInfo (item, index, list) {
      this.resourceActions.progress.status = `Грузим карточку ${index + 1} из ${list.length}...`;
      const html = await getRemoteDocument(item.url);
      const node = getRootFragment(html)?.querySelector('#center');
      return {
        name: node.querySelector('h1')?.textContent.trim() || item.name || '',
        rank: node.querySelector('h1')?.nextSibling?.textContent.trim() || item.rank || '',
        resources: {
          zmil: {
            photo: item.photo,
            url: item.url,
            id: item.id,
            story: Array.from(node.querySelectorAll('h2 ~ div, h2 ~ p'))
              .map(element => element.textContent.trim())
              .join('\n\n')
              .trim() || ''
          }
        }
      };
    },
  }
}


