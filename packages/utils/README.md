# @yellow-mobile/utils

This package provides a collection of miscellaneous utility functions designed to be used across various Yellow Mobile projects. It includes helpers for common tasks such as string manipulation, date/time operations, data conversion, and more.

## Installation

To install the `@yellow-mobile/utils` package, you can use pnpm:

```bash
pnpm add @yellow-mobile/utils
```

## Usage

You can import the functions you need directly from the package:

```typescript
import { capitalized, delay, getCurrencySymbol } from '@yellow-mobile/utils';

// Capitalize a word
const myWord = "hello";
const capitalizedWord = capitalized(myWord); // "Hello"
console.log(capitalizedWord);

// Delay execution
async function exampleDelay() {
  console.log("Starting delay...");
  await delay(2000); // Delays for 2 seconds
  console.log("Delay finished.");
}
exampleDelay();

// Get a currency symbol
const usdSymbol = getCurrencySymbol("USD"); // "$"
console.log(usdSymbol);

const eurSymbol = getCurrencySymbol("EUR"); // "€"
console.log(eurSymbol);
```

## Available Utilities

This package exports the following modules and functions:

*   `addressGoogleMap`: Utilities for Google Maps addresses.
*   `capitalized`: Capitalizes the first letter of a string.
*   `checkNonNullOrDefined`: Checks if a value is not null or undefined.
*   `colors`: Utilities for working with colors.
*   `compareAmount`: Compares two amounts.
*   `const`: Various constants.
*   `converters`: Utilities for data conversion (e.g., array to string, float, bytes).
*   `coverage`: Utilities related to coverage data.
*   `createInitListState`: Creates an initial list state.
*   `currencySymbols`: Provides functions to get currency symbols (e.g., `getCurrencySymbol`, `getSymbol`).
*   `delay`: Delays execution for a specified duration.
*   `image`: Utilities for image manipulation.
*   `normalizePath`: Normalizes a file path.
*   `path`: Utilities for working with paths.
*   `timeout`: Sets a timeout for promises.
*   `useLogger`: Provides a logger instance.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the project repository.

## License

This package is distributed under the ISC License. See the LICENSE file in the project root for more information.
