Cozemble aims to combine the best of low-code (fast, easy, cheap assembly of commodity features) with the best of full-code (being able to deal with any specific need).

It will do this in a few ways, starting with:

- Providing a high quality abstract of data, validations, relationships, rules and permissions in a domain
- Enabling the creation of new data types as plugins
- Exposing well managed APIs to the core functionality
- Enabling the creation of new visualisation metaphors as plugins

# Very early preview

[Really early explainer video](https://www.youtube.com/watch?v=31Tk8uGQ8zU)

# Building

`tested against hash a4187195570673cdbcc9e55b020d00deb2361bd9`

- pnpm install
- pnpm run build
- in one terminal (terminal one):
  - cd backend/api
  - ./scripts/run-clean-backend.sh (docker required)
  - This will run a postgres database in docker and run the backend api
- in another terminal (terminal two):
  - cd model/editor
  - npm run dev
  - model editor should be running in http://localhost:5173
- in another terminal (terminal three):
  - cd data/paginated-editor
  - npm run dev
  - data editor should be running on http://localhost:5174

# Testing

- create some models in the model editor at http://localhost:5173
- Apply them to the database
- Inspect the postgres database using `psql postgresql://user:password@localhost:5432/postgres` or whatever client you want
- Inspect the Postgraphile GraphQL API using http://localhost:3002/graphiql
- Play with the data entry UI at http://localhost:5174
