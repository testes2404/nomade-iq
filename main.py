from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Monta a pasta raiz para servir os arquivos HTML, CSS e JS
app.mount("/", StaticFiles(directory=".", html=True), name="static")

# Rota principal (carrega index.html)
@app.get("/")
def root():
    index_path = os.path.join(os.getcwd(), "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"detail": "index.html não encontrado"}

# Exemplo: rota de API
@app.get("/api/status")
def status():
    return {"status": "API e site online no mesmo serviço"}
