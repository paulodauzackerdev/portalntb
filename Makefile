.PHONY: dev build up down migrate seed reset logs clean lint typecheck

dev:
	docker compose up --watch

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

# Backend
migrate:
	cd backend && npx prisma migrate dev

seed:
	cd backend && npx prisma db seed

reset:
	cd backend && npx prisma migrate reset --force

typecheck:
	cd backend && npx tsc --noEmit
	cd frontend && npx tsc --noEmit

lint:
	cd backend && npx eslint src/

logs:
	docker compose logs -f

# Remove containers e volumes (destrói dados do banco)
clean:
	docker compose down -v
