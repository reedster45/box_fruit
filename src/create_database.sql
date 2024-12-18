-- get rid of unecessary
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
    titleId TEXT,
    ordering INTEGER,
    title TEXT,
    region TEXT,
    language TEXT,
    types TEXT, -- Storing array as a comma-separated string
    attributes TEXT, -- Storing array as a comma-separated string
    isOriginalTitle BOOLEAN,
    PRIMARY KEY (titleId, ordering)
);

CREATE TABLE IF NOT EXISTS title_basics (
    tconst TEXT PRIMARY KEY, -- Alphanumeric unique identifier of the title
    titleType TEXT,
    primaryTitle TEXT,
    originalTitle TEXT,
    isAdult BOOLEAN,
    startYear INTEGER,
    endYear INTEGER, -- for titles that don't have an end year
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
    parentTconst TEXT, -- Alphanumeric identifier of the parent TV Series
    seasonNumber INTEGER,
    episodeNumber INTEGER
);

CREATE TABLE IF NOT EXISTS title_principals (
    tconst TEXT,
    ordering INTEGER,
    nconst TEXT, -- Alphanumeric unique identifier of the name/person
    category TEXT,
    job TEXT, -- Specific job title if applicable
    characters TEXT, -- The name of the character played if applicable
    PRIMARY KEY (tconst, ordering)
);

CREATE TABLE IF NOT EXISTS title_ratings (
    tconst TEXT PRIMARY KEY, -- Alphanumeric unique identifier of the title
    averageRating REAL,
    numVotes INTEGER
);

CREATE TABLE IF NOT EXISTS name_basics (
    nconst TEXT PRIMARY KEY, -- Alphanumeric unique identifier of the name/person
    primaryName TEXT, -- Name by which the person is most often credited
    birthYear INTEGER, -- In YYYY format
    deathYear INTEGER, -- In YYYY format if applicable
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
-- CREATE TABLE IF NOT EXISTS titles (titleId TEXT, ordering INTEGER, title TEXT, region TEXT, language TEXT, types TEXT, attributes TEXT, isOriginalTitle INTEGER, PRIMARY KEY (titleId, ordering));
-- .mode tabs
-- .import title.akas.tsv titles