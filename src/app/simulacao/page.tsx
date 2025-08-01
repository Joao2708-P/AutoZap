'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './simulacao.module.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface SimulationData {
  lead: {
    nome: string;
    email: string;
    telefone: string;
    id: number;
  };
  respostas: number;
  cenarios: string[];
  status: string;
  leadId?: number;

  totalMensagens?: number;
  messages?: Array<{
    id: string;
    text: string;
    sender: 'user' | 'system';
    timestamp: Date;
    status?: string;
  }>;
}

interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  modelo_de_negocio: string;
  total_respostas: number;
}

export default function SimulacaoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [currentScenario, setCurrentScenario] = useState<string>('');

  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (text: string, sender: 'user' | 'system', delay: number = 0) => {
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        sender,
        timestamp: new Date(),
        status: sender === 'system' ? 'sending' : undefined
      };

      setMessages(prev => [...prev, newMessage]);

      // Simular status de envio para mensagens do sistema
      if (sender === 'system') {
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'sent' }
                : msg
            )
          );
        }, 1000);

        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'delivered' }
                : msg
            )
          );
        }, 2000);
      }
    }, delay);
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setMessages([]);
    setCurrentScenario('');

    try {
      const url = selectedLeadId 
        ? `/api/demo-simulation/${selectedLeadId}`
        : '/api/demo-simulation';
        
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSimulationData(data);
        
        // Usar as mensagens reais da API
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach((message: NonNullable<SimulationData['messages']>[0], index: number) => {
            const delay = (index + 1) * 2000; // 2 segundos entre cada mensagem
            addMessage(message.text, message.sender, delay);
          });
        }

        setCurrentScenario(`Cenário: Fluxo Completo com Follow-up (ID: ${data.lead.id}) - ${data.totalMensagens} mensagens`);
      } else {
        setCurrentScenario(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro na simulação:', error);
      setCurrentScenario('Erro na simulação');
    } finally {
      setIsRunning(false);
    }
  };

  const runNoResponseScenario = async () => {
    setIsRunning(true);
    setMessages([]);
    setCurrentScenario('');

    // Primeiro contato
    addMessage(`Olá ${simulationData?.lead.nome || 'Usuário'}! 👋\n\nObrigado por se cadastrar em nosso sistema!`, 'system', 1000);

    // Simular resposta do usuário
    addMessage('Oi! Quero saber mais...', 'user', 4000);

    // Resposta do sistema
    addMessage(`Olá ${simulationData?.lead.nome || 'Usuário'}! 👋\n\nComo posso ajudá-lo hoje?`, 'system', 6000);

    // Aguardar e enviar follow-up
    addMessage(`Oi ${simulationData?.lead.nome || 'Usuário'}! 👋\n\nNão esqueça que estamos aqui para ajudar!\n\nQue tal agendar uma demonstração gratuita?\n\n📅 Disponível hoje mesmo!`, 'system', 10000);

    // Última tentativa
    addMessage(`${simulationData?.lead.nome || 'Usuário'}, última chance!\n\n🎁 Oferecemos 7 dias grátis!\n\nQuer experimentar?`, 'system', 15000);

    setCurrentScenario('Cenário: Sem Resposta - Lead Inativo');
    setIsRunning(false);
  };

  const runExitScenario = async () => {
    setIsRunning(true);
    setMessages([]);
    setCurrentScenario('');

    // Primeiro contato
    addMessage(`Olá ${simulationData?.lead.nome || 'Usuário'}! 👋\n\nObrigado por se cadastrar em nosso sistema!`, 'system', 1000);

    // Simular resposta negativa do usuário
    addMessage('Não tenho interesse, obrigado', 'user', 4000);

    // Resposta final do sistema
    addMessage(`Entendemos ${simulationData?.lead.nome || 'Usuário'}! 🙏\n\nObrigado pelo seu tempo.\n\nSe mudar de ideia, estamos aqui!\n\nBoa sorte em seus projetos! 👋`, 'system', 6000);

    setCurrentScenario('Cenário: Saída do Fluxo - Não Interessado');
    setIsRunning(false);
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/simulation-history');
      const data = await response.json();
      
      if (data.success && data.messages.length > 0) {
        setMessages(data.messages);
        setCurrentScenario('Histórico de Simulações Anteriores');
      } else {
        setCurrentScenario('Nenhum histórico disponível');
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setCurrentScenario('Erro ao carregar histórico');
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setCurrentScenario('');
  };

  const loadLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      
      if (data.success) {
        setLeads(data.leads);
        setShowLeadSelector(true);
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    }
  };

  const selectLead = (leadId: number) => {
    setSelectedLeadId(leadId);
    setShowLeadSelector(false);
    const selectedLead = leads.find(lead => lead.id === leadId);
    if (selectedLead) {
      setCurrentScenario(`Lead selecionado: ${selectedLead.nome} (ID: ${leadId})`);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎯 Simulação de Atendimento WhatsApp</h1>
        <p>Veja como o atendente conversa com o cliente após o formulário</p>
      </div>

      <div className={styles.controls}>
        <button 
          onClick={runSimulation} 
          disabled={isRunning}
          className={styles.btnPrimary}
        >
          {isRunning ? '🔄 Executando...' : '🚀 Simular Atendimento Completo'}
        </button>
        
        <button 
          onClick={runNoResponseScenario} 
          disabled={isRunning}
          className={styles.btnSecondary}
        >
          📱 Cenário: Sem Resposta
        </button>
        
        <button 
          onClick={runExitScenario} 
          disabled={isRunning}
          className={styles.btnSecondary}
        >
          🚪 Cenário: Saída do Fluxo
        </button>
        
        <button 
          onClick={loadHistory} 
          disabled={isRunning}
          className={styles.btnSecondary}
        >
          📋 Ver Histórico
        </button>
        
        {messages.length > 0 && (
          <button 
            onClick={clearMessages} 
            disabled={isRunning}
            className={styles.btnSecondary}
          >
            🗑️ Limpar
          </button>
        )}
        
        <button 
          onClick={loadLeads} 
          disabled={isRunning}
          className={styles.btnSecondary}
        >
          👥 Selecionar Lead
        </button>
        
        <button 
          onClick={() => setAutoScroll(!autoScroll)} 
          disabled={isRunning}
          className={`${styles.btnSecondary} ${autoScroll ? styles.btnActive : ''}`}
        >
          {autoScroll ? '🔄 Auto-scroll ON' : '⏸️ Auto-scroll OFF'}
        </button>
      </div>

      {currentScenario && (
        <div className={styles.scenarioInfo}>
          <h3>{currentScenario}</h3>
        </div>
      )}

      {showLeadSelector && (
        <div className={styles.leadSelector}>
          <h3>Selecione um Lead para Simular</h3>
          <div className={styles.leadsList}>
            {leads.map((lead) => (
              <div 
                key={lead.id} 
                className={styles.leadItem}
                onClick={() => selectLead(lead.id)}
              >
                <div className={styles.leadInfo}>
                  <h4>{lead.nome}</h4>
                  <p>{lead.email}</p>
                  <p>{lead.telefone}</p>
                  <span className={styles.leadStats}>
                    {lead.total_respostas} respostas
                  </span>
                </div>
                <div className={styles.leadId}>ID: {lead.id}</div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowLeadSelector(false)}
            className={styles.btnSecondary}
          >
            Cancelar
          </button>
        </div>
      )}

      <div className={styles.whatsappContainer}>
        <div className={styles.whatsappHeader}>
          <div className={styles.contactInfo}>
            <div className={styles.avatar}>
              {simulationData?.lead.nome?.charAt(0) || 'U'}
            </div>
                         <div className={styles.contactDetails}>
               <h3>{simulationData?.lead.nome || 'Cliente'}</h3>
               <span>{simulationData?.lead.telefone || '+55 11 99999-9999'}</span>
             </div>
          </div>
                     <div className={styles.status}>
             {isRunning ? '🔄 Simulando...' : '👨‍💼 Atendente'}
           </div>
        </div>

        <div className={styles.messagesContainer}>
          {messages.length === 0 && !isRunning && (
            <div className={styles.emptyState}>
                           <div className={styles.emptyIcon}>💬</div>
             <h3>Nenhum atendimento ainda</h3>
             <p>Clique em &quot;Simular Atendimento&quot; para ver como funciona!</p>
            </div>
          )}

          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`${styles.message} ${styles[message.sender]} ${message.status === 'sending' ? styles.sending : ''}`}
            >
              <div className={styles.messageContent}>
                {message.text.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
              <div className={styles.messageTime}>
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {message.sender === 'system' && (
                  <span className={styles.statusIcon}>
                    {message.status === 'sending' && '⏳'}
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

             {simulationData && (
         <div className={styles.stats}>
                       <h3>📊 Estatísticas do Atendimento</h3>
           <div className={styles.statsGrid}>
             <div className={styles.stat}>
               <span className={styles.statLabel}>Lead:</span>
               <span className={styles.statValue}>{simulationData.lead.nome}</span>
             </div>
             <div className={styles.stat}>
               <span className={styles.statLabel}>Email:</span>
               <span className={styles.statValue}>{simulationData.lead.email}</span>
             </div>
             <div className={styles.stat}>
               <span className={styles.statLabel}>Respostas:</span>
               <span className={styles.statValue}>{simulationData.respostas}</span>
             </div>
                         <div className={styles.stat}>
              <span className={styles.statLabel}>Status:</span>
              <span className={styles.statValue}>{simulationData.status}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total Mensagens:</span>
              <span className={styles.statValue}>{simulationData.totalMensagens || simulationData.messages?.length || 0}</span>
            </div>
           </div>
           
                       

            {simulationData.cenarios && simulationData.cenarios.length > 0 && (
              <div className={styles.followUpTimeline}>
                                 <h4>⏰ Cronograma de Follow-up Automático</h4>
                <div className={styles.timelineList}>
                  {simulationData.cenarios.map((cenario, index) => (
                    <div key={index} className={styles.timelineItem}>
                      <div className={styles.timelineDot}>
                        {index + 1}
                      </div>
                      <div className={styles.timelineContent}>
                        <strong>{cenario}</strong>
                                                 {index >= 6 && (
                           <span className={styles.timelineTime}>
                             {index === 6 ? '24h depois' : 
                              index === 7 ? '48h depois' : 
                              index === 8 ? '72h depois' : 
                              index === 9 ? '96h depois' : 
                              index === 10 ? '120h depois' : 
                              index === 11 ? '144h depois' : 
                              '168h depois'}
                           </span>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
         </div>
       )}
    </div>
  );
} 