# @yellow-mobile/types

This package contains TypeScript type definitions used across Yellow Mobile applications.

## Overview

The type definitions are organized into the following main categories:

- `app`: General application-level types.
- `balance`: Types related to user balances and currency.
- `cdr`: Types related to Call Detail Records.
- `form`: Types for forms and input handling.
- `generic`: Common generic types.
- `links`: Types for navigation links.
- `map`: Types related to maps and geographical data.
- `pages`: Types specific to different application pages.
- `product`: Types for product and service definitions.
- `units`: Types for various units of measurement.
- `user`: Types related to user accounts, profiles, and subscriptions.

## Usage

To use these types in your project, you can import them as follows:

```typescript
import { UserProfile } from '@yellow-mobile/types/user';
import { AppConfig } from '@yellow-mobile/types/app';
// or, if importing from the main index
import { SomeType } from '@yellow-mobile/types';
```

Ensure your project is configured to resolve modules from the `@yellow-mobile` scope.

## Contributing

Contributions to this package are welcome. Please follow the standard contribution guidelines for this project. If you are adding new types, ensure they are placed in the appropriate subdirectory and re-exported from the main `index.ts` file if necessary.
