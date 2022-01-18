# Climate Connect

The client and server code for the web platform on https://climateconnect.earth.

## Pre-steps

### Postgres

1. Create a local Postgres database with your own username and password.
1. Install [PostGIS](https://postgis.net/install/) on your local machine
1. Create the postgis extension within that database: run [`CREATE EXTENSION postgis;`](https://docs.djangoproject.com/en/3.1/ref/contrib/gis/install/postgis/)

You will connect to this for your local backend project.

- Create a new superuser
- Alter your new user's password
- Create a new database

Supply these values to your local `backend/.backend_env`.

### Docker

We use Docker to run the local Redis server. See the [Docker install docs](https://docs.docker.com/get-docker/) if you don't have it.

Make sure to install docker-ce, docker-ce-cli, containerd.io, and docker-compose.

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

Note: we use Python 3, so for all instructions we assume `python` means `python3`.

#### First Time Setup

1.  Go to backend directory: `cd backend`
1.  Run `pip install -r requirements.txt` to install all backend libraries.
1.  Create `.backend_env` to set environment variables.
    - You can find up-to-date sample env variables in [`backend/local-env-setup.md`](https://github.com/climateconnect/climateconnect/blob/master/backend/local-env-setup.md).
    - For the [Django `SECRET_KEY`](https://docs.djangoproject.com/en/3.1/ref/settings/#std:setting-SECRET_KEY), run `openssl rand -base64 32` to create a 32 char random secret.
1.  Run `python manage.py migrate` to run Django migrations.
    - Note: This command is used for when you first start, or whenever you are adding or updating database models.
1.  Create a superuser using `python manage.py createsuperuser`
    - You can then access your admin panel via <API_URL>/admin/

#### Continual Development

1.  Ensure Docker is running and then run `sudo docker-compose up`. This will start a Redis server on Docker.
1.  Ensure the Postgres server is running.
1.  Run server using `python manage.py runserver`.
1.  Run Celery using `celery -A climateconnect_main worker -l INFO`

#### Creating and Removing Test Data

If test data is needed, run

```sh
python manage.py create_test_data --number_of_rows 4
```

If you need to wipe your local database and start over, run

```sh
sudo -u postgres psql  # note this might differ slightly in name based on your postgres setup
```

And then at the `psql` prompt,

```sql
postgres-# \list
```

to show available databases. Once you've identified the Climate Connect database name (e.g. we'll call it `$DATABASE_NAME`), you can,

```sql
postgres-# \connect $DATABASE_NAME
$DATABASE_NAME-# \dt
$DATABASE_NAME-# DROP SCHEMA public CASCADE;
$DATABASE_NAME-# CREATE SCHEMA public;
$DATABASE_NAME-# \q
```

Then run

```sh
python manage.py migrate
```

to update your migrations, and

```sh
python manage.py createsuperuser
```

to re-create a super user to be used in the Django admin panel.

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
1. `yarn install` to download all npm packages
1. Add a `.env` file for frontend environment variables. You can find variables you need to set in [`/frontend/next.config.js/`](https://github.com/climateconnect/climateconnect/blob/master/frontend/next.config.js)

For local development, use the following for `.env`:

```sh
  API_HOST="localhost"
  API_URL="http://127.0.0.1:8000"
  BASE_URL_HOST="localhost"
  SOCKET_URL="ws://localhost"
  ENVIRONMENT="development"
```

Note: This is for people who are using newer version of node (v17.0.1) or have new apple M1 devices. Before running `yarn dev`, please run this command `export NODE_OPTIONS=--openssl-legacy-provider`. You can save this in your `~/.zshrc` file as well.

And finally `yarn dev` to spin up the Next.js app! Check out our [frontend (FE) code style guidelines wiki](https://github.com/climateconnect/climateconnect/wiki/Frontend-Code-Style-Guide) to follow codebase best practices and contribute to a healthy and maintainable codebase.

#### Testing

We use Jest as our testing framework write to tests for FE code. Write
test files with `.test.js` and execute them directly with

```sh
yarn jest path/to/testfile.test.js
```

See npm scripts in `package.json`.

We use `eslint` for linting. Watch files to fix lint issues with

```sh
yarn lint:watch
```

You can analyze size of the (frontend) bundle with

```sh
yarn analyze-bundle
```

## Deploy

### Frontend

#### Option 1: GitHub Actions

1. Use GitHub actions to push to a server. A deploy file can be found in `.github/workflows`

#### Option 2: Manually

1. `cd frontend`
2. `yarn --production`
3. `yarn build`
4. `node server.js` OR `next start`

### Backend

1. Make sure your `ENVIRONMENT` env variable is set to `production` when deploying to the production server
2. Follow steps 1-5 of the "Getting started
   locally - backend" (above in this file)
