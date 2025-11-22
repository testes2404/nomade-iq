# salarios_api.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# ---------------------------------------------------------
# MODELOS
# ---------------------------------------------------------

class SalarioItem(BaseModel):
    empresa: Optional[str] = None
    cargo: Optional[str] = None
    cidade: Optional[str] = None
    nivel: Optional[str] = None
    modalidade: Optional[str] = None
    faixa: Optional[str] = None
    mediana: Optional[str] = None
    fonte_url: Optional[str] = None
    fonte_label: Optional[str] = "Plataforma de transparência salarial"

class ResultadoResp(BaseModel):
    resultados: List[SalarioItem]


# ---------------------------------------------------------
# APP FASTAPI
# ---------------------------------------------------------

app = FastAPI(
    title="API Salários Reais – Nômade IQ",
    version="1.0.0",
)

# CORS: libera acesso do seu HTML rodando no navegador
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "*",  # se quiser deixar bem aberto em dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# DADOS MOCK (exemplos inspirados em plataformas reais)
# Depois você pode trocar por scraping ou banco de dados.
# ---------------------------------------------------------

SALARIOS_MOCK: List[SalarioItem] = [
    SalarioItem(
        empresa="Vale",
        cargo="Analista de Dados",
        cidade="Belo Horizonte",
        nivel="Pleno",
        modalidade="Híbrido",
        faixa="R$ 8.000 – R$ 12.000",
        mediana="R$ 10.200",
        fonte_url="https://salariotransparente.com.br",
    ),
    SalarioItem(
        empresa="Vale",
        cargo="Analista de Dados",
        cidade="Rio de Janeiro",
        nivel="Sênior",
        modalidade="Presencial",
        faixa="R$ 11.000 – R$ 16.000",
        mediana="R$ 13.500",
        fonte_url="https://salariotransparente.com.br",
    ),
    SalarioItem(
        empresa="Nubank",
        cargo="Product Manager",
        cidade="São Paulo",
        nivel="Pleno",
        modalidade="Híbrido",
        faixa="R$ 18.000 – R$ 26.000",
        mediana="R$ 22.000",
        fonte_url="https://salariotransparente.com.br",
    ),
    SalarioItem(
        empresa="Itaú",
        cargo="Analista de Sistemas",
        cidade="São Paulo",
        nivel="Júnior",
        modalidade="Híbrido",
        faixa="R$ 5.000 – R$ 7.500",
        mediana="R$ 6.200",
        fonte_url="https://salariotransparente.com.br",
    ),
    SalarioItem(
        empresa="iFood",
        cargo="Engenheiro de Software",
        cidade="Remoto",
        nivel="Sênior",
        modalidade="Remoto",
        faixa="R$ 19.000 – R$ 28.000",
        mediana="R$ 23.800",
        fonte_url="https://salariotransparente.com.br",
    ),
]


# ---------------------------------------------------------
# FUNÇÃO DE FILTRO SIMPLES
# ---------------------------------------------------------

def match_filter(valor: Optional[str], filtro: Optional[str]) -> bool:
    """
    Retorna True se:
    - não existe filtro (filtro vazio) OU
    - o filtro aparece dentro do valor (case-insensitive).
    """
    if not filtro:
        return True
    if not valor:
        return False
    return filtro.lower() in valor.lower()


# ---------------------------------------------------------
# ENDPOINT PRINCIPAL
# ---------------------------------------------------------

@app.get("/api/salarios", response_model=ResultadoResp)
def buscar_salarios(
    empresa: Optional[str] = Query(None),
    cargo: Optional[str] = Query(None),
    cidade: Optional[str] = Query(None),
):
    """
    Endpoint que seu salario-real.html chama.
    Ele filtra na lista SALARIOS_MOCK.
    Depois você pode trocar a origem por scraping ou banco.
    """

    resultados_filtrados: List[SalarioItem] = []

    for item in SALARIOS_MOCK:
        if not match_filter(item.empresa, empresa):
            continue
        if not match_filter(item.cargo, cargo):
            continue
        if not match_filter(item.cidade, cidade):
            continue
        resultados_filtrados.append(item)

    return ResultadoResp(resultados=resultados_filtrados)
