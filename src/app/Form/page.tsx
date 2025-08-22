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
    const [errors, setErrors] = useState({
        nome: '',
        email: '',
        telefone: '',
        modelo_de_negocio: ''
    });
    const router = useRouter();

    const validateNome = (value: string) => {
        const nome = value.trim();
        if (!nome) return 'Nome é obrigatório';
        if (nome.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
        return '';
    };

    const validateEmail = (value: string) => {
        const email = value.trim();
        if (!email) return 'Email é obrigatório';
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) return 'Email inválido';
        return '';
    };

    const validateTelefone = (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (!digits) return 'Telefone é obrigatório';
        if (digits.length < 10 || digits.length > 13) return 'Telefone deve ter entre 10 e 13 dígitos';
        return '';
    };

    const validateModelo = (value: string) => {
        const modelo = value.trim();
        if (!modelo) return 'Modelo de negócio é obrigatório';
        if (modelo.length < 3) return 'Modelo de negócio deve ter pelo menos 3 caracteres';
        return '';
    };

    const validateAll = (data: typeof form) => {
        const newErrors = {
            nome: validateNome(data.nome),
            email: validateEmail(data.email),
            telefone: validateTelefone(data.telefone),
            modelo_de_negocio: validateModelo(data.modelo_de_negocio)
        };
        setErrors(newErrors);
        return Object.values(newErrors).every((e) => e === '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const isValid = validateAll(form);
        if (!isValid) {
            setLoading(false);
            setMessage('Verifique os campos destacados.');
            return;
        }

        try {
            const response = await fetch('/api/form/leads', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    ...form,
                    nome: form.nome.trim(),
                    email: form.email.trim(),
                    telefone: form.telefone.replace(/\D/g, ''),
                    modelo_de_negocio: form.modelo_de_negocio.trim()
                })
            }); 

            const data = await response.json();

            if(response.ok) {
                const id = data.leadId;
                setMessage('Lead cadastrado com sucesso!');
                setForm({nome: '', telefone: '', email: '', modelo_de_negocio: ''});
                setErrors({ nome: '', email: '', telefone: '', modelo_de_negocio: '' });
                
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
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value
        })

        // validação por campo
        if (name === 'nome') setErrors((prev) => ({ ...prev, nome: validateNome(value) }));
        if (name === 'email') setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        if (name === 'telefone') setErrors((prev) => ({ ...prev, telefone: validateTelefone(value) }));
        if (name === 'modelo_de_negocio') setErrors((prev) => ({ ...prev, modelo_de_negocio: validateModelo(value) }));
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
                            <div className={`${styles.inputStyle} ${errors.nome ? styles.inputError : ''}`}>
                                <input 
                                    type="text"
                                    name='nome'
                                    value={form.nome}
                                    onChange={handleChange} 
                                    minLength={3}
                                    maxLength={80}
                                    required
                                />
                            </div>
                            {errors.nome && (<span className={styles.errorText}>{errors.nome}</span>)}
                        </div>
                        <div className={styles.input}>
                            <label>Email</label>
                            <div className={`${styles.inputStyle} ${errors.email ? styles.inputError : ''}`}>
                                <input 
                                    type="email" 
                                    name='email'
                                    value={form.email}
                                    onChange={handleChange}
                                    inputMode="email"
                                    required
                                />
                            </div>
                            {errors.email && (<span className={styles.errorText}>{errors.email}</span>)}
                        </div>
                        <div className={styles.input}>
                            <label>Telefone</label>
                            <div className={`${styles.inputStyle} ${errors.telefone ? styles.inputError : ''}`}>
                                <input 
                                    type="tel" 
                                    name='telefone'
                                    value={form.telefone}
                                    onChange={handleChange}
                                    inputMode="tel"
                                    pattern="[0-9()+\-\s]+"
                                    required
                                />
                            </div>
                            {errors.telefone && (<span className={styles.errorText}>{errors.telefone}</span>)}
                        </div>
                        <div className={styles.input}>
                            <label>Modelo de negocio</label>
                            <div className={`${styles.inputStyle} ${errors.modelo_de_negocio ? styles.inputError : ''}`}>
                                <input 
                                    type="text" 
                                    name='modelo_de_negocio'
                                    value={form.modelo_de_negocio}
                                    onChange={handleChange}
                                    minLength={3}
                                    maxLength={120}
                                    required
                                />
                            </div>
                            {errors.modelo_de_negocio && (<span className={styles.errorText}>{errors.modelo_de_negocio}</span>)}
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