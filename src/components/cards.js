import ComponentCard from './card.js';

export default {
  template: /*html*/ `
    <ul class="cards">
      <component-card 
        v-for="card in cards" 
        :card="card">
        <template #card="{ card }">
          <slot name="card" :card="card">Заглушка карточки на уроне cards.js</slot>
        </template>
      </component-card>
    </ul>
  `,
  props: {
    cards: {
      type: Array,
      default: []
    }
  },
  components: {
    ComponentCard,
  }
}