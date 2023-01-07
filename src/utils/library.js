import { getLocalDocument } from './resource.js';

export default class Library {
  constructor ({ 
    url, 
    createMapCallback,
    createItemCallback = (data) => data,
  }) {
    this.url = url;
    this.list = null;
    this.map = null;
    this.createItemCallback = createItemCallback;
    this.createMapCallback = createMapCallback;
    // Добавляем интерфейс событий
    this.bus = document.createDocumentFragment();
    [
      'addEventListener',
      'removeEventListener',
      'dispatchEvent',
    ].forEach(method => {
      this[method] = (...args) => this.bus[method](...args);
    });
    // Начальная загрузка базы библиотеки
    this.loadPromise = new Promise(resolve => {
      this.loadPromiseResolve = resolve;
    });
    this.load();
  }

  async load () {
    // Получаем список
    let list = await getLocalDocument(this.url, 'json');
    if (this.createItemCallback) {
      list = list.map(this.createItemCallback);
    }
    this.list = list;
    // Получаем индекс (словарь)
    if (this.createMapCallback) {
      this.map = list.reduce(this.createMapCallback, {});
    }
    // Экспорт данных
    let data = {
      list: this.list,
      map: this.map,
    };
    this.loadPromiseResolve(data);
    this.dispatchEvent(new CustomEvent('load', { detail: data }));
  }

  async onReady (callback) {
    return this.loadPromise.then(callback);
  }

}