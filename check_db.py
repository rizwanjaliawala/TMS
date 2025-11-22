from pymongo import MongoClient
import sys

try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    client.server_info() # Force connection
    print("Connected to MongoDB")
except Exception as e:
    print(f"Failed to connect: {e}")
    sys.exit(1)
