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

export function clone (object) {
  return JSON.parse(JSON.stringify(object));
}

