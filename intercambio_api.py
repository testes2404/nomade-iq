# arquivo: intercambio_api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import requests
from bs4 import BeautifulSoup
import re

# -----------------------------
# MODELO DE RESPOSTA
# -----------------------------
class PacoteIntercambio(BaseModel):
    id: str
    agencia: str
    titulo: str
    destino: Optional[str] = None
    duracao: Optional[str] = None
    preco_texto: Optional[str] = None
    preco_num: Optional[float] = None
    resumo: Optional[str] = None

# -----------------------------
# APP FASTAPI
# -----------------------------
app = FastAPI(title="API Intercâmbio Nômade IQ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # para dev local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ESTUDARFORA_URL = "https://www.estudarfora.org.br/pacotes-mais-baratos-intercambio/"

# -----------------------------
# FUNÇÕES AUXILIARES
# -----------------------------
def extrair_preco(texto: str) -> Optional[float]:
    """
    Procura algo como 'R$ 6.290,00' no texto e devolve float 6290.00
    """
    m = re.search(r"R\$ ?([\d\.\,]+)", texto)
    if not m:
        return None
    bruto = m.group(1)
    # remove pontos de milhar, troca vírgula por ponto
    bruto = bruto.replace(".", "").replace(",", ".")
    try:
        return float(bruto)
    except ValueError:
        return None

def limpar_resumo(texto: str, limite: int = 320) -> str:
    texto = " ".join(texto.split())
    if len(texto) > limite:
        return texto[:limite].rsplit(" ", 1)[0] + "..."
    return texto

def scrape_estudarfora_pacotes() -> List[PacoteIntercambio]:
    """
    Lê a página dos 9 intercâmbios mais baratos e transforma
    em pacotes estruturados.
    Isso é frágil por depender do HTML do site, mas já resolve bem.
    """
    resp = requests.get(ESTUDARFORA_URL, timeout=15)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Não foi possível acessar EstudarFora.")

    soup = BeautifulSoup(resp.text, "html.parser")

    # Pega o elemento principal (article, se existir)
    article = soup.find("article") or soup

    pacotes: List[PacoteIntercambio] = []
    agencia_padrao = "Agências parceiras"

    # Estratégia:
    # 1. Procurar headings (h2/h3/h4) que pareçam ser nome de pacote
    # 2. Pegar os <p> seguintes até o próximo heading e extrair preço e resumo
    for heading in article.find_all(["h2", "h3", "h4"]):
        titulo = heading.get_text(strip=True)
        if not titulo:
            continue

        # Filtro simples: queremos títulos que mencionem intercâmbio / inglês / destino
        if "intercâmbio" not in titulo.lower() and "Inglês" not in titulo and "inglês" not in titulo.lower():
            # ainda assim, alguns pacotes podem não ter a palavra "intercâmbio", então isso é só um filtro leve
            # mas pra não trazer o artigo todo, a gente mantém esse critério
            continue

        # Junta os parágrafos até o próximo heading irmão
        bloco_paragrafos = []
        texto_completo = ""
        for sib in heading.next_siblings:
            if getattr(sib, "name", None) in ["h2", "h3", "h4"]:
                break
            if getattr(sib, "name", None) == "p":
                t = sib.get_text(" ", strip=True)
                if t:
                    bloco_paragrafos.append(t)

        if not bloco_paragrafos:
            continue

        texto_completo = " ".join(bloco_paragrafos)
        preco_num = extrair_preco(texto_completo)
        preco_texto = None
        if preco_num is not None:
            # reconstrói um R$ bonitinho
            preco_texto = f"R$ {preco_num:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

        resumo = limpar_resumo(texto_completo)

        # tentativa simples de extrair destino da primeira frase
        destino = None
        primeira_frase = bloco_paragrafos[0]
        # exemplo típico: "O pacote inclui ... para Malta" etc.
        # Não vamos pirar: só deixamos None ou uma substring genérica
        # Usuário pode depois editar manualmente.

        pack = PacoteIntercambio(
            id=f"estudarfora-{len(pacotes)+1}",
            agencia=agencia_padrao,
            titulo=titulo,
            destino=destino,
            duracao=None,
            preco_texto=preco_texto,
            preco_num=preco_num,
            resumo=resumo,
        )
        pacotes.append(pack)

    # fallback: se por algum motivo nada foi encontrado, devolve alguns exemplos fixos
    if not pacotes:
        pacotes = [
            PacoteIntercambio(
                id="mock-1",
                agencia="Exemplo",
                titulo="Intercâmbio de inglês em Malta — 4 semanas",
                destino="Malta",
                duracao="4 semanas",
                preco_texto="R$ 6.290,00",
                preco_num=6290.00,
                resumo="Pacote exemplo com curso de inglês, acomodação básica e taxas inclusas.",
            ),
            PacoteIntercambio(
                id="mock-2",
                agencia="Exemplo",
                titulo="Intercâmbio de inglês na África do Sul — 4 semanas",
                destino="Cidade do Cabo",
                duracao="4 semanas",
                preco_texto="R$ 7.500,00",
                preco_num=7500.00,
                resumo="Curso de inglês geral, material e acomodação em casa de família.",
            ),
        ]

    # Filtra só pacotes com preço para a calculadora
    pacotes_com_preco = [p for p in pacotes if p.preco_num is not None]
    return pacotes_com_preco or pacotes

# -----------------------------
# ENDPOINTS
# -----------------------------
@app.get("/api/intercambio/ofertas", response_model=List[PacoteIntercambio])
def listar_pacotes_intercambio():
    """
    Retorna uma lista de pacotes de intercâmbio com nome, resumo e preço estimado.
    Os dados vêm do EstudarFora (página pacotes-mais-baratos-intercambio),
    com fallback se o HTML mudar muito.
    """
    try:
        pacotes = scrape_estudarfora_pacotes()
        return pacotes
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar pacotes de intercâmbio: {e}"
        )
