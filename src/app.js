// Assume Vue/Pinia loaded earlier by <script>
import { capitalize } from './utils/common.js';
import Hero from './utils/hero.js';
import Library from './utils/library.js';
import ComponentResourceZmil from './components/zmil/resource.js';
import ComponentResourceWarheroes from './components/warheroes/resource.js';
import ComponentResourceTsargrad from './components/tsargrad/resource.js';
import ComponentResourceKontingent from './components/kontingent/resource.js';
import ComponentResourceTelegram from './components/telegram/resource.js';
import ComponentLibrary from './components/library.js';

import ComponentTabs from './components/tabs.js';

export const Routes = {
  'zmil': { 
    path: '/zmil',
    resourceKey: 'zmil',
    title: 'Минобороны РФ',
    subtitle: 'z.mil.ru',
    component: ComponentResourceZmil, 
  },
  'warheroes': { 
    path: '/warheroes',
    resourceKey: 'warheroes',
    title: 'Герои России',
    subtitle: 'warheroes.ru',
    component: ComponentResourceWarheroes, 
  },
  'tsargrad': {
    path: '/tsargrad',
    resourceKey: 'tsargrad',
    title: 'Царьград',
    subtitle: 'ug.tsargrad.tv',
    component: ComponentResourceTsargrad,
  },
  'kontingent': {
    path: '/kontingent',
    resourceKey: 'kontingent',
    title: 'Контингент',
    subtitle: 'kontingent.press',
    component: ComponentResourceKontingent,
  },
  'telegram.mod_russia': {
    path: '/telegram.mod_russia',
    resourceKey: 'telegram.mod_russia',
    title: 'Минобороны РФ',
    subtitle: '@mod_russia',
    component: ComponentResourceTelegram,
    options: { channel: 'mod_russia' },
  },
  'telegram.zakharprilepin': {
    path: '/telegram.zakharprilepin',
    resourceKey: 'telegram.zakharprilepin',
    title: 'Захар Прилепин',
    subtitle: '@zakharprilepin',
    component: ComponentResourceTelegram,
    options: { channel: 'zakharprilepin' },
  },
  'telegram.rabotaembrat': {
    path: '/telegram.rabotaembrat',
    resourceKey: 'telegram.rabotaembrat',
    title: 'Работаем, брат!',
    subtitle: '@rabotaembrat',
    component: ComponentResourceTelegram,
    options: { channel: 'rabotaembrat' },
  },
  'telegram' (channel = 'default') {
    return {
      path: `/telegram.${channel}`,
      resourceKey: `telegram.${channel}`,
      title: capitalize(channel),
      subtitle: `t.me/${channel}`,
      component: ComponentResourceTelegram,
      options: { channel },
    };
  },
  'library': {
    resourceKey: 'library',
    path: '/library',
    title: 'Библиотека',
    subtitle: 'heroes.json',
    component: ComponentLibrary
  }
};

function resolveRoute (key, routes) {
  if (!routes[key] && key.match(/telegram/)) {
    return routes['telegram'](key.trim().split(/\./)[1]);
  } else {
    return routes[key] || routes['zmil'];
  }
}

const app = Vue.createApp({
  template: /*html*/`
    <header>
      <h1>Сборщик героев</h1>
      <p>Инструмент сбора и подготовки информации о героях специальной военной операции на Украине в формате <strong>JSON</strong> с доступом к ней любому желающему.</p>
    </header>
    <!-- Tabs -->
    <component-tabs 
      class="resource-tabs"
      :tabs="tabs.list" 
      v-model="tabs.current">
    </component-tabs>
    <!-- Resource -->
    <keep-alive>
      <component 
        :is="tabs.current.component"
        :resource-key="tabs.current.resourceKey"
        :options="tabs.current.options"
        @open-modal="handleOpenModal">
      </component>
    </keep-alive>
    <!-- Modal -->
    <component 
      :is="modals[0].modal"
      v-if="modals.length" 
      v-bind="modals[0].props"
      @close="handleCloseModal">
    </component>
  `,
  components: {
    ComponentTabs,
  },
  provide () {
    return {
      library: new Library({
        url: 'russian-ref-heroes/heroes.json',
        createItemCallback (data) {
          return new Hero(data);
        },
        createMapCallback (map, item) {
          if (!map[item.name]) {
            map[item.name] = [];
          }
          map[item.name].push(item);
          return map;
        }
      }),
      openModal (options) {
        console.log('open modal', options);
      }
    };
  },
  data () {
    // define initial resources to choose
    const resourceKeys = [
      'zmil',
      'warheroes',
      'tsargrad',
      'kontingent',
      'telegram.mod_russia',
      'telegram.rabotaembrat',
      'telegram.zakharprilepin',
      'library',
    ];
    // additional resource, dynamically from url
    const currentResourceKey = (location.hash.slice(1) || 'zmil').replace(/^\//, '');
    if (!resourceKeys.includes(currentResourceKey)) {
      resourceKeys.push(currentResourceKey);
    }
    // init tabs data
    const tabsList = resourceKeys.map(key => Vue.markRaw(resolveRoute(key, Routes)));
    const tabsCurrent = tabsList.find(route => route.resourceKey === currentResourceKey);

    return {
      tabs: {
        list: tabsList,
        current: tabsCurrent || tabsList[0],
      },
      modals: []
    };
  },
  watch: {
    'tabs.current' (tab) {
      location.hash = `/${tab.resourceKey}`;
    }
  },
  created () {
    console.log('Добро пожаловать в сборщик героев!');
  },
  mounted () {
    window.addEventListener('hashchange', this.handleHashchange);
  },
  unmounted () {
    window.removeEventListener('hashchange', this.handleHashchange);
  },
  methods: {
    handleHashchange () {
      const resourceKey = (location.hash.slice(1) || 'zmil').replace(/^\//, '');
      const resource = Vue.markRaw(resolveRoute(resourceKey, Routes));
      if (this.tabs.list.find(item => item.resourceKey === resource.resourceKey)) {
        this.tabs.current = resource;
      } else {
        this.tabs.list.push(resource);
      }
    },
    handleOpenModal ({ modal, props }) {
      this.modals.unshift({ modal, props });
    },
    handleCloseModal () {
      this.modals.shift();
    }
  }
}).mount('body');
