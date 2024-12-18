

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

df = pd.read_csv('../database/title.akas.tsv', sep='\t')

# Insert the data into the table
for index, row in df.iterrows():
    cursor.execute('''
    INSERT OR IGNORE INTO title_akas (titleId, ordering, title, region, language, types, attributes, isOriginalTitle)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (row['titleId'], row['ordering'], row['title'], row['region'], row['language'], row['types'], row['attributes'], row['isOriginalTitle']))

# Commit the transaction and close the connection
conn.commit()
conn.close()
