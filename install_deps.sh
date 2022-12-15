#!/bin/bash
set -euo pipefail # http://redsymbol.net/articles/unofficial-bash-strict-mode/

cd "$(dirname "$0")"
pushd frontend
yarn install
popd

pushd backend
python3 -m venv .venv
source .venv/bin/activate
make install
popd