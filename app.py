from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
# import uvicorn
import sqlite3
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
connection = sqlite3.connect("data.db")
cursor = connection.cursor()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins; replace with specific domains in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods: GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Allow all headers
)

class Event(BaseModel):
    index: int
    time: str
    event: str

@app.post("/event")
async def post_events(event: Event):
    event.time = str(datetime.now())
    cursor.execute('insert into Events VALUES (?, ?, ?)', (event.index, event.time, event.event))
    connection.commit()
    return 204

@app.get("/event")
async def get_events():
    cursor.execute('select * from Events order by "index" asc')
    users = cursor.fetchall()
    return list(users)

@app.get("/ping")
async def ping():
    return {"message": "pong"}

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)