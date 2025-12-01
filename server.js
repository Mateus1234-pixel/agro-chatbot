// server.js
require('dotenv').config();
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'OK' : 'NÃO DEFINIDA');

const express = require('express');
const path = require('path');
const { OpenAI } = require('openai');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

// 🔹 Configuração da OpenAI
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI inicializada');
  } else {
    console.warn('⚠️ OPENAI_API_KEY não definida. Rotas de chat podem não funcionar.');
  }
} catch (err) {
  console.error('❌ Erro ao inicializar OpenAI:', err.message);
}

// 🔹 Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 🔹 Conexão com o MySQL
let pool;
try {
  pool = mysql.createPool({
    host: "localhost",
    user: "root",           // ajuste conforme seu MySQL
    password: "senai508",   // ajuste conforme seu MySQL
    database: "cadastro",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('✅ Pool MySQL criado');
} catch (err) {
  console.error('❌ Erro ao criar pool MySQL:', err.message);
}

// 🔹 Rota de Login
app.post("/api/auth/login", async (req, res) => {
  const { nome, senha } = req.body;

  if (!nome || !senha) {
    return res.status(400).json({ success: false, message: "Preencha usuário e senha." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE usuario = ?", [nome]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Usuário não encontrado." });
    }

    const user = rows[0];
    const senhaOk = await bcrypt.compare(senha, user.senha);

    if (!senhaOk) {
      return res.status(401).json({ success: false, message: "Senha incorreta." });
    }

    return res.json({
      success: true,
      id: user.id,
      nome: user.nome
    });

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

// 🔹 Rota de Cadastro de Usuários
app.post("/banco/usuarios", async (req, res) => {
  const { nome, usuario, senha } = req.body;

  if (!nome || !usuario || !senha) {
    return res.status(400).json({ message: "Preencha todos os campos!" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE usuario = ?", [usuario]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Usuário já existe!" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    await pool.query(
      "INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)",
      [nome, usuario, hashedPassword]
    );

    res.status(200).json({ message: "Cadastro realizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar usuário:", err);
    res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

// 🔹 Rota de Chat genérica (chatbot livre)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Formato de mensagens inválido' });
    }

    // Envia a conversa recente para o modelo
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // ou 'gpt-4o' se tiver acesso
      messages: [
        { role: 'system', content: 'Você é um assistente útil e amigável. Responda perguntas de forma clara e natural.' },
        ...messages.slice(-10)
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const reply = completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    res.json({ message: reply });

  } catch (err) {
    console.error('Erro na API OpenAI:', err);
    res.status(500).json({ error: 'Erro ao processar sua solicitação.' });
  }
});

// 🔹 Rota de Histórico (filtra por usuário logado)
app.get("/api/historico/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM cadastro.medicoes WHERE usuario_id = ? ORDER BY medicao_em DESC LIMIT 50",
      [usuarioId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar histórico." });
  }
});

// 🔹 Inicia o Servidor
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando em http://localhost:${port}`);
});

// 🔹 Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejection não tratada:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
  process.exit(1);
});

// 🔹 Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, fechando servidor...');
  server.close(async () => {
    if (pool) {
      await pool.end();
    }
    console.log('Servidor fechado');
    process.exit(0);
  });
});
