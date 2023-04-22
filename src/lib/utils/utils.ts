export function debounce(func: Function, wait: number): Function {
  let timeout: string | number | NodeJS.Timeout | undefined;
  
  return function() {
    const context = this;
    const args = arguments;
    
    clearTimeout(timeout);
    
    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        const result = func.apply(context, args);
        resolve(result);
      }, wait);
    });
  };
}