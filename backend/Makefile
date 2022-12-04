# Note: this file is alphabetized - please try to keep it that way :-)

all:
	docker start

default:
	start

docker:
	docker-compose up -d
	$(info )
	$(info -- Running Docker in background (detached mode) --)
	$(info )

format:
	black .

# Note: this should be in sync with out CI GitHub action that lints too. See
# those files under .github/workflows
lint:
	flake8 . --count --select=E9,F6,F7,F8 --show-source --statistics

# Database migrations and test data creation:
migrate:
	python3 manage.py migrate

migrations: migrate

start:
	$(info )
	$(info -- Starting server --)
	$(info )
	python3 manage.py runserver

install:
	pip3 install -r requirements.txt

test:
	python3 manage.py test

test-data:
	python3 manage.py create_test_data --number_of_rows 4
