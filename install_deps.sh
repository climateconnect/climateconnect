cd "$(dirname "$0")"
pushd frontend
yarn install
popd

pushd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
popd