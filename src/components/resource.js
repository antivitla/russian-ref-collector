import { capitalize } from '../utils/common.js';
import { AsyncPageable } from '../utils/pageable.js';
import { 
  saveLocalDocument,
  getLocalDocument,
  deleteLocalDocument,
} from '../../utils/resource.js';

import ComponentActions from './actions.js';
import ComponentCards from './cards.js';
import ComponentPagination from './pagination.js';

export default {
  template: /* html */`
    <div class="resource">
      <header>
        <h2><slot name="header">Resource header</slot></h2>
      </header>

      <!-- Actions-->
      <component-actions
        class="resource-actions"
        :actions="cobminedResourceActions"
        :progress="actionsProgress"
        @action="handleResourceAction">
      </component-actions>

      <!-- Pagination -->
      <component-pagination
        v-if="pageableCards?.pages.length"
        class="resource-pagination"
        :info="pageableCards"
        :disabled="actionsProgress.active"
        @action="handlePaginationAction">
      </component-pagination>

      <!-- Errors -->
      <p class="error" v-if="error" v-html="error"></p>

      <!-- Cards -->
      <component-cards
        v-if="cards.length"
        class="resource-cards"
        :cards="cards">
        <template #card="{ card }">
          <slot name="card" :card="card">Заглушка карточки на уроне resource.js</slot>
        </template>
      </component-cards>
      <div v-else-if="actionsProgress.active"><em>Грузим...</em></div>

      <!-- Pagination -->
      <component-pagination
        v-if="pageableCards?.pages.length"
        class="resource-pagination"
        :info="pageableCards"
        :disabled="actionsProgress.active"
        @action="handlePaginationAction">
      </component-pagination>

    </div>
  `,
  props: {
    getRemoteItems: {
      type: Function
    },
    getRemoteInfo: {
      type: Function
    },
    resourceActions: {
      type: Object,
      default: []
    },
    actionsProgress: {
      type: Object,
      default: {
        active: false,
        status: ''
      }
    },
    cacheUrls: {
      type: Object,
      default: {
        pageable: 'cache/pageable.json',
        cards: 'cache/cards.json',
      }
    },
    limit: {
      type: Number,
      default: 10,
    }
  },
  components: {
    ComponentActions,
    ComponentCards,
    ComponentPagination,
  },
  data () {
    return {
      defaultResourceActions: [
        { key: 'actionLoadHeroes', label: 'Загрузить героев' },
        { key: 'actionClearCache', label: 'Очистить кэш' },
      ],
      displayActionsProgress: {
        active: false,
        status: ''
      },
      pageableCards: null,
      cards: [],
      error: '',
    }
  },
  watch: {
    actionsProgress: {
      handler (value) {
        this.displayActionsProgress = value;
      },
      deep: true
    }
  },
  computed: {
    cobminedResourceActions () {
      return this.defaultResourceActions.concat(this.resourceActions);
    }
  },
  created () {
    console.log('Common resource created');
  },
  async mounted () {
    window.addEventListener('app-error', this.handleAppError);
    this.displayActionsProgress.active = true;
    await this.fromCache();
    this.displayActionsProgress.active = false;
  },
  unmounted () {
    window.removeEventListener('app-error', this.handleAppError)
  },
  methods: {
    async handleResourceAction (action) {
      this.displayActionsProgress.active = true;
      await this[action]();
      this.displayActionsProgress.active = false;
    },
    async handlePaginationAction (action) {
      this.displayActionsProgress.active = true;
      this.cards = await this.pageableCards.getPage(action);
      this.toCache();
      this.displayActionsProgress.active = false;
    },
    handleAppError (event) {
      this.error = event.detail.message;
    },

    // 
    // Cache
    // 

    async fromCache () {
      const { items, limit, index } = await getLocalDocument(this.cacheUrls.pageable, 'json', true);
      this.pageableCards = new AsyncPageable({
        items: items || [],
        limit, 
        index,
        asyncMapInfo: this.getRemoteInfo.bind(this)
      });
      this.cards = await getLocalDocument(this.cacheUrls.cards, 'json', true);
    },
    async toCache (only) {
      if (!only || only.match('pageable')) {
        await saveLocalDocument(this.cacheUrls.pageable, this.pageableCards.json);
      }
      if (!only || only.match('cards')) {
        await saveLocalDocument(this.cacheUrls.cards, this.cards);
      }
    },
    async clearCache () {
      await deleteLocalDocument(this.cacheUrls.pageable);
      await deleteLocalDocument(this.cacheUrls.cards)
    },

    // 
    // Actions
    //

    async actionLoadHeroes () {
      this.pageableCards = new AsyncPageable({ 
        items: await this.getRemoteItems(), 
        limit: this.limit, 
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
  }
}
