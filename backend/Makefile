default: start

start:
	python3 manage.py runserver

install:
	pip install -r requirements.txt

test:
	python3 manage.py test

docker:
	docker-compose up &

all: docker start


# database migrations and test data creation
migrate:
	python3 manage.py migrate

test-data:
	python manage.py create_test_data --number_of_rows 4
