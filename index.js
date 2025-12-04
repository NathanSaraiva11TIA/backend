import express from "express";
import cors from "cors";
import mysql from "mysql2";

const app = express();
app.use(cors());
app.use(express.json());

const port = 3333;

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env

// CADASTRO
app.post("/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;

  const query = `
    INSERT INTO usuarios (nome, email, senha)
    VALUES (?, ?, ?)
  `;

  database.query(query, [nome, email, senha], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.json({ sucesso: false, mensagem: "Email já cadastrado!" });
      }
      return res.status(500).json({ erro: err });
    }

    res.json({ sucesso: true, mensagem: "Usuário cadastrado!" });
  });
});

// SCORE  
app.post("/score", (req, res) => {
  const { emailUsuario, scoreTotal, lowErrors } = req.body;

  const query = `
    INSERT INTO score (emailUsuario, scoreTotal, lowErrors)
    VALUES (?, ?, ?)
  `;

  database.query(query, [emailUsuario, scoreTotal, lowErrors], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.json({ sucesso: false, mensagem: "Você já jogou, deixe um novo usuário tentar!" });
      }
      return res.status(500).json({ erro: err });
    }

    res.json({ sucesso: true, mensagem: "Você já jogou, deixe um novo usuário tentar!" });
  });
});

// LISTA SCORE
app.get("/ranking", (req, res) => {
  const query = `
    SELECT id, emailUsuario, scoreTotal, lowErrors
    FROM score
    ORDER BY lowErrors ASC, scoreTotal DESC
  `;

  database.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err });
    }

    res.json({
      sucesso: true,
      ranking: results
    });
  });
});


// LOGIN
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const query = `SELECT * FROM usuarios WHERE email = ? AND senha = ?`;

  database.query(query, [email, senha], (err, results) => {
    if (err) return res.status(500).json({ erro: err });

    if (results.length === 0) {
      return res.status(401).json({ sucesso: false, mensagem: "Credenciais inválidas!" });
    }

    const usuario = results[0];
    
    // Retornar apenas as informações necessárias
    res.json({ 
      sucesso: true, 
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

const database = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectionLimit: 10
})