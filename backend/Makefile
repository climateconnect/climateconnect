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

all: docker start


#
# Database migrations and test data creation:
#

migrate:
	python3 manage.py migrate

migrations: migrate

test-data:
	python manage.py create_test_data --number_of_rows 60
