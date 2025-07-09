# 🔍 Debug do Backend - Encontrar URL Correta

## 1. No Painel do Dokploy

### Verificar Status:
1. Acesse o painel do Dokploy
2. Vá para o projeto do backend
3. Verifique se está com status **"Running"**
4. Olhe os **Logs** para ver se há erros

### Encontrar a URL correta:
1. No painel do backend, procure por **"Domains"** ou **"URLs"**
2. A URL será algo como:
   - `https://backend-nome.dokploy.com`
   - `https://bella-store-backend.dokploy.com`
   - `https://seu-usuario-backend.dokploy.com`

## 2. Possíveis Problemas

### Bad Gateway significa:
- ❌ Backend não está rodando
- ❌ Porta errada configurada
- ❌ URL incorreta
- ❌ Firewall bloqueando
- ❌ SSL/HTTPS mal configurado

### Verificações:
1. **Logs do Backend**: Procure por erros de conexão com banco
2. **Health Check**: Teste com a URL correta
3. **Porta**: Confirme se é 3001
4. **SSL**: Use HTTPS, não HTTP

## 3. Testando a URL Correta

Quando encontrar a URL correta, teste:

```bash
# Substitua pela URL correta
curl https://sua-url-backend.dokploy.com/health

# Ou teste no navegador:
https://sua-url-backend.dokploy.com/health
```

## 4. Configuração do CORS

Se a URL estiver funcionando, atualize o CORS no Dokploy:

```env
CORS_ORIGINS=https://sua-url-frontend.dokploy.com,https://seu-dominio.com
```

## 5. Exemplo de URL Correta

❌ **Errado:**
```
http://bella-frontend-ze7wni-da10f0-152-53-192-161.traefik.me/health
```

✅ **Correto:**
```
https://bella-store-backend.dokploy.com/health
```

## 6. Próximos Passos

1. ✅ Encontre a URL correta do backend
2. ✅ Teste o health check
3. ✅ Configure o frontend
4. ✅ Atualize o CORS se necessário 