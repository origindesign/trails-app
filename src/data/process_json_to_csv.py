import json
import pandas as pd

def process_json_to_csv(input_file, output_file):
    # Load the JSON data
    with open(input_file, 'r') as file:
        data = json.load(file)
    
    # Check if data is a list
    if isinstance(data, list):
        features = data  # Directly assign the list to features
    else:
        features = data.get('features', [])
    
    # Prepare data for the CSV
    csv_data = []
    for feature in features:
        name = feature.get('properties', {}).get('Name', '')  # Use 'Name' as per your JSON
        coordinates = feature.get('geometry', {}).get('coordinates', [])
        csv_data.append({'Name': name, 'Coordinates': coordinates})
    
    # Create a DataFrame and save it as a CSV file
    df = pd.DataFrame(csv_data)
    df.to_csv(output_file, index=False)
    print(f"CSV file saved to {output_file}")

# Specify the input JSON file and output CSV file
input_file = 'legacy.json'  # Replace with your JSON file path
output_file = 'output.csv' # Replace with the desired CSV output path

# Run the function
process_json_to_csv(input_file, output_file)
