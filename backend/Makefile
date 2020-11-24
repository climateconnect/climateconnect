default: start

start:
	python3 manage.py runserver

# database migrations
migrate:
	python3 manage.py migrate

test:
	python3 manage.py test

docker:
	docker-compose up &

all: docker start
