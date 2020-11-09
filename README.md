# Climate Connect

The code for https://climateconnect.earth. 

## Pre-steps

1.  Create a local Postgres database with your own username and password. You will connect to this for your local backend project.
2.  Create 32 char random secret key for your local setup. Run `openssl rand -base64 32`. Copy the
    value you will be using this to add as SECRET_KEY for django settings.

## Getting Started Locally

We are using Python/Django for backend and Next.js for frontend.

1.  Create a python virtual environment `python3 -m venv climateconnect_env`
2.  Run following commands to start virtual environment
    ```
       cd climateconnect_env
       source bin/activate
    ```
3.  Clone GitHub repository `git clone <URL>`

### Run docker compose

Currently, we use docker to run Redis server locally. 

If you do not have docker installed locally, follow the official steps: https://docs.docker.com/get-docker/

1. Go to backend directory `cd backend`
2. Run `docker-compose up`. This will start Redis server on docker

### Backend

Once you clone the repository start backend server.

1.  Go to backend directory `cd backend`
2.  Run `pip install -r requirements.txt` to install all backend libararies.
3.  Create `.backend_env` to include backend environment variables. You can find upto date sample env variables in `backend/local-env-setup.md` file.
4.  Run `python manage.py migrate` to run django migrations. Note: This command is used for
    when you first start or whenever you are adding or updating database models.
5.  Run server using `python manage.py runserver`.
6.  If you want to run tests suite use this command: `python manage.py test`. If you want to run a
    specific test file or test class run this command:
    `python manage.py test <file_path> or <file_path + class_name>`

### Frontend

1. `cd frontend`
2. Run `yarn install` to download all npm packages
3. Add `.env` file for frontend environment variables. You can find which env variables you have to set in `/frontend/next.config.js/`
4. Run `yarn dev` to start developing

## To Deploy

###  Frontend

#### Option 1: GitHub Actions

1. Use GitHub actions to push to a server. A deploy file can be found in `.github/workflows`

#### Option 2: Manually

1. `cd frontend`
2. `yarn --production`
3. `yarn build`
4. `node server.js` OR `next start` 

### Backend

1. Make sure your `ENVIRONMENT` env variable is set to `production`
2. Follow steps 1-5 of the "Getting started locally - backend" (above in this file)

