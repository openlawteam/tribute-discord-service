import {compileSimpleTemplate} from '.';

type TestTemplateDataType = {thing?: string; day?: string};

const TEMPLATE_WITH_TOKENS: string = `
Hello, {{thing}}.

What a great {{day}} it is!`;

const TEMPLATE_WITH_NEWLINES: string = `



Hello.

What a great week it has been!`;

const TEMPLATE_WITH_NEWLINES_REMOVED: string = `Hello.\n\nWhat a great week it has been!`;

const assertTemplateWithTokenValues = (data: TestTemplateDataType): string =>
  `Hello, ${data.thing || '{{thing}}'}.\n\nWhat a great ${
    data.day || '{{day}}'
  } it is!`;

describe('compileSimpleTemplate unit tests', () => {
  test('should return a compiled string', () => {
    const values = {thing: 'person', day: 'Friday'};
    const partialThing = {thing: 'Honey Badger'};
    const partialDay = {day: 'Tuesday'};

    // Assert all tokens converted to values
    expect(
      compileSimpleTemplate<TestTemplateDataType>(TEMPLATE_WITH_TOKENS, values)
    ).toEqual(assertTemplateWithTokenValues(values));

    // Assert partial
    expect(
      compileSimpleTemplate<TestTemplateDataType>(
        TEMPLATE_WITH_TOKENS,
        partialThing
      )
    ).toEqual(assertTemplateWithTokenValues(partialThing));

    // Assert partial
    expect(
      compileSimpleTemplate<TestTemplateDataType>(
        TEMPLATE_WITH_TOKENS,
        partialDay
      )
    ).toEqual(assertTemplateWithTokenValues(partialDay));
  });

  test('should return an uncompiled string', () => {
    // Assert none
    expect(
      compileSimpleTemplate<TestTemplateDataType>(TEMPLATE_WITH_TOKENS)
    ).toEqual(assertTemplateWithTokenValues({}));

    // Assert none
    expect(
      compileSimpleTemplate<TestTemplateDataType>(TEMPLATE_WITH_TOKENS, {})
    ).toEqual(assertTemplateWithTokenValues({}));
  });

  test('should remove beginning new lines from string', () => {
    // Assert beginning new lines removed
    expect(compileSimpleTemplate(TEMPLATE_WITH_NEWLINES)).toEqual(
      TEMPLATE_WITH_NEWLINES_REMOVED
    );
  });
});
