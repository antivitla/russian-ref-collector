export async function getRemoteItems ({ selector, getUrl, mapInfo, type = 'html' }) {
  let done = false;
  let pageIndex = 0;
  let list = [];
  let url = getUrl(pageIndex, []);
  while (!done && url) {
    let nodes;
    if (type === 'html') {
      const html = await getRemoteDocument(url);
      if (!html) {
        done = true;
        break;
      }
      const fragment = getRootFragment(html);
      nodes = Array.from(fragment.querySelectorAll(selector));
    } else if (type = 'json') {
      const json = await getRemoteDocument(url, 'json');
      if (!json) {
        done = true;
        break;
      }
      nodes = querySelectorObject(json, selector);
    } else {
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: {
          message: `Ошибка от <strong>getRemoteItems</strong> — тип ресурса ${type} неизвестен`
        }
      }));
      break;
    }
    if (!nodes.length) {
      done = true;
      break;
    }
    list = list.concat(nodes);
    pageIndex += 1;
    url = getUrl(pageIndex, nodes);
  }
  return list.map(mapInfo);
}

export async function postRemoteItems ({ selector, contentType, getUrl, getBody, mapInfo }) {
  let done = false;
  let pageIndex = 0;
  let list = [];
  let url = getUrl(pageIndex, []);
  let body = getBody(pageIndex, []);
  while (!done) {
    const html = await postRemoteDocument(url, body, contentType);
    const fragment = getRootFragment(html);
    const nodes = Array.from(fragment.querySelectorAll(selector));
    list = list.concat(nodes);
    if (!nodes.length) {
      done = true
    } else {
      pageIndex += 1;
      url = getUrl(pageIndex, nodes);
    }
  }
  return list.map(mapInfo);
}

export async function getRemoteDocument (url, type = 'text', charset = 'utf-8') {
  const params = new URLSearchParams({ url, charset });
  return await fetch(`api/fetch.php?${params.toString()}`).then(response => {
    if (response.ok) {
      return type === 'json' ? response.json() : response.text();
    } else {
      dispatchResponseError('getRemoteDocument', response);
      return '';
    }    
  });
}

export async function postRemoteDocument (url, body, contentType = 'application/x-www-form-urlencoded', charset = 'utf-8', type = 'text') {
  const params = new URLSearchParams({ url, charset });
  return await fetch(`api/post.php?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: contentType === 'application/x-www-form-urlencoded' 
      ? new URLSearchParams(body).toString()
      : JSON.stringify(body)
  }).then(response => {
    if (response.ok) {
      return type === 'json' ? response.json() : response.text();
    } else {
      dispatchResponseError('postRemoteDocument', response);
      return '';
    }
  });
}

export async function getLocalDocument (url, type, silent = false) {
  return fetch(url).then(response => {
    if (response.ok) {
      return type === 'json' ? response.json() : response.text();
    } else if (!silent) {
      dispatchResponseError('getLocalDocument', response);
    }
    return type === 'json' ? {} : '';
  });
}

export async function saveLocalDocument (saveTo, document) {
  const params = new URLSearchParams({ saveTo });
  return await fetch(`api/save.php?${params.toString()}`, {
    method: 'POST',
    body: typeof document !== 'string' ? JSON.stringify(document, null, '  ') : document
  }).then(response => {
    if (response.ok) {
      return response.text();
    } else {
      dispatchResponseError('saveLocalDocument', response);
      return '';
    }
  })
}

export async function deleteLocalDocument (deleteFrom) {
  const params = new URLSearchParams({ deleteFrom });
  return await fetch(`api/delete.php?${params.toString()}`, {
    method: 'DELETE'
  }).then(response => {
    if (response.ok) {
      return response.text();
    } else {
      dispatchResponseError('deleteLocalDocument', response);
      return '';
    }
  });
}

export function getRootFragment (html) {
  const root = html.split(/<body[^>]*>/).slice(-1)[0].split(/<\/body>/)[0];
  const template = document.createElement('template');
  template.innerHTML = root;
  return template.content;
}

export function querySelectorObject (obj, selector) {
  return selector.split('.').reduce((result, field) => {
    return result[field];
  }, obj);
}

export function dispatchResponseError (type, response) {
  response.text().then(text => {
    window.dispatchEvent(new CustomEvent('app-error', {
      detail: {
        message: `Ошибка от <strong>${type}</strong> — ${response.status} ${response.statusText}<br>${text}`
      }
    }));
  });
}

