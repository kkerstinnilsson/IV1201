
# Frontend
cd frontend
npm install
npm run dev


# Backend
cd backend
npm install
npm run dev


# Notes
.gitkeep files are used as placeholders for empty directories and can be removed later.

# Run with Docker

Prerequisite: Install Docker

Then navigate to project root folder:
```bash
cd IV1201
```

## Development (local coding)

To start development containers:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

To start development containers with empty volumes:
```bash
docker-compose -f docker-compose.dev.yml up --build -V
```

To stop development containers:
```bash
docker-compose -f docker-compose.dev.yml down
```

Access the app at: http://localhost:5173

## To migrate database locally start up local docker containers above then run

docker exec -it recruitment-backend-dev npx sequelize-cli db:migrate

## Production (testing production build locally)

To start production containers:
```bash
docker-compose up --build
```

To stop production containers:
```bash
docker-compose down
```

Access the app at: http://localhost:80
