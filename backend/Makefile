# Use the venv Python when available (VIRTUAL_ENV is set by `source activate`),
# otherwise fall back to the system python3.
PYTHON := $(if $(VIRTUAL_ENV),$(VIRTUAL_ENV)/bin/python3,python3)

default: all


start:
	$(info )
	$(info -- Starting server --)
	$(info )
	$(PYTHON) manage.py runserver

celery:
	$(info )
	$(info -- Starting Celery --)
	$(info )
	celery -A climateconnect_main worker -l INFO

celery_beat:
	$(info )
	$(info -- Starting Celery Beat --)
	$(info )
	celery -A climateconnect_main beat -l INFO

shell:
	$(PYTHON) manage.py shell

install:
	pdm install

test:
	$(PYTHON) manage.py test --keepdb --noinput
test-clean:
	$(PYTHON) manage.py test --noinput

coverage:
	$(info )
	$(info -- Running tests with coverage --)
	$(info )
	coverage run manage.py test --keepdb --noinput
	coverage report

coverage-html:
	$(info )
	$(info -- Running tests with coverage (HTML report) --)
	$(info )
	coverage run manage.py test --keepdb --noinput
	coverage html
	$(info )
	$(info -- Report written to htmlcov/index.html --)
	$(info )

docker:
	docker-compose up -d
	$(info )
	$(info -- Running Docker in background (detached mode) --)
	$(info )


# Note: this should be in sync with out CI GitHub action that lints too. See
# those files under .github/workflows
# lint:
#  	 flake8 . --count --select=E9,F6,F7,F8 --show-source --statistics
ruff:
	ruff check .

format:
	black .

# Database migrations and test data creation:
migrate:
	$(PYTHON) manage.py migrate

migrations: migrate

test-data:
	$(PYTHON) manage.py create_test_data --number_of_rows 4

all: format ruff start

precommit: format ruff

precommit-full: format ruff test
