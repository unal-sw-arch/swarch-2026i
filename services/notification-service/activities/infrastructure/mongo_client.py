from pymongo import MongoClient
from django.conf import settings


class MongoConnection:
    _client = None
    _indexes_initialized = False

    @classmethod
    def get_client(cls):
        if cls._client is None:
            cls._client = MongoClient(settings.MONGO_URI)
        return cls._client

    @classmethod
    def get_database(cls):
        return cls.get_client()[settings.MONGO_DB_NAME]

    @classmethod
    def get_collection(cls):
        collection = cls.get_database()[settings.MONGO_COLLECTION_NAME]
        cls.ensure_indexes()
        return collection

    @classmethod
    def ensure_indexes(cls):
        if cls._indexes_initialized:
            return

        collection = cls.get_database()[settings.MONGO_COLLECTION_NAME]
        collection.create_index("orderId")
        collection.create_index("restaurantId")
        collection.create_index("eventType")
        collection.create_index("timestamp")
        cls._indexes_initialized = True