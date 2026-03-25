FROM python:3.11-slim

# diretório da aplicação
WORKDIR /app

# copia requirements primeiro (melhor para cache de build)
COPY requirements.txt .

# cria ambiente virtual
RUN python -m venv /opt/venv

# ativa o venv no PATH
ENV PATH="/opt/venv/bin:$PATH"

# instala dependências
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# copia o resto da aplicação
COPY . .

# porta usada pelo uvicorn
EXPOSE 8000

# roda a aplicação
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]