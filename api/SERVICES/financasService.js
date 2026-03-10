const mongoose = require("mongoose");

// ===== MODELO DE FINANÇAS =====
const financasSchema = new mongoose.Schema(
  {
    usuario: {
      type: String,
      required: true,
      trim: true,
    },
    rendas: [
      {
        descricao: {
          type: String,
          default: "Renda",
        },
        valor: {
          type: Number,
          required: true,
          min: 0,
        },
        ativo: {
          type: Boolean,
          default: true,
        },
      },
    ],
    despesas: [
      {
        descricao: {
          type: String,
          required: true,
        },
        valor: {
          type: Number,
          required: true,
          min: 0,
        },
        categoria: {
          type: String,
          enum: ["Alimentação", "Transporte", "Diversão", "Saúde", "Educação", "Outros"],
          default: "Outros",
        },
        data: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Financas = mongoose.model("Financas", financasSchema);

// ===== SERVIÇO DE FINANÇAS =====
class FinancasService {
  async obterOuCriar(usuario) {
    let financas = await Financas.findOne({ usuario });
    if (!financas) {
      financas = new Financas({ usuario, rendas: [], despesas: [] });
      await financas.save();
    }
    return financas;
  }

  async listarFinancas(usuario) {
    const financas = await this.obterOuCriar(usuario);
    return this.calcularResumo(financas);
  }

  // ===== RENDAS =====
  async adicionarRenda(usuario, descricao, valor) {
    const financas = await this.obterOuCriar(usuario);

    if (financas.rendas.length >= 5) {
      throw new Error("Limite de 5 rendas atingido!");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que 0!");
    }

    financas.rendas.push({
      descricao: descricao || "Renda",
      valor,
      ativo: true,
    });

    await financas.save();
    return this.calcularResumo(financas);
  }

  async atualizarRenda(usuario, indice, descricao, valor) {
    const financas = await this.obterOuCriar(usuario);

    if (indice < 0 || indice >= financas.rendas.length) {
      throw new Error("Índice de renda inválido!");
    }

    financas.rendas[indice].descricao = descricao;
    financas.rendas[indice].valor = valor;

    await financas.save();
    return this.calcularResumo(financas);
  }

  async atualizarStatusRenda(usuario, indice, ativo) {
    const financas = await this.obterOuCriar(usuario);

    if (indice < 0 || indice >= financas.rendas.length) {
      throw new Error("Índice de renda inválido!");
    }

    financas.rendas[indice].ativo = ativo;
    await financas.save();
    return this.calcularResumo(financas);
  }

  async deletarRenda(usuario, indice) {
    const financas = await this.obterOuCriar(usuario);

    if (indice < 0 || indice >= financas.rendas.length) {
      throw new Error("Índice de renda inválido!");
    }

    financas.rendas.splice(indice, 1);
    await financas.save();
    return this.calcularResumo(financas);
  }

  // ===== DESPESAS =====
  async adicionarDespesa(usuario, descricao, valor, categoria) {
    const financas = await this.obterOuCriar(usuario);

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que 0!");
    }

    financas.despesas.push({
      descricao,
      valor,
      categoria: categoria || "Outros",
      data: new Date(),
    });

    await financas.save();
    return this.calcularResumo(financas);
  }

  async atualizarDespesa(usuario, indice, descricao, valor, categoria) {
    const financas = await this.obterOuCriar(usuario);

    if (indice < 0 || indice >= financas.despesas.length) {
      throw new Error("Índice de despesa inválido!");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que 0!");
    }

    financas.despesas[indice].descricao = descricao;
    financas.despesas[indice].valor = valor;
    financas.despesas[indice].categoria = categoria || "Outros";

    await financas.save();
    return this.calcularResumo(financas);
  }

  async deletarDespesa(usuario, indice) {
    const financas = await this.obterOuCriar(usuario);

    if (indice < 0 || indice >= financas.despesas.length) {
      throw new Error("Índice de despesa inválido!");
    }

    financas.despesas.splice(indice, 1);
    await financas.save();
    return this.calcularResumo(financas);
  }

  // ===== CÁLCULOS =====
  calcularResumo(financas) {
    const rendaTotal = financas.rendas
      .filter((r) => r.ativo)
      .reduce((sum, r) => sum + r.valor, 0);

    const despesaTotal = financas.despesas.reduce((sum, d) => sum + d.valor, 0);

    const rendimento = rendaTotal - despesaTotal;

    // Agrupar despesas por categoria
    const despesasPorCategoria = {};
    financas.despesas.forEach((d) => {
      if (!despesasPorCategoria[d.categoria]) {
        despesasPorCategoria[d.categoria] = 0;
      }
      despesasPorCategoria[d.categoria] += d.valor;
    });

    return {
      usuario: financas.usuario,
      rendas: financas.rendas,
      despesas: financas.despesas,
      resumo: {
        rendaTotal,
        despesaTotal,
        rendimento,
        despesasPorCategoria,
      },
    };
  }

  async obterDespesasMes(usuario, mes, ano) {
    const financas = await this.obterOuCriar(usuario);

    const despesasFiltradas = financas.despesas.filter((d) => {
      const data = new Date(d.data);
      return data.getMonth() === mes - 1 && data.getFullYear() === ano;
    });

    return despesasFiltradas;
  }
}

module.exports = new FinancasService();
