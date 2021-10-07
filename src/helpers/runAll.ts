type AnyArgs = any[];
type AnyArgsFunction = (...args: AnyArgs) => void;

/**
 * Takes an array of functions with any number of arguments
 * and executes them. If a function throws, the loop will
 * still complete and the erroring function `name` logged to `stderr`,
 * if logging is enabled (defaults to `true`).
 *
 * @param functions
 * @returns void
 */
export function runAll(functions: AnyArgsFunction[]): AnyArgsFunction {
  return (...args: AnyArgs): void => {
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
