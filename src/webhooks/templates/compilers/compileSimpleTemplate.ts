export function compileSimpleTemplate<T>(
  templateString: string,
  data: T
): string {
  let output: string = '';

  Object.entries(data).forEach(([name, value]) => {
    output = templateString.replace(`{{${name}}}`, value);
  });

  return output;
}
