# Just a little script to convert my discord messages data request into a csv file in order to use it for the dataset
# Just adding it here in case it helps anyone, but it is written to my use case only, feel free to edit and use it
# for your use cases.

import os
import csv
import json
import re

def filter(input):
    pattern = re.compile(r'<[^>]*>')
    filtered_input = pattern.sub('', input)

    if(filtered_input.endswith(',')):
        filtered_input = filtered_input[:-1]
    return filtered_input

# a directory path is given and all "messages.json" are appended to a list that is returned
def find_json(directory):
    json_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file == "messages.json":
                json_files.append(os.path.join(root, file))
    return json_files

# the file path is read as a file, leaded as a json object then only the contents key is stored as a list of strings
def read_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        dataObject = json.load(file)
    data = []
    for entry in dataObject:
        data.append(entry['Contents'])
    return data

# data is written using the csv library from python
def write_csv(data, path):
    with open(path, 'a', encoding='utf-8') as csvFile:
        writer = csv.DictWriter(csvFile, fieldnames=["Message"]) # "Message" is the header that i used for my csv files
        for message in data: # each directory has an array of all the messages from its json file, so each message from the array must be iterated
            writer.writerow({'Message': filter(message)})
        


def main():
    # Getting the desired paths
    script_directory = os.path.dirname(os.path.abspath(__file__))
    output_csv_file = os.path.join(script_directory, 'output.csv')
    # making a list of all directories located in the same directory as the source file
    subdirectories = [os.path.join(script_directory, d) for d in os.listdir(script_directory) if os.path.isdir(os.path.join(script_directory, d))]
    
    # init file
    with open(output_csv_file, 'w', encoding='utf-8') as initFile:
        writer = csv.DictWriter(initFile, fieldnames=["Message"])
        writer.writeheader()
    # what this code does is basically: for each directory of the directory array, read all the json files called "messages.json" and for each one, read
    # their content and write to the csv file
    # it will also print what directories were scanned
    for subdirectory in subdirectories:
        all_jsons = find_json(subdirectory)
        for file in all_jsons:
            data = read_json(file)
            write_csv(data, output_csv_file)
        print(f"{subdirectory} scanned.")
        

if __name__ == "__main__":
    main()
