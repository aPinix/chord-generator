/**
 * Converts a string to title case.
 *
 * This function handles various input formats:
 * - Splits words by hyphens and underscores
 * - Adds spaces before uppercase letters (camelCase to Title Case)
 * - Capitalizes the first letter of each word
 * - Lowercases the rest of each word
 *
 * @param str - The input string to convert
 * @returns The input string converted to title case
 *
 * @example
 * stringToTitleCase('hello-world'); // "Hello World"
 * stringToTitleCase('myVariableName'); // "My Variable Name"
 * stringToTitleCase('another_example_here'); // "Another Example Here"
 * stringToTitleCase('simpleTest'); // "Simple Test"
 */
export const stringToTitleCase = (str: string): string => {
  return str
    .split(/[-_]/)
    .map((word) => word.replace(/([A-Z])/g, ' $1').trim())
    .join(' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Converts a string to kebab case.
 *
 * This function handles various input formats:
 * - Replaces camelCase with kebab-case
 * - Replaces spaces and underscores with hyphens
 * - Lowercases the entire string
 *
 * @param str - The input string to convert
 * @returns The input string converted to kebab case
 *
 * @example
 * stringToKebabCase('helloWorld'); // "hello-world"
 * stringToKebabCase('Hello World'); // "hello-world"
 * stringToKebabCase('another_example_here'); // "another-example-here"
 * stringToKebabCase('simpleTest'); // "simple-test"
 */
export const stringToKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Converts a string to SCREAMING_SNAKE_CASE.
 *
 * This function handles various input formats:
 * - Replaces camelCase with SCREAMING_SNAKE_CASE
 * - Replaces spaces and hyphens with underscores
 * - Uppercases the entire string
 *
 * @param str - The input string to convert
 * @returns The input string converted to SCREAMING_SNAKE_CASE
 *
 * @example
 * stringToScreamingSnakeCase('helloWorld'); // "HELLO_WORLD"
 * stringToScreamingSnakeCase('Hello World'); // "HELLO_WORLD"
 * stringToScreamingSnakeCase('another-example-here'); // "ANOTHER_EXAMPLE_HERE"
 * stringToScreamingSnakeCase('simpleTest'); // "SIMPLE_TEST"
 */
export const stringToScreamingSnakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toUpperCase()
    .replaceAll('-', '_');
};

/**
 * Generates a random string ID.
 *
 * This function creates a pseudo-random string by converting a random number
 * to base 36 (which includes numbers and lowercase letters) and removing the
 * leading "0." from the result.
 *
 * @returns A random string that can be used as an ID.
 *
 * @example
 * stringRandomId(); // "a65d70f9-d8bb-4a84-b73a-148b400c7814"
 * stringRandomId(); // "c580d10a-6e91-42aa-9d9e-6b819c1f7c09"
 */
export const stringRandomId = (): string => {
  return crypto.randomUUID();
};

/**
 * Extracts the initials from a given string.
 *
 * This function splits the input string by spaces, takes the first character
 * of each word, and joins them together to form the initials.
 *
 * @param str - The input string to extract initials from
 * @returns The initials of the input string
 *
 * @example
 * stringGetInitials('John Doe'); // "JD"
 * stringGetInitials('Jane Ann Smith'); // "JAS"
 * stringGetInitials('Single'); // "S"
 * stringGetInitials('multiple words here'); // "mwh"
 */
export const stringGetInitials = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word.charAt(0))
    .join('');
};

/**
 * Converts a string to a local storage key.
 *
 * This function handles various input formats:
 * - Converts to lower-kebab-case
 * - Converts to screaming-snake-case
 *
 * @param str - The input string to convert
 * @param variant - The variant to convert to
 * @returns The input string converted to the local storage key
 *
 * @example
 * stringToLocalStorageKey('helloWorld', 'lower-kebab'); // "hello-world"
 * stringToLocalStorageKey('helloWorld', 'screaming-snake'); // "HELLO_WORLD"
 */
export const stringToLocalStorageKey = (
  str: string,
  variant: 'lower-kebab' | 'screaming-snake' = 'lower-kebab'
): string => {
  if (variant === 'lower-kebab') {
    return stringToKebabCase(str);
  }

  return stringToScreamingSnakeCase(str);
};
