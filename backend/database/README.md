# Database Module

## Overview
The Database module handles connection to Supabase (PostgreSQL) and initialization of the schema.

## Planned Features
- **Connection**: Establish a secure connection using `.env` credentials.
- **Initialization**: Run `init.sql` to create tables.

## Files
- `db_connection.py`: Database connection logic.
- `init_db.py`: Script to initialize the database.
- `init.sql`: SQL schema file.

## Development Tasks
- Load `.env` with `python-dotenv`.
- Use `psycopg2` or `sqlalchemy` for connections.
- Test initialization with Supabase.
