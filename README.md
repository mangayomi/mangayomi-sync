# CozyFurnace

The self-hosted sync server for Mangayomi.

## Requirements

- Node.js (18 or higher)
- MySQL Server (tested and working with Version 8.0.29)
- [pnpm](https://pnpm.io/) (you can also use the normal npm if you prefer it)

## Setup

1. copy the .env.dist file to a new .env file in the same directory
2. add the secret key for JWT (just auto generate a long string) and the MySQL Connection URI
3. run the following commands:

```
pnpm i
pnpm run buildstart
```
