

# imports .tsv data into sqlite data

import sqlite3
import pandas as pd

# Connect to your SQLite database
conn = sqlite3.connect('../database/database.db')
cursor = conn.cursor()

# Execute the SQL commands from the create_database.sql file
with open('create_database.sql', 'r') as f:
    sql_commands = f.read()
    cursor.executescript(sql_commands)



# Load and insert data from the .tsv file
database_files = [
    '../database/name.basics.tsv',
    '../database/title.akas.tsv',
    '../database/title.basics.tsv',
    '../database/title.crew.tsv',
    '../database/title.episode.tsv',
    '../database/title.principals.tsv',
    '../database/title.ratings.tsv',
]

columns = [
    ['nconst', 'primaryName', 'birthYear', 'deathYear', 'primaryProfession'],
    ['titleid', 'ordering', 'title', 'region', 'language', 'types', 'attributes', 'isOriginalTitle'],
    ['tconst', 'titleType', 'primaryTitle', 'originalTitle', 'isAdult', 'startYear', 'endYear', 'runtimeMinutes', 'genres'],
    ['tconst', 'directors', 'writers'],
    ['tconst', 'parentTconst', 'seasonNumber', 'episodeNumber'],
    ['tconst', 'ordering', 'nconst', 'category', 'job', 'characters'],
    ['tconst', 'averageRating', 'numVotes'],
]

table_names = [
    'name_basics',
    'title_akas',
    'title_basics',
    'title_crew',
    'title_episode',
    'title_principals',
    'title_ratings',
]


# Disable foreign key checks and journal mode to improve insert speed
cursor.execute('PRAGMA foreign_keys = OFF;')
cursor.execute('PRAGMA journal_mode = WAL;')  # Use Write-Ahead Logging for better performance
cursor.execute('PRAGMA synchronous = OFF;')  # Disable synchronous mode for faster writes

# Start importing each .tsv file
for i in range(len(database_files)):
    # Read the .tsv file in chunks to handle large files
    chunksize = 50000  # Adjust the chunk size depending on your memory
    for chunk in pd.read_csv(database_files[i], sep='\t', chunksize=chunksize):
        # Prepare the join statements for the column names and placeholders
        column_names = ', '.join(columns[i])
        placeholders = ', '.join(['?'] * len(columns[i]))
        
        # Prepare the data to insert, handling missing columns by inserting None
        data = [tuple(chunk[col] if col in chunk else None for col in columns[i]) for _, chunk in chunk.iterrows()]

        # Use executemany to batch insert rows
        query = f"INSERT OR IGNORE INTO {table_names[i]} ({column_names}) VALUES ({placeholders})"
        cursor.executemany(query, data)

# Commit the transaction and close the connection
conn.commit()

# Re-enable foreign key checks and synchronous mode
cursor.execute('PRAGMA foreign_keys = ON;')
cursor.execute('PRAGMA synchronous = FULL;')

conn.close()
