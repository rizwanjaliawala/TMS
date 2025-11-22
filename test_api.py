import requests
import json

def test_api():
    url = "http://localhost:8000/api/drivers/"
    data = {
        "name": "API Test Driver",
        "cdl_number": "99999",
        "cdl_expire_date": "2025-12-31",
        "dob": "1990-01-01"
    }
    try:
        print(f"Posting to {url}...")
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Driver created successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
