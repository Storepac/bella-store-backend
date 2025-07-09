FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar código fonte
COPY --chown=nodejs:nodejs . .

# Criar diretório de uploads
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Usar usuário não-root
USER nodejs

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "start"] 