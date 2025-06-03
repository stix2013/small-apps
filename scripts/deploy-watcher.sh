#!/bin/env bash
# echo "$PWD"
# pnpm build:apps

#
pnpm cleanup
pnpm install

# build
pnpm prepack && pnpm --filter @yellow-mobile/watcher build:prod

# deploy
pnpm --filter @yellow-mobile/watcher deploy --prod $PWD/dist/watcher

