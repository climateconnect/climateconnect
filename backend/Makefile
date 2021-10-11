default: start

start:
	$(info )
	$(info -- Starting server --)
	$(info )
	python3 manage.py runserver

install:
	pip install -r requirements.txt

test:
	python3 manage.py test

docker:
	docker-compose up -d
	$(info )
	$(info -- Running Docker in background (detached mode) --)
	$(info )

# Note: this should be updated to match our CI GitHub action that lints too. See
# those files under .github/workflows
lint:
	flake8 backend --count --select=F6,F7,F8,F9 --show-source --statistics

all: docker start


#
# Database migrations and test data creation:
#

migrate:
	python3 manage.py migrate

migrations: migrate

test-data:
	python manage.py create_test_data --number_of_rows 4
