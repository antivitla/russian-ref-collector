import { SexType } from '../node_modules/@russian-ref/sex/sex.js';
import recognizeSex from '../node_modules/@russian-ref/sex/recognize.js';
import { FemaleNames, MaleNames } from '../node_modules/@russian-ref/names/names.js';
import recognizeName from '../node_modules/@russian-ref/names/recognize.js';
import recognizeRank from '../node_modules/@russian-ref/ranks/recognize.js';
import recognizeAwards from '../node_modules/@russian-ref/awards/recognize.js';

export default class Hero {
  constructor ({ name, rank, awards, group, sex, fallen, role, tags, experience, resources } = {}) {
    // Должно быть в порядке Имя и фамилия - валидация
    this.name = Hero.parseName(name);
    // Звание должно быть провалидировано и точно валидным
    this.rank = Hero.parseRank(rank);
    // Награды должны быть валидными
    this.awards = Hero.parseAwards(awards);
    // Группа (может не делать?)
    this.group = Hero.parseGroup(group);
    // Пол
    this.sex = Hero.parseSex(sex, this.name);
    // Погиб
    this.fallen = Hero.parseFallen(fallen);
    // Роль в бою (особой проверки нет)
    this.role = Hero.parseRole(role);
    // Теги
    this.tags = Hero.parseTags(tags);
    // Опыт
    this.experience = Hero.parseExperience(experience);
    // Информация дополнительных ресурсов
    this.resources = Hero.parseResources(resources);
  }

  getId (resource) {
    if (!resource) {
      return Object.values(this.resources).find(resource => resource.id)?.id;
    } else {
      return this.resources[resource]?.id;
    }
  }

  getIds () {
    return Object.values(this.resources).map(resource => resource.id).filter(id => id);
  }

  getPhoto (resource) {
    if (!resource) {
      return Object.values(this.resources).find(resource => resource.photo)?.photo;
    } else {
      return this.resources[resource].photo;
    }
  }

  getStory (resource) {
    if (!resource) {
      return Object.values(this.resources).find(resource => resource.story)?.story;
    } else {
      return this.resources[resource]?.story;
    }
  }

  getStoryHtml (resource) {
    let story = this.getStory(resource);
    if (!story) {
      return '';
    }
    if (story.match(/<p|<br/g)) {
      return story;
    } else {
      return `<p>${story.replace(/\n+/g, '</p><p>')}</p>`;
    }
  }

  static parseName (name = '') {
    return name;
  }

  static parseRank (rank = '') {
    return recognizeRank(rank);
  }

  static parseAwards (awards = '') {
    if (Array.isArray(awards)) {
      return awards.map(award => {
        return recognizeAwards(award)[0];
      }).filter(award => award);
    } else {
      return recognizeAwards(awards);
    }
  }

  static parseGroup (group = []) {
    return group;
  }

  static parseSex (sex, name) {
    let parsedSex;
    if (sex) {
      parsedSex = recognizeSex(sex);
    }
    if (!parsedSex && name) {
      if (MaleNames[name]) {
        parsedSex = SexType.MALE;
      } else if (FemaleNames[name]) {
        parsedSex = SexType.FEMALE;
      }
    }
    if (!parsedSex) {
      parsedSex = SexType.MALE;
    }
    return parsedSex;
  }

  static parseFallen (fallen = false) {
    return !!fallen;
  }

  static parseRole (role = '') {
    return role;
  }

  static parseTags (tags = []) {
    return tags;
  }

  static parseExperience (experience = []) {
    return experience;
  }

  static parseResources (resources = {}) {
    return resources;
  }
}