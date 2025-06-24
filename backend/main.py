from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "AlignAI backend running"}