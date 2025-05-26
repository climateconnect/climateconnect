default: all


start:
	$(info )
	$(info -- Starting server --)
	$(info )
	python3 manage.py runserver

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
	python3 manage.py shell

install:
	pdm install

test:
	python3 manage.py test --keepdb
test-clean:
	python3 manage.py test --noinput

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
	python3 manage.py migrate

migrations: migrate

test-data:
	python3 manage.py create_test_data --number_of_rows 4

all: format ruff start

precommit: format ruff test