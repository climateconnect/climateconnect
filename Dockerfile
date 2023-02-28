FROM python:3.9

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
SHELL ["/bin/bash", "--login", "-c"]
WORKDIR /workspace/
COPY backend/requirements.txt /workspace/backend/
RUN cd backend && pip install -r requirements.txt

# Install node and frontend packages
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
RUN nvm install 17.1.0
RUN nvm alias default 17.1.0
RUN nvm use default
# Install yarn
RUN npm install --global yarn
COPY frontend/package.json /workspace/frontend/
RUN cd frontend && yarn install

# Install Postgres and redis tools
RUN apt-get update && apt-get -y install postgresql-client postgis redis-tools

COPY . /workspace/



# FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# # [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends postgresql-client redis-tools python3-venv binutils libproj-dev gdal-bin python3 python3-dev

# # [Optional] Uncomment if you want to install an additional version of node using nvm
# # ARG EXTRA_NODE_VERSION=10
# # RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"