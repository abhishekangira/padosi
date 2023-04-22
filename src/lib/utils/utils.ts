export function debounce(func: Function, wait: number) {
  var timeout: NodeJS.Timeout | null;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      func.apply(this, arguments);
    }, wait);
  };
}
