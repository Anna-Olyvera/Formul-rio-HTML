# IMPORTES
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import secrets
import re
import smtplib
from email.mime.text import MIMEText


back = Flask(__name__)
CORS(back)

arquivoJson = "bancoDeDados/banco.json"

def carregarDados():
    if os.path.exists(arquivoJson):
        with open(arquivoJson, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []

def atualizarJson(dados):
    with open(arquivoJson, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=4, ensure_ascii=False)

def enviarCodigo(email, tokenSeguro):
    remetente = "ana.goncalo@souunit.com.br"
    senha = "tqnhknqeuonxtsli"

    msg = MIMEText(f"Código de verificação: {tokenSeguro}")
    msg["Subject"] = "Verificação de e-mail."
    msg["From"] = remetente
    msg["To"] = email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as servidor:
            servidor.login(remetente, senha)
            servidor.sendmail(remetente, email, msg.as_string())
        print("Email enviado com sucesso")
    except Exception as e:
        print("Erro no envio do código:", e)


nome = ""
email = ""
senha = ""
# Função para receber nome, email e senha do JS
@back.route("/recebe-dados", methods=["POST"])
def recebeDadosJS():
    global nome, email, senha

    dado = request.get_json()
    nome = dado.get("nome")
    email = dado.get("email")
    senha = dado.get("senha")

    return jsonify({"mensagem": "Dados recebidos com sucesso!"}), 200



# Função para tratar dados
def trataDados():
    global nome, email, senha

    if not nome or not email or not senha:
        return jsonify({"mensagem": "Todos os campos são obrigatorios"}), 400
    
    dados = carregarDados()

    for usuario in dados:
        if usuario["nome"].lower() == nome.lower():
            return jsonify({"mensagem": "Nome já está cadastrado!"}), 409
        elif usuario["email"] == email:
            return jsonify({"mensagem": "Email já está cadastrado!"}), 409

    if re.search(r"[!@#$%^&*()<>'\"/]", nome):
        return jsonify({"mensagem": "O nome contém caracteres especiais."}), 400
    
    elif len(nome) < 3 or len(nome) > 12:
        return jsonify({"mensagem": "O nome deve ter entre 3 e 12 caracteres."}), 400
    
    elif re.search(r"[!#$%^&*()<>'\"/]", email):
        return jsonify({"mensagem": "O email contém caracteres especiais."}), 400

    elif re.search(r"[!@#$%^&*()<>'\"/]", senha):
        return jsonify({"mensagem": "A senha contém caracteres especiais."}), 400
    
    elif len(senha) < 8 or len(senha) > 15:
        return jsonify({"mensagem": "O senha deve ter entre 8 e 15 caracteres."}), 400
    
    else:
        return True




# Envia código para o email
@back.route("/rota-enviar-codigo", methods=["POST"])
def rotaEnviarCodigo():
    dado = request.get_json()
    email = dado.get("email")

    if not email:
        return jsonify({"mensagem": "Todos os campos são obrigatórios."}), 400
    
    tokenSeguro = secrets.token_urlsafe(4) # É gerado dois caracteres a mais do que foi pedido
    global token
    token = tokenSeguro
    enviarCodigo(email, tokenSeguro)
    return jsonify({"mensagem": "Código enviado com sucesso, verifique seu e-mail."}), 200




# Essa parte faz a validação do código, e dos dados, se estiver tudo bem ele salva
@back.route("/validar-codigo", methods=["POST"])
def validarCodigo():
    dado = request.get_json()
    
    codInformado = dado.get("codInformado")

    if codInformado != token:
        return jsonify({"mensagem": "Código inválido."}), 400
    elif not trataDados():
        return jsonify({"mensagem": "Dados incorretos."}), 400
    else:
        return salvaDados()
   


# Função que salva os dados
def salvaDados():
    global nome, email, senha
    dados = carregarDados()
    dados.append({
        "nome": nome,
        "email": email,
        "senha": senha
    })

    atualizarJson(dados)
    return jsonify({"mensagem": "Formulário salvo com sucesso!"}), 200




if __name__ == "__main__":
    back.run(debug=True)