const mongoose = require("mongoose");
const crypto = require("crypto");

// ===== MODELO DE USUÁRIOS =====
const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    login: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    senha: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash de senha antes de salvar
usuarioSchema.pre("save", function (next) {
  if (!this.isModified("senha")) return next();

  // Usando SHA256 para hash seguro
  this.senha = crypto
    .createHash("sha256")
    .update(this.senha)
    .digest("hex");

  next();
});

// Método para verificar senha
usuarioSchema.methods.verificarSenha = function (senhaPlain) {
  const senhaHash = crypto
    .createHash("sha256")
    .update(senhaPlain)
    .digest("hex");
  return this.senha === senhaHash;
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

// ===== SERVIÇO DE USUÁRIOS =====
class UsuarioService {
  async criar(nome, login, senha, email = "", isAdmin = false) {
    // Validações
    if (!nome || !login || !senha) {
      throw new Error("Nome, login e senha são obrigatórios!");
    }

    if (login.length < 3) {
      throw new Error("Login deve ter no mínimo 3 caracteres!");
    }

    if (senha.length < 4) {
      throw new Error("Senha deve ter no mínimo 4 caracteres!");
    }

    // Verifica se login já existe
    const usuarioExistente = await Usuario.findOne({ login: login.toLowerCase() });
    if (usuarioExistente) {
      throw new Error("Login já existe!");
    }

    const novoUsuario = new Usuario({
      nome,
      login: login.toLowerCase(),
      senha,
      email,
      isAdmin,
      ativo: true,
    });

    await novoUsuario.save();

    return this.formatar(novoUsuario);
  }

  async listar() {
    const usuarios = await Usuario.find().select("-senha");
    return usuarios.map((u) => this.formatar(u));
  }

  async obterPorId(id) {
    const usuario = await Usuario.findById(id).select("-senha");
    if (!usuario) {
      throw new Error("Usuário não encontrado!");
    }
    return this.formatar(usuario);
  }

  async obterPorLogin(login) {
    const usuario = await Usuario.findOne({ login: login.toLowerCase() });
    if (!usuario) {
      throw new Error("Usuário ou senha inválidos!");
    }
    return usuario;
  }

  async autenticar(login, senha) {
    const usuario = await this.obterPorLogin(login);

    if (!usuario.ativo) {
      throw new Error("Usuário inativo!");
    }

    if (!usuario.verificarSenha(senha)) {
      throw new Error("Usuário ou senha inválidos!");
    }

    return this.formatar(usuario);
  }

  async atualizar(id, dados) {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      throw new Error("Usuário não encontrado!");
    }

    if (dados.nome) usuario.nome = dados.nome;
    if (dados.email) usuario.email = dados.email;
    if (dados.login && dados.login !== usuario.login) {
      // Verifica se novo login já existe
      const existente = await Usuario.findOne({
        login: dados.login.toLowerCase(),
        _id: { $ne: id },
      });
      if (existente) {
        throw new Error("Login já está em uso!");
      }
      usuario.login = dados.login.toLowerCase();
    }
    if (dados.senha) {
      // Força a hash da nova senha
      usuario.senha = dados.senha;
    }
    if (dados.ativo !== undefined) usuario.ativo = dados.ativo;
    if (dados.isAdmin !== undefined) usuario.isAdmin = dados.isAdmin;

    await usuario.save();
    return this.formatar(usuario);
  }

  async deletar(id) {
    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) {
      throw new Error("Usuário não encontrado!");
    }
    return { mensagem: "Usuário deletado com sucesso!" };
  }

  async alterarSenha(id, senhaNova) {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      throw new Error("Usuário não encontrado!");
    }

    if (senhaNova.length < 4) {
      throw new Error("Senha deve ter no mínimo 4 caracteres!");
    }

    usuario.senha = senhaNova;
    await usuario.save();

    return { mensagem: "Senha alterada com sucesso!" };
  }

  formatar(usuario) {
    return {
      id: usuario._id,
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      isAdmin: usuario.isAdmin,
      ativo: usuario.ativo,
      criadoEm: usuario.createdAt,
    };
  }

  // Gera um JWT simples (base64)
  gerarToken(usuario) {
    const payload = {
      id: usuario._id,
      login: usuario.login,
      isAdmin: usuario.isAdmin,
      iat: Date.now(),
    };

    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }

  // Verifica token
  verificarToken(token) {
    try {
      const payload = JSON.parse(Buffer.from(token, "base64").toString());
      return payload;
    } catch (e) {
      throw new Error("Token inválido!");
    }
  }
}

module.exports = new UsuarioService();
