import Ranks from '../node_modules/@russian-ref/ranks/ranks.js';
import { Pageable } from '../utils/pageable.js';
import ComponentCards from './cards.js';
import ComponentCardHeroAwards from './card-hero-awards.js';
import ComponentCardHeroImage from './card-hero-image.js';
import ComponentPagination from './pagination.js';
import ComponentToggleExpandCollapse from './toggle-expand-collapse.js';
import { Routes } from '../app.js';

export default {
  template: /* html */`
    <div class="resource">
      <header>
        <h2>Библиотека</h2>
      </header>

      <!-- Действия (поиск, сортировка, может быть фильтры) -->
      <div class="form-field-group">
        <div class="form-field" style="flex-shrink: 0">
          <label for="sort-dir-heroes">Сортировать</label>
          <select id="sort-dir-heroes" v-model="dirBy">
            <option value="asc">По возрастанию</option>
            <option value="dsc">По убыванию</option>
          </select>
        </div>
        <div class="form-field" style="flex-shrink: 0; margin-left: 0.5rem">
          <label for="sort-heroes">&nbsp;</label>
          <select id="sort-heroes" v-model="sortBy">
            <option value="default">Порядка добавления</option>
            <option value="name">Имени</option>
            <option value="lastName">Фамилии</option>
            <option value="date">Даты</option>
            <option value="rank">Звания</option>
          </select>
        </div>
        <div class="form-field" style="flex-grow: 1">
          <label for="search-heroes">Фильтровать</label>
          <input id="search-heroes" type="search" v-model="filterBy" placeholder="По всем полям, включая историю" style="width: 100%;">
        </div>
      </div>      

      <!-- Страничный вывод -->
      <component-pagination
        v-if="pageableCards?.pages.length"
        class="resource-pagination"
        :info="pageableCards"
        @action="handlePaginationAction">
      </component-pagination>

      <!-- Карточки -->
      <component-cards
        v-if="cards?.length"
        class="resource-cards"
        :cards="cards">
        <template #card="{ card, cardOptions }">
          <header class="card-hero-header" style="margin-bottom: 0">
            <div class="card-hero-info">
              <h3 class="card-hero-info__name">
                <span>{{ card.name }}</span>
                <span 
                  class="card-hero-info__fallen" 
                  title="Погиб. Вечная память герою"
                  v-if="card.fallen">
                </span>
              </h3>
              <div class="card-hero-info__rank">{{ card.rank }}</div>
              <component-card-hero-awards :awards="card.awards"></component-card-hero-awards>
            </div>
          </header>
          <section class="card-hero-resource" v-for="(resource, key) in card.resources">

            <div 
              class="card-hero-resource__toggle" 
              @click="cardOptions[key + 'ShowDetails'] = !cardOptions[key + 'ShowDetails']">
              <div>{{ getResourceTitle(key) }}</div>
              <component-toggle-expand-collapse
                position="top right" 
                v-model="cardOptions[key + 'ShowDetails']">
              </component-toggle-expand-collapse>
            </div>

            <div 
              v-if="cardOptions[key + 'ShowDetails']" 
              class="card-hero-resource__details">

              <component-card-hero-image 
                :src="card.getPhoto(key)" 
                position="top">
              </component-card-hero-image>

              <div v-html="getCardStoryHtml(card, key)"></div>

              <div>&nbsp;</div>
            </div>
          </section>
        </template>
      </component-cards>

      <!-- Страничный вывод -->
      <component-pagination
        v-if="pageableCards?.pages.length"
        class="resource-pagination"
        :info="pageableCards"
        @action="handlePaginationAction">
      </component-pagination>

    </div>
  `,
  inject: ['library'],
  components: {
    ComponentCards,
    ComponentCardHeroAwards,
    ComponentCardHeroImage,
    ComponentPagination,
    ComponentToggleExpandCollapse,
  },
  data () {
    return {
      pageableCards: null,
      cards: null,
      sortBy: 'default',
      dirBy: 'asc',
      filterBy: ''
    };
  },
  watch: {
    'library.list': {
      handler (list) {
        console.log('library changed', list);
      },
      deep: true,
      immediate: true,
    },
    sortBy () {
      this.handleChangeListView()
    },
    dirBy () {
      this.handleChangeListView()
    },
    filterBy () {
      clearTimeout(this.filterByTimeout);
      this.filterByTimeout = setTimeout(() => {
        console.log('filter', this.filterBy);
        this.handleChangeListView();
      }, 300);
    }
  },
  created () {
    console.log('Library created');
  },
  mounted () {
    // Первоначальная подгрузка карточек библиотеки
    this.library.onReady(({ list }) => {
      this.pageableCards = new Pageable({ items: list, limit: 15, });
      this.cards = this.pageableCards.page;
    });
  },
  methods: {
    handlePaginationAction (action) {
      this.cards = this.pageableCards[action]();
    },
    handleChangeListView () {
      this.library.onReady(({ list }) => {
        // Сначала фильтр
        let filtered = this.listFilterBy(this.filterBy, list.slice(0));
        // Затем сортировка
        let sorted = this.listSortBy(this.sortBy, this.dirBy === 'asc' ? 1 : -1, filtered);
        // Перестройка пагинации
        this.pageableCards = new Pageable({ items: sorted, limit: 15 });
        this.cards = this.pageableCards.page;
      });
    },
    listFilterBy (query, items) {
      return items.filter(item => {
        return JSON.stringify(item).toLowerCase().match(query.toLowerCase());
      });
    },
    listSortBy (field, direction = 1, items) {
      return items.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        if (field === 'lastName') {
          aVal = a.name.split(/\s+/g)[1];
          bVal = b.name.split(/\s+/g)[1]
        } else if (field === 'rank') {
          aVal = Ranks[a.rank].level;
          bVal = Ranks[b.rank].level;
        } else if (field === 'default') {
          aVal = items.indexOf(a);
          bVal = items.indexOf(b);
        }
        if (aVal > bVal) {
          return 1 * direction;
        } else if (aVal < bVal) {
          return -1 * direction;
        } else {
          return 0;
        }
      });
    },
    getResourceTitle (key) {
      const titles = {
        ancestor: '#ПредковДостойны',
        'telegram.mod_russia': 'Телеграм минобороны РФ',
      };
      return titles[key] || Routes[key]?.title || key;
    },
    getCardStoryHtml (card, key) {
      let resourceKey = key.match(/\./) ? key.split('.')[1] : key;
      return card.getStoryHtml(resourceKey);
    }
  }
};
