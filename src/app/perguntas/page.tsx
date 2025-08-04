'use client'
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './styles/questions.module.css';

interface Pergunta {
  id: number;
  texto_pergunta: string;
  ordem: number;
}

interface Resposta {
  pergunta_id: number;
  resposta_usuario: string;
}

const QuestionsContent = () => {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('lead_id');

  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('🔄 Frontend: useEffect executado, leadId:', leadId);
    if (leadId) {
      carregarPerguntas();
    } else {
      console.log('⚠️ Frontend: leadId não encontrado na URL');
      setMessage('ID do lead não encontrado na URL. Acesse através do formulário de cadastro.');
      setLoading(false);
    }
  }, [leadId]);

  const carregarPerguntas = async () => {
    try {
      console.log('🔍 Frontend: Carregando perguntas...');
      
      const response = await fetch('/api/form/perguntas/exibir');
      const data = await response.json();
      
      console.log('📡 Frontend: Response status:', response.status);
      console.log('📋 Frontend: Data recebida:', data);
      
      if (response.ok) {
        // Garantir que sempre seja um array
        const perguntasArray = Array.isArray(data.perguntas) ? data.perguntas : [];
        console.log('✅ Frontend: Perguntas processadas:', perguntasArray);
        setPerguntas(perguntasArray);
        
        if (perguntasArray.length === 0) {
          setMessage('Nenhuma pergunta ativa encontrada. Verifique se as perguntas estão marcadas como ativas.');
        }
      } else {
        console.error('❌ Frontend: Erro na API:', data);
        setMessage(`Erro ao carregar perguntas: ${data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Frontend: Erro de conexão:', error);
      setMessage('Erro ao carregar perguntas - verifique sua conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleRespostaChange = (perguntaId: number, resposta: string) => {
    setRespostas(prev => {
      const existing = prev.find(r => r.pergunta_id === perguntaId);
      if (existing) {
        return prev.map(r => r.pergunta_id === perguntaId ? { ...r, resposta_usuario: resposta } : r);
      } else {
        return [...prev, { pergunta_id: perguntaId, resposta_usuario: resposta }];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      console.log('🚀 Iniciando envio de respostas...');

      // 1. Salvar respostas no banco
      console.log('📝 Salvando respostas...');
      const promises = respostas.map(resposta =>
        fetch('/api/form/respostas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pergunta_id: resposta.pergunta_id,
            lead_id: leadId,
            resposta_usuario: resposta.resposta_usuario
          })
        })
      );

      const results = await Promise.all(promises);
      const hasError = results.some(r => !r.ok);

      if (hasError) {
        console.error('❌ Erro ao salvar respostas');
        setMessage('Erro ao salvar respostas');
        return;
      }

      console.log('✅ Respostas salvas com sucesso');

      // 2. Enviar para atendentes (formato simplificado)
      console.log('📱 Enviando para atendentes...');
      const atendentesResponse = await fetch('/api/form/atendentes/novo-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId })
      });

      if (atendentesResponse.ok) {
        console.log('✅ Lead enviado para atendentes com sucesso');
        setMessage('Respostas enviadas com sucesso! Entraremos em contato em breve.');
        setRespostas([]);
      } else {
        console.error('❌ Erro ao enviar para atendentes');
        setMessage('Respostas salvas, mas erro ao notificar atendentes');
      }

    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      setMessage('Erro ao processar respostas');
    } finally {
      setSubmitting(false);
    }
  };

  if (!leadId) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <p>Lead não identificado</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <p>Carregando perguntas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Nos ajude a conhecer você!</h1>
        
        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}

        {!perguntas || perguntas.length === 0 ? (
          <p>Nenhuma pergunta disponível no momento.</p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {perguntas.map((pergunta, index) => (
              <div key={pergunta.id} className={styles.inputGroup}>
                <label htmlFor={`pergunta-${pergunta.id}`}>
                  {index + 1}. {pergunta.texto_pergunta}
                </label>
                <input
                  id={`pergunta-${pergunta.id}`}
                  type="text"
                  placeholder="Digite sua resposta..."
                  value={respostas.find(r => r.pergunta_id === pergunta.id)?.resposta_usuario || ''}
                  onChange={(e) => handleRespostaChange(pergunta.id, e.target.value)}
                  required
                />
              </div>
            ))}
            
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={submitting || respostas.length === 0}
            >
              {submitting ? 'Enviando...' : 'Enviar respostas'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Questions = () => {
  return (
    <Suspense fallback={
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <p>Carregando...</p>
        </div>
      </div>
    }>
      <QuestionsContent />
    </Suspense>
  );
};

export default Questions;
