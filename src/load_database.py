
# RENAME TO fetch_database.py
# fetches datasets from IMDB website


import os
import requests
import gzip
import shutil


def download_unzip(url, output_folder):
    # Download the file
    response = requests.get(url, stream=True)

    # Check if the request was successful
    if response.status_code == 200:
        # Get the name of the file from the URL
        file_name = url.split('/')[-1]
        gzipped_file_path = os.path.join(output_folder, file_name)
        
        # Save the gzipped content to a file
        with open(gzipped_file_path, 'wb') as f:
            f.write(response.content)
        
        # Unzip the gzipped file
        with open(gzipped_file_path, 'rb') as f_in:
            unzipped_file_path = os.path.join(output_folder, file_name.replace('.gz', ''))
            with open(unzipped_file_path, 'wb') as f_out:
                with gzip.open(f_in, 'rb') as gz:
                    shutil.copyfileobj(gz, f_out)
        
        # delete original .gz file
        os.remove(gzipped_file_path)
        print(f"File downloaded and unzipped successfully. Saved at: {unzipped_file_path}")
    else:
        print(f"Failed to download file. HTTP Status Code: {response.status_code}")


def main():
    # The URLs of the files to download
    urls = [
        'https://datasets.imdbws.com/name.basics.tsv.gz',
        'https://datasets.imdbws.com/title.akas.tsv.gz',
        'https://datasets.imdbws.com/title.basics.tsv.gz',
        'https://datasets.imdbws.com/title.crew.tsv.gz',
        'https://datasets.imdbws.com/title.episode.tsv.gz',
        'https://datasets.imdbws.com/title.principals.tsv.gz',
        'https://datasets.imdbws.com/title.ratings.tsv.gz',
    ]

    # Path to the 'database' folder where the unzipped file will be stored
    output_folder = '../database'

    # Ensure the 'database' directory exists
    os.makedirs(output_folder, exist_ok=True)

    for url in urls:
        download_unzip(url, output_folder)

main()