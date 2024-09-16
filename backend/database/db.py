from pymongo import MongoClient
from pymongo.server_api import ServerApi

def get_db():
    mongo_uri = 'mongodb+srv://poncehar0331:qwer1234@gymservidor.z7gav.mongodb.net/?retryWrites=true&w=majority&appName=GymServidor'
    client = MongoClient(mongo_uri, maxPoolSize=10, minPoolSize=3)
    return client.get_database('Gym')
