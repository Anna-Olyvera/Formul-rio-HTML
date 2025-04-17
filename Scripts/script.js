// FILTRAR DADOS
function validacaoNome(nome){
    if (/[!@#$%^&*()<>'\"/]/.test(nome)){
        document.getElementById('mensagemNome').textContent = "O nome não pode conter caracteres especiais.";
        return false;
    } // remover caracteres especiais
    else if (nome.length < 3){
        document.getElementById('mensagemNome').textContent = "O nome precisar ter no minímo 3 caracteres.";
        return false;
    }
    else if (nome.length > 12){
        document.getElementById('mensagemNome').textContent = "O nome não pode ter mais de 12 caracteres.";
        return false;
    }
    else {
        return true
    }
} 

function validacaoEmail(email){
    if (/[!#$%^&*()<>'\"/]/.test(email)){
        document.getElementById('mensagemEmail').textContent = "O email informado contém caracteres não válidos.";
        return false;
    }
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        document.getElementById('mensagemEmail').textContent = "Email informado é inválido.";
        return false;
    }
    else {
        return true;
    }
}

function validacaoSenha(senha){
    if (/[!@#$%^&*()<>'\"/]/.test(senha)){
        document.getElementById('mensagemSenha').textContent = "A senha não pode conter caracteres especiais.";
        return false;
    }
    else if (!/[a-zA-Z]/.test(senha)){
        document.getElementById('mensagemSenha').textContent = "A senha deve conter no minímo uma letra.";
        return false;
    }
    else if (!/[0-9]/.test(senha)){
        document.getElementById('mensagemSenha').textContent = "A senha deve ter no minímo um número."
    }
    else if (senha.length < 8){
        document.getElementById('mensagemSenha').textContent = "A senha de ter no minímo 8 caracteres.";
        return false;
    }
    else if (senha.length > 15){
        document.getElementById('mensagemSenha').textContent = "A senha deve ter no máximo 15 caracteres."
        return false;
    }
    else {
        return true;
    }
}

const buttonConfirmar = document.querySelector("#botaoConf")
const modal = document.querySelector("dialog")
buttonConfirmar.onclick = function(){
    const email = document.getElementById("campoEmail").value.trim().toLowerCase();

    if (!validacaoEmail(email)) {
        return;
    }

    enviarDados()
    solicitarCodigoVerificacao(email);
    modal.show();
}




// RECEBE, VALIDA E ENVIA
function enviarDados(){
    const nome = document.getElementById("campoNome").value.trim();
    const email = document.getElementById("campoEmail").value.trim().toLowerCase();
    const senha = document.getElementById("campoSenha").value.trim();


    if (!validacaoNome(nome) || !validacaoEmail(email) || !validacaoSenha(senha)){
        return;
    }

    fetch("http://localhost:5000/recebe-dados", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({nome, email, senha})
    })
    .then(async res =>  {
        const dado = await res.json();
        if (!res.ok) {
            document.getElementById("mensagemRecebida").textContent = "Erro ao salvar dados: " + dado.mensagem;
            return;
        }
        else{
            return document.getElementById("mensagemRecebida").textContent = dado.mensagem;
        }
    })
    .catch(err => {
        document.getElementById("mensagemRecebida").textContent = "Erro inesperado ao salvar dados.";
    });
}




function solicitarCodigoVerificacao(email) {
    fetch("http://localhost:5000/rota-enviar-codigo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    })
    .then(async res => {
        const resposta = await res.json();
        if (!res.ok) {
            document.getElementById("mensagemRecebida").textContent = resposta.mensagem;
        } else {
            document.getElementById("mensagemRecebida").textContent = resposta.mensagem;
        }
    })
    .catch(() => {
        document.getElementById("mensagemRecebida").textContent = "Erro ao enviar código de verificação.";
    });
}






async function validandoSalvando() {
    try {
        const codInformado = document.getElementById("campoCodInformado").value.trim();
        const resposta = await fetch("http://localhost:5000/validar-codigo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                codInformado: codInformado
            })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert(resultado.mensagem); // ou qualquer outro feedback positivo
        } else {
            alert("Erro: " + resultado.mensagem);
        }

    } catch (erro) {
        console.error("Erro ao validar e salvar:", erro);
        alert("Ocorreu um erro na comunicação com o servidor.");
    }
}