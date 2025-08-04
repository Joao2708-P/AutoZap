# 🚀 Deploy no Vercel com Supabase PostgreSQL

## 1. Criar Projeto no Supabase

### Passo a Passo:

1. **Acesse**: https://supabase.com
2. **Faça login** com GitHub
3. **Clique em**: "New project"
4. **Configure**:
   - Nome: `from-fdm` (ou qualquer nome)
   - Região: `South America (São Paulo)` (mais próximo)
   - Password: Crie uma senha forte
5. **Aguarde** ~2 minutos para o projeto ser criado

## 2. Obter String de Conexão

1. No dashboard do Supabase → **Settings** → **Database**
2. Role até **Connection string** → **URI**
3. Copie a string (algo como):
   ```
   postgresql://postgres.xxxxx:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```

## 3. Configurar Variáveis de Ambiente

### No Vercel:
1. Dashboard do Vercel → seu projeto → **Settings** → **Environment Variables**
2. Adicione:

```bash
# OBRIGATÓRIO - Supabase PostgreSQL
DATABASE_URL=postgresql://postgres.xxxxx:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# OPCIONAL - WhatsApp Meta API
META_ACCESS_TOKEN=your_access_token_here
META_PHONE_NUMBER_ID=your_phone_number_id_here
META_BUSINESS_ACCOUNT_ID=your_business_account_id_here
META_WEBHOOK_VERIFY_TOKEN=fdm_webhook_token
```

## 3. Deploy

### Deploy Automático (Recomendado)
1. Conecte seu repositório ao Vercel
2. O deploy será automático a cada push

### Deploy Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel --prod
```

## 4. Migrar Dados (Opcional)

Se você já tem dados no SQLite local:

```bash
# 1. Configure a variável de ambiente local
echo "DATABASE_URL=sua_url_postgresql_aqui" > .env.local

# 2. Execute a migração
npm run migrate
```

## 5. Verificar Deploy

1. Acesse sua URL do Vercel
2. Teste o cadastro de leads
3. Verifique se os dados estão sendo salvos no PostgreSQL

## 🔧 Troubleshooting

### Erro de Conexão
- Verifique se a `DATABASE_URL` está correta
- Confirme que o IP do Vercel tem acesso ao banco
- Para Vercel Postgres, use `POSTGRES_URL` ao invés de `DATABASE_URL`

### Erro de Schema
- As tabelas são criadas automaticamente
- Se houver erro, verifique os logs no dashboard do Vercel

### Performance
- O PostgreSQL é muito mais performático que SQLite
- Conexões são otimizadas com connection pooling

## 📈 Vantagens da Migração

✅ **Escalabilidade**: Suporta muito mais usuários simultâneos  
✅ **Performance**: Queries mais rápidas e otimizadas  
✅ **Confiabilidade**: Backup automático e alta disponibilidade  
✅ **Produção**: Adequado para aplicações em produção  
✅ **Analytics**: Fácil integração com ferramentas de BI  

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no dashboard do Vercel
2. Confirme as variáveis de ambiente
3. Teste a conexão com o banco localmente