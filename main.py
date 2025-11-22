from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Serve arquivos estáticos (HTML, CSS, JS, imagens, etc.)
app.mount("/static", StaticFiles(directory="."), name="static")

# Página inicial
@app.get("/")
def root():
    index_path = os.path.join(os.getcwd(), "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"detail": "index.html não encontrado"}

# Teste simples de API
@app.get("/api/status")
def status():
    return {"status": "API e site online no mesmo serviço"}
