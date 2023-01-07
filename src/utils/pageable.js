import { fakeDelayedResponse } from './common.js';

export class Pageable {
  constructor ({ items, pages, limit = 10, index = 0 }) {
    this.limit = limit;
    this.index = index;

    if (pages) {
      this.pages = pages;
      this.items = this.pages.reduce((items, page) => {
        return items.concat(page);
      }, []);
    } else if (items) {
      this.pages = Pageable.from(items, limit).pages;
      this.items = items;
    } else {
      throw 'Для создания Pageable нет страниц или элементов';
    }
  }

  static from (items, limit) {
    const pages = [];
    let offset = 0;
    while (offset <= items.length - 1) {
      pages.push(items.slice(offset, offset + limit));
      offset += limit;
    }
    return new Pageable({ pages, limit });
  }

  get page () {
    return this.pages[this.index] || [];
  }

  get total () {
    return this.pages.length;
  }

  get isFirstPage () {
    return this.index === 0;
  }

  get isLastPage () {
    return this.index >= this.pages.length - 1;
  }  

  setLimit (limit) {
    this.limit = limit;
    this.pages = Pageable.from(this.items, this.limit);
    this.index = 0;
  }

  first () {
    this.index = 0;
    return this.page;
  }

  last () {
    this.index = this.pages.length - 1;
    return this.page;
  }

  next () {
    if (this.index < this.pages.length - 1) {
      this.index += 1;
      return this.page;
    }
    return null;
  }

  previous () {
    if (this.index > 0) {
      this.index -= 1;
      return this.page;
    }
    return null;
  }
}

export class AsyncPageable {
  constructor ({ 
    items, 
    limit = 10,
    index = 0,
    asyncMapInfo = async (item) => fakeDelayedResponse(item, 300),
  }) {
    this.asyncMapInfo = asyncMapInfo;
    this.pageable = new Pageable({ items, limit, index });
  }

  get limit () {
    return this.pageable.limit;
  }

  get index () {
    return this.pageable.index;
  }

  get total () {
    return this.pageable.pages.length;
  }

  get pages () {
    return this.pageable.pages;
  }

  get items () {
    return this.pageable.items;
  }

  async getPage (type) {
    if (typeof type === 'number') {
      this.pageable.index = type;
    } else if (typeof type === 'string') {
      this.pageable[type]();
    }
    // wait for each item
    // const items = [];
    // return await Promise.all(
    //   this.pageable.page.map((item, index) => {
    //     return this.asyncMapInfo(item, index).then(info => {
    //       items.push(info);
    //     });
    //   })
    // ).then(() => items);
    const items = [];
    let index = 0;
    while (index <= this.pageable.page.length - 1) {
      const info = await this.asyncMapInfo(this.pageable.page[index], index, this.pageable.page);
      items.push(info);
      index += 1;
    }
    return items;
  }

  get json () {
    return {
      items: this.items,
      limit: this.limit,
      index: this.index,
    }
  }
}

