export default {
  template: /*html*/`
    <li class="card">
      <slot name="card" :card="card" :card-options="cardOptions">
        <h3>{{ card.name }}</h3>
        <p>{{ card.rank }}</p>
      </slot>
    </li>
  `,
  props: {
    card: {
      type: Object, Number,
      default: {}
    }
  },
  data () {
    return {
      cardOptions: {},
    }
  },
}
