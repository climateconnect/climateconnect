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


# database migrations and test data creation
migrate:
	python3 manage.py migrate

# just an alias for migrate
migrations: migrate

# Edit the number as you see fit
test-data:
	python manage.py create_test_data --number_of_rows 1
