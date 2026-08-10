// aula-2/app/migration.js
import { supabase } from './supabase-config.js';

/**
 * Função principal de migração de dados localStorage → Supabase
 * Executa apenas uma vez (verifica flag _migrado_supabase)
 *
 * @param {string} usuario_id - ID do usuário logado (para preenchimento automático)
 * @returns {Promise<void>}
 */
export async function migrarDadosLocalStorage(usuario_id) {
  // Verificar se já migrou (flag em localStorage)
  if (localStorage.getItem('_migrado_supabase')) {
    console.log('ℹ️  Migração já foi realizada anteriormente. Pulando...');
    return; // já migrou, pula
  }

  console.log('🔄 Iniciando migração de dados localStorage → Supabase...');

  try {
    // ===== 1. Migrar Processos (compartilhado) =====
    await migrarProcessos(usuario_id);

    // ===== 2. Migrar Clientes (compartilhado) =====
    await migrarClientes(usuario_id);

    // ===== 3. Migrar Fluxos e Passos (compartilhado) =====
    await migrarFluxos(usuario_id);

    // ===== 4. Migrar Minhas Tarefas (pessoal) =====
    await migrarMinhasTarefas(usuario_id);

    // ===== 5. Migrar Tarefas da Equipe (pessoal) =====
    await migrarTarefasEquipe(usuario_id);

    // ===== 6. Migrar Prazos (pessoal) =====
    await migrarPrazos(usuario_id);

    // ===== 7. Migrar Certidões (pessoal) =====
    await migrarCertidoes(usuario_id);

    // ===== 8. Migrar Certificados (pessoal) =====
    await migrarCertificados(usuario_id);

    // Marcar como migrado
    localStorage.setItem('_migrado_supabase', 'true');
    console.log('✅ Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
  }
}

/**
 * Migra processos do localStorage para Supabase
 */
async function migrarProcessos(usuario_id) {
  const processos = JSON.parse(localStorage.getItem('processos') || '[]');

  if (processos.length === 0) {
    console.log('ℹ️  Nenhum processo para migrar');
    return;
  }

  try {
    const processosFormatados = processos.map(p => ({
      nome: p.nome || '',
      departamento: p.departamento || '',
      codigo: p.codigo || `AUTO-${Date.now()}`,
      link_drive: p.linkDrive || '',
      link_youtube: p.linkYoutube || null,
      status: p.status || 'ativo',
      observacoes: p.observacoes || '',
      criado_por: usuario_id
    }));

    const { error } = await supabase.from('processos').insert(processosFormatados);

    if (error) {
      console.error('❌ Erro ao migrar processos:', error);
    } else {
      console.log(`✅ ${processosFormatados.length} processo(s) migrado(s)`);
    }
  } catch (error) {
    console.error('❌ Erro durante migração de processos (catch):', error);
  }
}

/**
 * Migra clientes do localStorage para Supabase
 */
async function migrarClientes(usuario_id) {
  const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');

  if (clientes.length === 0) {
    console.log('ℹ️  Nenhum cliente para migrar');
    return;
  }

  try {
    const clientesFormatados = clientes.map(c => ({
      nome_empresa: c.nomeEmpresa || '',
      cnpj: c.cnpj || '',
      contato: c.contato || '',
      responsavel: c.responsavel || '',
      observacoes: c.observacoes || '',
      criado_por: usuario_id
    }));

    const { error } = await supabase.from('clientes').insert(clientesFormatados);

    if (error) {
      console.error('❌ Erro ao migrar clientes:', error);
    } else {
      console.log(`✅ ${clientesFormatados.length} cliente(s) migrado(s)`);
    }
  } catch (error) {
    console.error('❌ Erro durante migração de clientes (catch):', error);
  }
}

/**
 * Migra fluxos e passos do localStorage para Supabase
 */
async function migrarFluxos(usuario_id) {
  const fluxos = JSON.parse(localStorage.getItem('fluxos') || '[]');

  if (fluxos.length === 0) {
    console.log('ℹ️  Nenhum fluxo para migrar');
    return;
  }

  let fluxosMigrados = 0;
  let passosMigrados = 0;

  try {
    for (const fluxo of fluxos) {
      // Inserir fluxo
      const { data: fluxoInserido, error: erroFluxo } = await supabase
        .from('fluxos')
        .insert({
          nome: fluxo.nome || '',
          criado_por: usuario_id
        })
        .select();

      if (erroFluxo) {
        console.error(`⚠️  Erro ao migrar fluxo "${fluxo.nome}":`, erroFluxo);
        continue;
      }

      fluxosMigrados++;
      const fluxoId = fluxoInserido[0].id;

      // Migrar passos do fluxo (se houver)
      if (fluxo.passos && fluxo.passos.length > 0) {
        const passosFormatados = fluxo.passos.map((passo, idx) => ({
          fluxo_id: fluxoId,
          tipo: passo.tipo || 'acao',
          texto: passo.texto || '',
          processo_id: passo.processoId || null,
          ordem: idx,
          proximo_sim_id: null,  // Complexo mapear IDs antigos para novos
          proximo_nao_id: null
        }));

        const { error: erroPassos } = await supabase
          .from('passos_fluxo')
          .insert(passosFormatados);

        if (erroPassos) {
          console.error(`⚠️  Erro ao migrar passos do fluxo "${fluxo.nome}":`, erroPassos);
        } else {
          passosMigrados += passosFormatados.length;
        }
      }
    }

    console.log(`✅ ${fluxosMigrados} fluxo(s) e ${passosMigrados} passo(s) migrado(s)`);
  } catch (error) {
    console.error('❌ Erro durante migração de fluxos (catch):', error);
  }
}

/**
 * Migra minhas tarefas do localStorage para Supabase
 */
async function migrarMinhasTarefas(usuario_id) {
  const minhasTarefas = JSON.parse(localStorage.getItem('minhas_tarefas') || '[]');

  if (minhasTarefas.length === 0) {
    console.log('ℹ️  Nenhuma tarefa pessoal para migrar');
    return;
  }

  try {
    const tarefasFormatadas = minhasTarefas.map(t => ({
      usuario_id: usuario_id,
      titulo: t.titulo || '',
      descricao: t.descricao || '',
      prazo: t.prazo || null,
      status: t.status || 'a-fazer'
    }));

    const { error } = await supabase.from('alprox_s_s_is').insert(tarefasFormatadas);

    if (error) {
      console.error('❌ Erro ao migrar minhas tarefas:', error);
    } else {
      console.log(`✅ ${tarefasFormatadas.length} tarefa(s) pessoal(is) migrada(s)`);
    }
  } catch (error) {
    console.error('❌ Erro durante migração de minhas tarefas (catch):', error);
  }
}

/**
 * Migra tarefas da equipe do localStorage para Supabase
 */
async function migrarTarefasEquipe(usuario_id) {
  const tarefasEquipe = JSON.parse(localStorage.getItem('tarefas_equipe') || '[]');

  if (tarefasEquipe.length === 0) {
    console.log('ℹ️  Nenhuma tarefa de equipe para migrar');
    return;
  }

  try {
    const tarefasFormatadas = tarefasEquipe.map(t => ({
      criado_por: usuario_id,
      atribuido_para: t.responsavelId || usuario_id, // Fallback pro usuário que está migrando
      titulo: t.titulo || '',
      descricao: t.descricao || '',
      prazo: t.prazo || null,
      status: t.status || 'a-fazer'
    }));

    const { error } = await supabase.from('alprox_2s_equipe').insert(tarefasFormatadas);

    if (error) {
      console.error('❌ Erro ao migrar tarefas de equipe:', error);
    } else {
      console.log(`✅ ${tarefasFormatadas.length} tarefa(s) de equipe migrada(s)`);
    }
  } catch (error) {
    console.error('❌ Erro durante migração de tarefas de equipe (catch):', error);
  }
}

/**
 * Migra prazos do localStorage para Supabase
 */
async function migrarPrazos(usuario_id) {
  const prazos = JSON.parse(localStorage.getItem('prazos') || '[]');

  if (prazos.length === 0) {
    console.log('ℹ️  Nenhum prazo para migrar');
    return;
  }

  try {
    const prazosFormatados = prazos.map(p => ({
      usuario_id: usuario_id,
      titulo: p.titulo || '',
      cliente_id: p.clienteId || null,
      data_vencimento: p.dataVencimento || null,
      responsavel_id: p.responsavelId || null,
      status: p.status || 'pendente'
    }));

    const { error } = await supabase.from('prazos').insert(prazosFormatados);

    if (error) {
      console.error('❌ Erro ao migrar prazos:', error);
    } else {
      console.log(`✅ ${prazosFormatados.length} prazo(s) migrado(s)`);
    }
  } catch (error) {
    console.error('❌ Erro durante migração de prazos (catch):', error);
  }
}

/**
 * Migra certidões do localStorage para Supabase
 */
async function migrarCertidoes(usuario_id) {
  const certidoes = JSON.parse(localStorage.getItem('certidoes') || '[]');

  if (certidoes.length === 0) {
    console.log('ℹ️  Nenhuma certidão para migrar');
    return;
  }

  try {
    const hoje = new Date().toISOString().split('T')[0];
    const certiduesFormatadas = certidoes.map(c => ({
      usuario_id: usuario_id,
      cliente_id: c.clienteId || null,
      tipo: c.tipo || '',
      data_emissao: c.dataEmissao || null,
      data_validade: c.dataValidade || null,
      status: (c.dataValidade && c.dataValidade < hoje) ? 'vencida' : (c.status || 'válida')
    }));

    const { error } = await supabase.from('certidoes').insert(certiduesFormatadas);

    if (error) {
      console.error('❌ Erro ao migrar certidões:', error);
    } else {
      console.log(`✅ ${certiduesFormatadas.length} certidão(ões) migrada(s)`);
    }
  } catch (error) {
    console.error('❌ Erro durante migração de certidões (catch):', error);
  }
}

/**
 * Migra certificados do localStorage para Supabase
 */
async function migrarCertificados(usuario_id) {
  const certificados = JSON.parse(localStorage.getItem('certificados') || '[]');

  if (certificados.length === 0) {
    console.log('ℹ️  Nenhum certificado para migrar');
    return;
  }

  try {
    const hoje = new Date().toISOString().split('T')[0];
    const certificadosFormatados = certificados.map(c => ({
      usuario_id: usuario_id,
      cliente_id: c.clienteId || null,
      tipo: c.tipo || 'e-CNPJ',
      data_emissao: c.dataEmissao || null,
      data_validade: c.dataValidade || null,
      responsavel_id: c.responsavelId || null,
      status: (c.dataValidade && c.dataValidade < hoje) ? 'vencido' : (c.status || 'válido')
    }));

    const { error } = await supabase.from('certificados').insert(certificadosFormatados);

    if (error) {
      console.error('❌ Erro ao migrar certificados:', error);
    } else {
      console.log(`✅ ${certificadosFormatados.length} certificado(s) migrado(s)`);
    }
  } catch (error) {
    console.error('❌ Erro durante migração de certificados (catch):', error);
  }
}
