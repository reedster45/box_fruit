-- get rid of unecessary NOT NULL
-- review tables and specifics

-- IDEA: CREATE DATABASE ONCE
--       EVERYTIME YOU OPEN APP - RUN load_database.py in background and then add new entries to database if they don't already exist
--       MAINTAIN A NEW UPDATES TABLE THAT HOLDS THE 30ish NEWEST MOVIES & SHOWS
--       RUN THE DATABASE ASYNC TO THE STREAMING

-- 1. Handling Arrays:
-- For arrays (like types, attributes, genres, primaryProfession, and knownForTitles), you're storing them as comma-separated strings. This approach will work for simple use cases but has 
-- limitations:
-- You won't be able to easily query individual elements of the array (like searching for a particular genre or profession).
-- To handle these more effectively, you might want to consider using a normalized relational approach (i.e., creating separate tables for these arrays and establishing relationships), 
-- but for now, storing them as comma-separated strings will work fine for simpler queries.


CREATE TABLE IF NOT EXISTS title_akas (
    titleId TEXT NOT NULL,
    ordering INTEGER NOT NULL,
    title TEXT NOT NULL,
    region TEXT NOT NULL,
    language TEXT NOT NULL,
    types TEXT, -- Storing array as a comma-separated string
    attributes TEXT, -- Storing array as a comma-separated string
    isOriginalTitle BOOLEAN NOT NULL,
    PRIMARY KEY (titleId, ordering)
);

CREATE TABLE IF NOT EXISTS title_basics (
    tconst TEXT PRIMARY KEY, -- Alphanumeric unique identifier of the title
    titleType TEXT NOT NULL,
    primaryTitle TEXT NOT NULL,
    originalTitle TEXT,
    isAdult BOOLEAN NOT NULL,
    startYear INTEGER,
    endYear INTEGER, -- Use NULL for titles that don't have an end year
    runtimeMinutes INTEGER,
    genres TEXT -- Storing array as a comma-separated string
);

CREATE TABLE IF NOT EXISTS title_crew (
    tconst TEXT PRIMARY KEY,
    directors TEXT, -- Array of nconsts, storing as a comma-separated string
    writers TEXT -- Array of nconsts, storing as a comma-separated string
);

CREATE TABLE IF NOT EXISTS title_episode (
    tconst TEXT PRIMARY KEY, -- Alphanumeric identifier of episode
    parentTconst TEXT NOT NULL, -- Alphanumeric identifier of the parent TV Series
    seasonNumber INTEGER NOT NULL,
    episodeNumber INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS title_principals (
    tconst TEXT NOT NULL,
    ordering INTEGER NOT NULL,
    nconst TEXT NOT NULL, -- Alphanumeric unique identifier of the name/person
    category TEXT NOT NULL,
    job TEXT, -- Specific job title if applicable
    characters TEXT, -- The name of the character played if applicable
    PRIMARY KEY (tconst, ordering)
);

CREATE TABLE IF NOT EXISTS title_ratings (
    tconst TEXT PRIMARY KEY, -- Alphanumeric unique identifier of the title
    averageRating REAL NOT NULL,
    numVotes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS name_basics (
    nconst TEXT PRIMARY KEY, -- Alphanumeric unique identifier of the name/person
    primaryName TEXT NOT NULL, -- Name by which the person is most often credited
    birthYear INTEGER, -- In YYYY format
    deathYear INTEGER, -- In YYYY format if applicable, NULL if not applicable
    primaryProfession TEXT, -- Storing array as a comma-separated string
    knownForTitles TEXT -- Storing array of tconsts as a comma-separated string
);


-- .mode tabs
-- .import title.akas.tsv title_akas
-- .import title.basics.tsv title_basics
-- .import title.crew.tsv title_crew
-- .import title.episode.tsv title_episode
-- .import title.principals.tsv title_principals
-- .import title.ratings.tsv title_ratings
-- .import name.basics.tsv name_basics

-- cd database
-- sqlite3 database.db
-- CREATE TABLE IF NOT EXISTS titles (titleId TEXT NOT NULL, ordering INTEGER NOT NULL, title TEXT NOT NULL, region TEXT, language TEXT, types TEXT, attributes TEXT, isOriginalTitle INTEGER NOT NULL, PRIMARY KEY (titleId, ordering));
-- .mode tabs
-- .import title.akas.tsv titles