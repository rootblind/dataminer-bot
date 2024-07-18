import csv

source_csv = 'output.csv'
dest_csv = 'data.csv'
with open(source_csv, "r", newline='', encoding='utf-8') as source_file:
    reader = csv.DictReader(source_file)
    with open(dest_csv, "a", newline='', encoding='utf-8') as dest_file:
        writer = csv.DictWriter(dest_file, fieldnames=["Message"])
        for row in reader:
            writer.writerow({'Message': row['Message']})

print('Executed')