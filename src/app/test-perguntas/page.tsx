'use client'
import { useState, useEffect } from 'react';

export default function TestPerguntas() {
  const [perguntas, setPerguntas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    carregarPerguntas();
  }, []);

  const carregarPerguntas = async () => {
    try {
      console.log('🧪 Test Page: Carregando perguntas...');
      
      const response = await fetch('/api/form/perguntas/exibir');
      const data = await response.json();
      
      console.log('📡 Test Page: Response status:', response.status);
      console.log('📋 Test Page: Data recebida:', data);
      
      if (response.ok) {
        const perguntasArray = Array.isArray(data.perguntas) ? data.perguntas : [];
        console.log('✅ Test Page: Perguntas processadas:', perguntasArray);
        setPerguntas(perguntasArray);
        
        if (perguntasArray.length === 0) {
          setMessage('Nenhuma pergunta encontrada');
        } else {
          setMessage(`${perguntasArray.length} perguntas encontradas!`);
        }
      } else {
        console.error('❌ Test Page: Erro na API:', data);
        setMessage(`Erro: ${data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Test Page: Erro de conexão:', error);
      setMessage('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>🔄 Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Teste de Perguntas</h1>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: message.includes('Erro') ? '#ffe6e6' : '#e6ffe6',
          borderRadius: '5px'
        }}>
          {message}
        </div>
      )}

      <h2>📋 Perguntas carregadas:</h2>
      
      {perguntas.length === 0 ? (
        <p>❌ Nenhuma pergunta encontrada</p>
      ) : (
        <div>
          {perguntas.map((pergunta, index) => (
            <div key={pergunta.id} style={{ 
              padding: '10px', 
              margin: '10px 0', 
              border: '1px solid #ccc', 
              borderRadius: '5px' 
            }}>
              <strong>Pergunta {index + 1}:</strong><br />
              <strong>ID:</strong> {pergunta.id}<br />
              <strong>Ordem:</strong> {pergunta.ordem}<br />
              <strong>Texto:</strong> {pergunta.texto_pergunta}<br />
              <strong>Ativa:</strong> {pergunta.ativa ? 'Sim' : 'Não'}
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: '30px 0' }} />
      
      <h2>🔄 Ações:</h2>
      <button 
        onClick={carregarPerguntas}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🔄 Recarregar Perguntas
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>📝 <strong>Como usar:</strong></p>
        <p>1. Abra o Console do navegador (F12)</p>
        <p>2. Veja os logs detalhados da requisição</p>
        <p>3. Verifique se as perguntas aparecem acima</p>
      </div>
    </div>
  );
}