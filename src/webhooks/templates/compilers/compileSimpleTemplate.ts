export function compileSimpleTemplate<T>(
  templateString: string,
  data: T = {} as any
): string {
  // Remove any new lines at the beginning of the string.
  templateString = templateString.replace(/^\n{1,}/, '');

  // Replace tokens with values, if any
  Object.entries(data).forEach(([name, value]) => {
    templateString = templateString.replace(`{{${name}}}`, value);
  });

  return templateString;
}
