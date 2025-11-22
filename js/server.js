import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/custo-vida", async (req, res) => {
    const { destino, mes } = req.body;

    // EXEMPLO DE CHAMADA
    const respostaGemini = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Calcule o custo real de vida em ${destino} no mês ${mes}.
                        Inclua:
                        - Moradia
                        - Mercado
                        - Transporte
                        - Plano de saúde
                        - Serviços
                        - Academia
                        - Carro/Alternativas
                        - Custos gerais
                        Traga valores aproximados e atualizados, com explicações curtas.`
                    }]
                }]
            })
        }
    );

    const data = await respostaGemini.json();
    res.json(data);
});

app.listen(3000, () => console.log("Backend rodando na porta 3000"));
