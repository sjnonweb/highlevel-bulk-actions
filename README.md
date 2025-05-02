# Highlevel Bulk Action

## Description

Bulk actions service for ingesting huge csv files into your database.

Tech stack:

1. Web framework: NestJs
2. Database: Postgres
3. Queue: Redis
4. Background task processing: BullMq
5. Runtime: docker

## Project setup

```bash
$ npm i -g pnpn
$ pnpm install
$ cp .env.template .env
```

## Compile and run the project

```bash
$ docker-compose up -d --build
```

## Using the service
Generate a sample csv using the below utility script, the second argument is for defining the size of csv file.
```bash
$ node gen-csv.mjs 100
```

Now, submit the csv file as form-data in `POST /api/v1/bulk-actions/` endpoint. Here is a sample curl

```
curl --request POST \
  --url http://localhost:3000/api/v1/bulk-actions \
  --header 'Content-Type: multipart/form-data' \
  --header 'User-Agent: insomnia/11.0.2' \
  --form file=@/Users/sajan/test.csv \
  --form accountId=test \
  --form entityType=CONTACT
```

## Features

**1. Entities and Actions:** The service currently supports Bulk actions on the Contact Entity located in `src/contacts/entities`.

**2. Horizontal Scaling:** The worker container defined in `Dockerfile.worker` file can be scaled via docker-compose like so: `docker-compose up -d --scale worker=3`

**3. Stats:** Stats are captured in real time during bulk-action processing. It can be accessed from `bulk-action/:id/stats` endpoint. Api server level json logs are also enabled.


**3. Logs:** Logs are captured at row level for the entire csv file. It can be accessed from `bulk-action/:id/logs` endpoint. Api server level json logs are also enabled.

**4. API and Documentation:** Swagger module has been integrated to automatically generate docs. It can be access at `/docs` endpoint.

**5. Database and Queuing:** Postgres for persistent storage and Redis/Bullmq for Queue/Tasks implementation.

**6. De-duplication:** Items in bulk-actions are marked as Skipped when duplicate entity is encounterd.

**7. Scheduling:** Bulk actions can be scheduled for a specific time in future, service expects iso string as the date format. Can be generated from `new Date().toISOString()`

**8. Extensibility:** Code is writte in a modular architecture, using nestjs dependency injection system. Adding support for a new entity can be done in following way:

  1. Create the Entity module with schema and service methods.
  2. Implement `EntityProcessor` class by extending abstract class `BulkActionProcessor` from `src/bulk-actions/processor/abstract.processor.ts`. Which implements `IBulkActionProcessor` interface
  3. Register this `EntityProcessor` in BulkAction module

**9. Rate Limiting:** This has not been implemented as i ran out of time. There are two ways i could have implemented it:

  1. Rejection: Check the number of items processed in the last one minute and if the new request exceeds the limit we can reject the request.
  2. Delayed processing: I would have preferred to implement this where we can delay the execution to future in case user has exceeded the limit at this moment.