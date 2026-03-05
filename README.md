# Recruitment Application - IV1201 Group 3

A web-based recruitment application built for KTH course IV1201. The system allows applicants to register and submit job applications, and recruiters to view and those applications. The goal of this course was to implement a good architecture in code on topics such as design and architecture, security, transactions, persistence, error handling, testing, working methods and tools and operation.

## Architectural Log

Is available at https://docs.google.com/document/d/1iZ8c97c52VYnlTCfEb7-Twg4FMrcJ1GdfMYs33kngHs/edit?usp=sharing

## Architecture

The application consists of three main parts: a React frontend, a Node.js/Express backend, and a PostgreSQL database. In production, all three run on AWS.

### Frontend

Client-side rendered with React and Vite. Follows a Container-Presentational pattern with three layers:

- **Presentation components** — pure UI, handles user input and visual output
- **Container components** — state management
- **Service layer** — API communication with the backend

### Backend

Node.js with Express, structured in three layers:

- **Presentation layer** — HTTP request handling and input validation
- **Business logic layer** — application rules and orchestration
- **Integration layer** — database communication via Sequelize ORM

Authentication is session-based with server-side session storage. Passwords are hashed with bcrypt.

### Database

PostgreSQL. The schema includes tables for persons, credentials, roles, competences, competence profiles, availability, and applications.

### AWS Infrastructure

The production environment runs on AWS within the free tier:

- **ECS on EC2 (t3.micro)** — container orchestration for frontend and backend
- **ECR** — container image registry for frontend and backend images
- **RDS PostgreSQL (db.t3.micro)** — managed database

The application is live on http://16.171.147.183.

## Environment Variables

For local development environment variables are hardcoded into the docker-compose.dev.yml file. For production the environment variables are secrets in Github and in the task-definition.json on AWS. Neither of these are accessible to unauthorised persons. An example task definition is located in the repository.

## Database Migration

The project uses Sequelize CLI migrations to transform the original database schema into the new one. Migrations handle moving credentials data from the `person` table into a separate `credentials` table, creating the `application` table, and cleaning up redundant columns.

To run migrations locally, start the development containers first, then run:
```bash
docker exec -it recruitment-backend-dev npx sequelize-cli db:migrate
```

On AWS, the same command is run against the RDS instance after loading the original SQL data.

Migration files are in `backend/migrations/` and run in sequence. Sequelize tracks which migrations have already executed, so it is safe to run the command multiple times.

## CI/CD Pipeline

The pipeline is defined in `.github/workflows/deploy.yml` and runs on every push to any branch.

### Test job (all branches)

1. Installs backend dependencies
2. Runs ESLint for static analysis
3. Runs the test suite with Jest

### Deploy job (main branch only)

Only runs after the test job passes, and only on pushes to `main`:

1. Authenticates with AWS using credentials stored in GitHub Secrets
2. Logs in to Amazon ECR
3. Builds the backend Docker image and pushes it to ECR
4. Builds the frontend Docker image with `VITE_API_BASE_URL` injected as a build argument, then pushes to ECR
5. Downloads the current ECS task definition
6. Deploys the updated task definition to ECS and waits for the service to stabilize

The following secrets must be set in GitHub repository settings:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_BACKEND_REPOSITORY`
- `ECR_FRONTEND_REPOSITORY`
- `VITE_API_BASE_URL`
- `ECS_TASK_DEFINITION`
- `ECS_SERVICE`
- `ECS_CLUSTER`

### Acceptance testing (main branch only)

Runs after the deploy job completes, against the live application on AWS:

1. Runs the Playwright test suite against the deployed URL
2. Tests are executed across all required browsers: Chrome, Firefox, Safari and Edge

## Local Development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Running with Docker

Navigate to the project root and start the development containers:
```bash
docker-compose -f docker-compose.dev.yml up --build -V
```

Stop the containers:
```bash
docker-compose -f docker-compose.dev.yml down
```

The app is available at `http://localhost:5173`.

After starting the containers, run migrations:
```bash
docker exec -it recruitment-backend-dev npx sequelize-cli db:migrate
```

### Useful Commands

| Command | Description |
|---------|-------------|
| `cd backend && npm test` | Run backend unit tests |
| `cd backend && npm run lint` | Run ESLint |
| `cd e2e && npx playwright test` | Run Playwright acceptance tests |

