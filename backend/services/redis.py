import redis.asyncio as redis
import os

client = redis.from_url(os.environ["REDIS_URL"])
