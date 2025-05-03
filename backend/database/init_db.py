from dotenv import load_dotenv
import os
import psycopg2

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), os.pardir, '.env'))

# Database initialization

def init_db():
    # Establish connection using environment variables
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    # Read SQL schema file
    schema_path = os.path.join(os.path.dirname(__file__), 'init.sql')
    with open(schema_path, 'r') as f:
        sql = f.read()
    # Execute schema
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()
    conn.close()
    print('Database initialized successfully.')

if __name__ == '__main__':
    init_db()