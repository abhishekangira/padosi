export function debounce(func: Function, wait: number): (...args: any[]) => Promise<any> {
  let timeout: string | number | NodeJS.Timeout | undefined;

  return function (this: any, ...args: any[]): Promise<any> {
    clearTimeout(timeout);

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        const result = func.apply(this, args);
        resolve(result);
      }, wait);
    });
  };
}
