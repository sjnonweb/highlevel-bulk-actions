# Highlevel Bulk Action

## Description

Bulk actions service for ingesting huge csv files into your database.

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


## Features

**1. Entities and Actions:** The service currently supports Bulk actions on the Contact Entity located in `src/contacts/entities`. Adding support for more entities will require:

  1. Create the Entity module with schema and service methods.
  2. Implement `EntityProcessor` class by extending abstract class `BulkActionProcessor` from `src/bulk-actions/processor/abstract.processor.ts`. Which implements `IBulkActionProcessor` interface
  3. Register this `EntityProcessor` in BulkAction module

**2. Horizontal Scaling:** The worker container defined in `Dockerfile.worker` file can be scaled via docker-compose like so: `docker-compose up -d --scale worker=3`

**3. Stats:** Stats are captured in real time during bulk-action processing. It can be accessed from `bulk-action/:id/stats` endpoint. Api server level json logs are also enabled.


**3. Logs:** Logs are captured at row level for the entire csv file. It can be accessed from `bulk-action/:id/logs` endpoint. Api server level json logs are also enabled.

**4. API and Documentation:** Swagger module has been integrated to automatically generate docs. It can be access at `/docs` endpoint.

**5. Database and Queuing:** Postgres for persistent storage and Redis/Bullmq for Queue/Tasks implementation.

**6. De-duplication:** Items in bulk-actions are marked as Skipped when duplicate entity is encounterd.

**7. Scheduling:** Bulk actions can be scheduled for a specific time in future, service expects iso string as the date format. Can be generated from `new Date().toISOString()`

**8. Rate Limiting:** This has not been implemented as i ran out of time. There are two ways i could have implemented it:

  1. Rejection: Check the number of items processed in the last one minute and if the new request exceeds the limit we can reject the request.
  2. Delayed processing: I would have preferred to implement this where we can delay the execution to future in case user has exceeded the limit at this moment.