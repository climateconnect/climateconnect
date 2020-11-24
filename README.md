# Climate Connect

The code for https://climateconnect.earth.

## Pre-steps

### Postgres

Create a local Postgres database with your own username and password. You will connect to this for your local backend project.

### Docker

We use Docker to run the local Redis server. See the [Docker install docs](https://docs.docker.com/get-docker/) if you don't have it.

## Get Started

We use Python/Django for our backend and Next.js for the frontend.

First, create a Python virtual environment and start it

```sh
python3 -m venv climateconnect_env
cd climateconnect_env
source bin/activate
```

Then clone the GitHub repository

```sh
git clone https://github.com/climateconnect/climateconnect
```

### Backend

After you've cloned the repository, we can set up the local Redis server and backend.

Note: we use Python 3, so for all instructions we insume `python` means `python3`.

#### First Time Setup

1.  Go to backend directory: `cd backend`
1.  Run `pip install -r requirements.txt` to install all backend libraries.
1.  Create `.backend_env` to set environment variables.
    - You can find up to date sample env variables in [`backend/local-env-setup.md`](https://github.com/climateconnect/climateconnect/blob/master/backend/local-env-setup.md).
    - For the [Django `SECRET_KEY`](https://docs.djangoproject.com/en/3.1/ref/settings/#std:setting-SECRET_KEY), run `openssl rand -base64 32` to create a 32 char random secret.
1.  Run `python manage.py migrate` to run Django migrations.
    - Note: This command is used for when you first start, or whenever you are adding or updating database models.

#### Continual Development

1.  Run `docker-compose up`. This will start a Redis server on Docker.
1.  Run `python manage.py migrate` to run Django migrations whenever you are adding or updating database model.s
1.  Run server using `python manage.py runserver`.

#### Testing

If you want to run the test suite, use:

```sh
python manage.py test
```

Run a specific test file or test class:

```sh
python manage.py test <file_path> or <file_path + class_name>
```

### Frontend

1. `cd frontend`
2. `yarn install` to download all npm packages
3. Add a `.env` file for frontend environment variables. You can find variables you need to set in [`/frontend/next.config.js/`](https://github.com/climateconnect/climateconnect/blob/master/frontend/next.config.js)
4. `yarn dev` to start developing

## To Deploy

### Frontend

#### Option 1: GitHub Actions

1. Use GitHub actions to push to a server. A deploy file can be found in `.github/workflows`

#### Option 2: Manually

1. `cd frontend`
2. `yarn --production`
3. `yarn build`
4. `node server.js` OR `next start`

### Backend

1. Make sure your `ENVIRONMENT` env variable is set to `production`
2. Follow steps 1-5 of the "Getting started
   locally - backend" (above in this file)
