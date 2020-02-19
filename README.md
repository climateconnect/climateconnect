# Climate Connect

## Pre-steps

1. Create postgres database with username and password. [You will be using this for django]
2. Create 32 char random secret key for your local setup. Run `openssl rand -base64 32`. Copy the
   value you will using this to add as SECRET_KEY for django settings.

## Getting Started Locally

1. Create a python virtual environment `python3 -m venv climateconnect_env`
2. Run the following commands

```
   cd climateconnect_env
   source bin/activate
```

3. Clone down the repo
4. Run `pip install -r requirements.txt` to install python packages.
5. Run `yarn install` to download all NPM packages.
6. Create `.env` (frontend) and `.pyenv` (backend) file for environments variables.
7. Run `yarn build` to build js packages.
8. Run `yarn export` to export build.
9. Now run `./manage.py makemigrations` to run database migrations.
10. Now run `./manage.py runserver` to start the server.

### Development Tips

All work should be done on a feature branch, based off of the develop branch. For example create a
new `feature/awesome-new-feature` branch. When completed, sumbit a PR to merge it into the `develop`
branch. See the
[Wiki](https://github.com/climateconnect/climateconnect/wiki/Github-Branching-Guidelines) for more
info

### To Deploy

??? Rest of deploy procedure is work in progress
