from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

app = FastAPI()

# Caminho absoluto da pasta do projeto (onde está index.html, css/, recursos/, etc.)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Servir TODO o projeto como site estático
# /           -> index.html
# /css/...    -> arquivos em css/
# /js/...     -> arquivos em js/
# /recursos/... -> arquivos em recursos/
# /ferramentas/... -> arquivos em ferramentas/
# /comunidade/...  -> arquivos em comunidade/
# /gestao/...      -> arquivos em gestao/
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

# Rota de teste (não conflita com static porque começa com /api)
@app.get("/api/status")
def status():
    return JSONResponse({"status": "online"})
