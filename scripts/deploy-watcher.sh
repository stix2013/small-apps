#!/bin/env bash
# echo "$PWD"
# pnpm build:apps

#
pnpm cleanup
pnpm install

# build
pnpm turbo run build

# deploy
pnpm --filter @yellow-mobile/watcher deploy --prod $PWD/dist/watcher

# mkdir -p $PWD/dist/watcher/prisma
# cp -R $PWD/packages/database/prisma/* $PWD/dist/watcher/prisma/
