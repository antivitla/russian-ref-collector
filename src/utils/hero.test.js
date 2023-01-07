import Hero from './hero.js';

test('hero validators', () => {
  let hero = new Hero({ rank: 'чвк'});
  expect(hero.rank).toBe('Сотрудник ЧВК');

  hero = new Hero({ rank: 'вагнеровец'});
  expect(hero.rank).toBe('Сотрудник ЧВК');

  hero = new Hero({ name: 'вася'});
  expect(hero.sex).toBe('Мужчина');

  hero = new Hero({ name: 'катя'});
  expect(hero.sex).toBe('Женщина');

  hero = new Hero({ sex: 'dfdf', name: 'даша'});
  expect(hero.sex).toBe('Женщина');

  hero = new Hero({ rank: 'лейтенант' });
  expect(hero.rank).toBe('Лейтенант');

  hero = new Hero({ rank: 'лейтенант гвардии' });
  expect(hero.rank).toBe('Гвардии лейтенант');

  hero = new Hero({ rank: 'генерал-майор гвардии' });
  expect(hero.rank).toBe('Гвардии генерал-майор');

  hero = new Hero({ awards: ['герой россии'] });
  expect(hero.awards).toEqual(['Герой Российской Федерации']);

  hero = new Hero({ awards: ['герой рф', 'орден мужества'] });
  expect(hero.awards).toEqual(['Герой Российской Федерации', 'Орден Мужества']);

  hero = new Hero({ awards: ['герой рф', 'неясная награда'] });
  expect(hero.awards).toEqual(['Герой Российской Федерации']);

  hero = new Hero({ awards: 'герой рф, орден суворова, непонятное медаль ордена родителя' });
  expect(hero.awards).toEqual(['Герой Российской Федерации', 'Медаль ордена «Родительская слава»', 'Орден Суворова']);
});