# name.basics.tsv.gz
# title.akas.tsv.gz
# title.basics.tsv.gz
# title.crew.tsv.gz
# title.episode.tsv.gz
# title.principals.tsv.gz
# title.ratings.tsv.gz


import pandas as pd
import sqlite3

# Load the TSV file using pandas
tsv_file = 'title.akas.tsv'  # Path to your TSV file
df = pd.read_csv(tsv_file, sep='\t')  # Reading the TSV file into a DataFrame

# Create a connection to the SQLite database (or any other database like MySQL, PostgreSQL, etc.)
# This will create a new SQLite database file if it doesn't exist
conn = sqlite3.connect('database.db')  # SQLite database file name
cursor = conn.cursor()

# Create the SQL table based on the DataFrame columns
# Assuming your TSV columns are suitable as column names for the SQL table
table_name = 'imdb_table'  # Name of the SQL table
columns = ', '.join([f'"{col}" TEXT' for col in df.columns])  # Define column types (TEXT for all here)


# CREATE COLUMNS MANUALLY AND WITH CORRECT TYPES
# batch insert rows or bulk insert methods

# Create table SQL statement
create_table_sql = f"CREATE TABLE IF NOT EXISTS {table_name} ({columns});"
cursor.execute(create_table_sql)

# Insert the rows into the SQL table
for row in df.itertuples(index=False, name=None):
    # Create the SQL insert statement for each row
    placeholders = ', '.join(['?'] * len(row))  # Use placeholders for SQL injection safety
    insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders});"
    cursor.execute(insert_sql, row)

# Commit the changes and close the connection
conn.commit()
conn.close()

print(f"TSV data has been inserted into the '{table_name}' table in the database.")
