import recognizeRank from '../../node_modules/@russian-ref/ranks/recognize.js';
import recognizeAwards from '../../node_modules/@russian-ref/awards/recognize.js';
import { capitalize } from '../../utils/common.js';
import Hero from '../../utils/hero.js';
import { 
  getRemoteItems,  
  getRemoteDocument, 
  getRootFragment,
} from '../../utils/resource.js';
import ComponentCardHeroAwards from '../card-hero-awards.js';
import ComponentCardHeroImage from '../card-hero-image.js';
import ComponentToggleExpandCollapse from '../toggle-expand-collapse.js';
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
      <template #card="{ card, cardOptions }">
        <header class="card-hero-header" :class="{ 
          'show-details': cardOptions.showDetails
        }" @click="actionShowLibrary(card)" style="cursor: pointer;">
          <component-card-hero-image 
            :src="card.getPhoto('zmil')" 
            position="top">
          </component-card-hero-image>
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
          <!-- 
            Нужен компонент или алгоритм, который:
            - ищет по id соответствующего героя
            - если не находит, предлагает создать
            - если находит, сравнивает и показывает есть ли разница
            - можно открыть редактор героя, слева будет исходная карточка, а 
              справа герой с полной информацией, который можно при желании
              отредактировать (обновить с информацией из карточки). Там показано
              равны ли поля. Если нет карточки, то просто редактирование героя.

            Как назвать эти компоненты. На какие разрезать?

            - Компонент базы данных. Команды создания, измения и удаления
            - Компонент основной работы с героями. На выходе подает данные на базу данных.

            Основная работа — это обновление информации о героях. Создание новых. 
            Добавление новой информации в соотв. ресурсы.
           -->

          <component-toggle-expand-collapse
            position="bottom right" 
            v-model="cardOptions.showDetails">
          </component-toggle-expand-collapse>

          <!-- <div class="card-action" position="top right">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user-check" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <circle cx="9" cy="7" r="4" />
              <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
              <path d="M16 11l2 2l4 -4" />
            </svg>
          </div> -->

        </header>
        <section class="card-hero-story" v-if="cardOptions.showDetails">
          <div class="pre-line">{{ card.getStory('zmil') }}</div>
        </section>
      </template>
    </ComponentResource>
  `,
  components: {
    ComponentCardHeroAwards,
    ComponentCardHeroImage,
    ComponentToggleExpandCollapse,
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
    actionShowLibrary (card) {
      console.log('actionShowLibrary');

      this.$emit('open-modal', {
        modal: Vue.markRaw(ModalDiffHero),
        props: { 
          card,
          okCallback: () => {
            console.log('ok', this);
          },
          cancelCallback: () => {
            console.log('cancel', this);
          }
        }
      });

    },
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
