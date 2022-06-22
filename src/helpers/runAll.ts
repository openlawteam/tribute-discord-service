type AnyArgs<T = any> = T[];
type AnyArgsFunction<T = any> = (...args: AnyArgs<T>) => void;

/**
 * Takes an array of functions with any number of arguments
 * and executes them. If a function throws, the loop will
 * still complete and the erroring function `name` logged to `stderr`,
 * if logging is enabled (defaults to `true`).
 *
 * @param functions
 * @returns void
 */
export function runAll<TArgs = any>(
  functions: AnyArgsFunction<TArgs>[]
): AnyArgsFunction<TArgs> {
  return function runAllEach(...args: AnyArgs<TArgs>): void {
    functions.forEach((f) => {
      try {
        f(...args);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `\`runAll\`: There was an error while running a function: "${
              f.name
            }".\n${error.stack || error}`
          );
        }
      }
    });
  };
}
