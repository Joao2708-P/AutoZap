'use client';
import BackgroundBubbles from '../components/ui/backgroundBubles';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import styles from './styles/form.module.css';

const Form = () => {
    const [form, setForm] = useState({
        nome: '',
        telefone: '',
        email: '',
        modelo_de_negocio: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(''); 
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/form/leads', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(form)
            }); 

            const data = await response.json();

            if(response.ok) {
                const id = data.leadId;
                setMessage('Lead cadastrado com sucesso!');
                setForm({nome: '', telefone: '', email: '', modelo_de_negocio: ''});
                
                router.push(`/perguntas?lead_id=${id}`)
            }
            else {
                setMessage(data.message || 'Erro ao cadastrar usuário')
            }
        }
        catch(error) {
            setMessage('Erro interno no servidor');
        }
        finally {
            setLoading(false);
        }
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className={styles.container}>
            <BackgroundBubbles/>
            <h1 className={styles.title}>Bem-Vindo! ao Automatizer</h1>
            <div className={styles.content}>
                <div className={styles.contentMaster}>
                    <h3>Preencha o formulário</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.input}>
                            <label>Nome</label>
                            <div className={styles.inputStyle}>
                                <input 
                                    type="text"
                                    name='nome'
                                    value={form.nome}
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                        <div className={styles.input}>
                            <label>Email</label>
                            <div className={styles.inputStyle}>
                                <input 
                                    type="email" 
                                    name='email'
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className={styles.input}>
                            <label>Telefone</label>
                            <div className={styles.inputStyle}>
                                <input 
                                    type="tel" 
                                    name='telefone'
                                    value={form.telefone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className={styles.input}>
                            <label>Modelo de negocio</label>
                            <div className={styles.inputStyle}>
                                <input 
                                    type="text" 
                                    name='modelo_de_negocio'
                                    value={form.modelo_de_negocio}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button type='submit' disabled={loading} className={styles.btn}>
                            { loading ? 'Enviando' : 'Enviar' }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Form