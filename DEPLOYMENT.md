# Deploying to Google Cloud Platform

The app ships as **one container**: the Express API also serves the built React app,
so the browser only talks to a single origin (no CORS or cross-site cookie setup).

- **Hosting:** Cloud Run
- **Database:** Cloud SQL for PostgreSQL (a Neon database also works, see the end)
- **Secrets:** Secret Manager

Replace `PROJECT_ID`, `REGION` (e.g. `europe-west1`) and the passwords below.

## 1. One-time project setup

```bash
gcloud config set project PROJECT_ID
gcloud services enable run.googleapis.com sqladmin.googleapis.com \
  secretmanager.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## 2. Create the database

```bash
gcloud sql instances create ttm-db --database-version=POSTGRES_16 \
  --tier=db-f1-micro --region=REGION
gcloud sql databases create taskmanager --instance=ttm-db
gcloud sql users create ttm_user --instance=ttm-db --password='CHOOSE_A_STRONG_PASSWORD'
```

Create the tables (opens a psql shell, then paste or `\i` the schema):

```bash
gcloud sql connect ttm-db --user=ttm_user --database=taskmanager
# inside psql:  \i backend/db/schema.sql   (or paste its contents)
```

## 3. Store the secrets

URL-encode special characters in the password (e.g. `@` becomes `%40`).

```bash
# Session secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))" | \
  gcloud secrets create ttm-session-secret --data-file=-

# Cloud SQL connects over a unix socket on Cloud Run
printf 'postgresql://ttm_user:PASSWORD@/taskmanager?host=/cloudsql/PROJECT_ID:REGION:ttm-db' | \
  gcloud secrets create ttm-database-url --data-file=-
```

Give the Cloud Run service account access to the secrets and Cloud SQL:

```bash
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format='value(projectNumber)')
SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:$SA" --role=roles/cloudsql.client
```

## 4. Build and deploy (from the repository root)

```bash
gcloud run deploy team-task-manager \
  --source . \
  --region REGION \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:REGION:ttm-db \
  --set-env-vars NODE_ENV=production,DATABASE_SSL=false \
  --set-secrets SESSION_SECRET=ttm-session-secret:latest,DATABASE_URL=ttm-database-url:latest
```

The command prints the service URL. Open it, register a user and test the flow.

## Using Neon (or any external Postgres) instead of Cloud SQL

Skip the Cloud SQL steps and `--add-cloudsql-instances`. Store the Neon connection string
as the `ttm-database-url` secret and deploy with `DATABASE_SSL=true`:

```bash
--set-env-vars NODE_ENV=production,DATABASE_SSL=true
```

The app still runs on GCP, but the brief asks for a database service available on GCP,
so Cloud SQL is the safer choice for the assessment.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Container fails to start, log says `SESSION_SECRET must be set` | Secret not attached, check `--set-secrets` |
| `Database connection failed` in logs | Wrong `DATABASE_URL`, missing `--add-cloudsql-instances`, or `DATABASE_SSL` set wrong |
| Login succeeds but you are logged out on the next request | Not served over HTTPS, or `NODE_ENV` is not `production` (secure cookie / trust proxy) |
| `relation "users" does not exist` | `backend/db/schema.sql` was not applied |
