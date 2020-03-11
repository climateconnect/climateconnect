# Climate Connect

## Pre-steps

1.  Create postgres database with username and password. [You will be using this for backend
    project]
2.  Create 32 char random secret key for your local setup. Run `openssl rand -base64 32`. Copy the
    value you will be using this to add as SECRET_KEY for django settings.

## Getting Started Locally

We are uisng Python/Django for backend and Next.js for frontend.

1.  Create a python virtual environment `python3 -m venv climateconnect_env`
2.  Run following commands to start virtual environment
    ```
       cd climateconnect_env
       source bin/activate
    ```
3.  Clone github repository `git clone <URL>`

### Backend

Once you clone the repository start backend server.

1.  Go to backend directory `cd backend`
2.  Run `pip install -r requirements.txt` to install all backend libararies.
3.  Create `.pyenv` to include backend environment variables. [Connect with other colloablators to
    get env variables]
4.  Run `python manage.py makemigrations` to run django migrations. [This command is used for when
    you first start or whenever you are adding or updating database models]
5.  Run server using `python manage.py runserver`.

### Frontend

1. From main directory Run `yarn install` to download all NPM packages
2. Add `.env` file for frontend environment variables.
3. Run `yarn dev` to start developing

### To Deploy

1. Run `yarn build` to build our the website
2. ??? Rest of deploy procedure is work in progress. Backend deploy Comming soon!
