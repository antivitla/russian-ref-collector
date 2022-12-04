export function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function fakeDelayedResponse (response, ms = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(response);
    }, ms);
  });
}

// export async function saveJsonDocument (saveTo, jsonDocument) {
//     if (!jsonDocument) {
//     alert('saveJsonDocument: no document to save, you my loose old data');
//     throw new Error('saveJsonDocument: no document name, you my loose old data');
//   }
//   const params = new URLSearchParams({ saveTo }).toString();
//   return fetch(`api/save.php?${params}`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json;charset=utf-8'
//     },
//     body: JSON.stringify(jsonDocument, null, '  ')
//   }).then(response => {
//     if (response.ok) {
//       return response.text();
//     } else {
//       throw new Error(response.statusText, { cause: response });
//     }
//   });
// }

