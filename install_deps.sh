#!/bin/bash
set -euo pipefail # http://redsymbol.net/articles/unofficial-bash-strict-mode/

cd "$(dirname "$0")"
pushd frontend
yarn install
popd

pushd backend
pdm use python3.12
pdm install
popd
