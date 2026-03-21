#!/usr/bin/env bash
set -euo pipefail

rm -rf dist deploy/generated node_modules

printf 'Removed generated workspace artifacts: dist deploy/generated node_modules\n'
