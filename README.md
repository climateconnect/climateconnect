# Climate Connect

## Pre-steps

1.  Create a local postgres database with your own username and password. You will connect to this for your local backend project.
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
3.  Clone github repository `git clone <URL>`

### Run docker compose
Currently, we use docker to run redis server locally. If you do not have docker installed locally follow this official documentation from docker: https://docs.docker.com/get-docker/

1. Go to backend directory `cd backend`
2. Run `docker-compose up`. This will start redis server on docker

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
1. Run `yarn install` to download all npm packages
2. Add `.env` file for frontend environment variables.
3. Run `yarn dev` to start developing

### To Deploy

1. Run `yarn build` to build our the website
2. ??? Rest of deploy procedure is work in progress. Backend deploy coming soon!
