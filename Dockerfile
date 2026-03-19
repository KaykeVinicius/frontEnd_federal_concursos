# Base image
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copia dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Build do Next.js
RUN npm run build

# Expõe a porta padrão do Next
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "start"]