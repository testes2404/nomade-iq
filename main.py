from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# === Caminho absoluto da pasta principal ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# === Servir arquivos estáticos ===
app.mount("/static", StaticFiles(directory=BASE_DIR), name="static")

# === Página inicial ===
@app.get("/")
async def serve_index():
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"detail": "index.html não encontrado"}

# === Rota de teste ===
@app.get("/api/status")
async def status():
    return {"status": "API rodando com sucesso no Render!"}
