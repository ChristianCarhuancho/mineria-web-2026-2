# Proyecto de Minería Web - Sesión de clase 05

Esta sesión trata la **representación vectorial de texto**: de contar
palabras a que el vector de una palabra cambie según la frase en la que
aparece. Cuatro métodos, cada uno corrigiendo una limitación concreta del
anterior — Bag-of-Words, TF-IDF, Word2Vec y Transformers/SBERT.

Los notebooks no scrapean: trabajan sobre los CSV de la tienda-virtual que
ya están **copiados en la carpeta `data/`** de este proyecto, más un corpus
de juguete de tres frases que se reutiliza en todo el recorrido para que
los resultados de cada método sean comparables entre sí.

## Instalación de dependencias

Requiere **Python 3.11+**.

```bash
pip install -r requirements.txt
python -m spacy download es_core_news_sm
```

El primer notebook que usa `gensim.downloader` (`04_word2vec.ipynb`) y el
primero que usa `sentence-transformers` (`05_transformers-sbert.ipynb`)
descargan sus modelos preentrenados solos la primera vez que se ejecutan
(unos 130 MB y 470 MB respectivamente) y quedan cacheados localmente.

## Datos (`data/`)

| Archivo | Contenido | Uso |
| --- | --- | --- |
| `productos.csv` | Catálogo: `nombre_producto`, `descripcion`, `categoria`, `precio` | Documentos para TF-IDF, el buscador semántico y el sistema de recomendación |
| `comentarios.csv` | Comentarios de clientes con calificación | Corpus para Bag-of-Words, TF-IDF y el Word2Vec propio |
| `clientes.csv` | Datos de cliente: ciudad, país, fecha de registro | Sistema de recomendación |
| `historial_de_compras.csv` | Compras por cliente (`id_producto`, `cantidad`) | Perfil de cliente para el sistema de recomendación |

## Notebooks (`notebooks/`)

Se recomienda ejecutarlos en este orden; cada uno reutiliza ideas del
anterior y todos son autocontenidos (`Run All` funciona de principio a fin).

| Notebook | Técnica | Qué hace |
| --- | --- | --- |
| `01_fundamentos-vectores-similitud.ipynb` | numpy | Qué es un vector, similitud coseno a mano, y la ley de Zipf / contenido informativo en bits — sobre un ejemplo de juguete y sobre los comentarios reales. |
| `02_bag-of-words.ipynb` | `CountVectorizer` | Vocabulario, matriz de conteos, similitud entre documentos y la limitación de perder el orden de las palabras. |
| `03_tfidf.ipynb` | `TfidfVectorizer` | IDF a mano, matriz TF-IDF, comparación contra Bag-of-Words. Incluye el **Ejercicio 01** (dispersión, ranking por coseno, `ngram_range`) sobre los 619 comentarios reales. |
| `04_word2vec.ipynb` | `gensim.Word2Vec`, GloVe preentrenado | Hipótesis distribucional, embeddings propios sobre los comentarios, y el **Ejercicio 02** (analogías vectoriales, sinónimos/antónimos) con un modelo preentrenado. |
| `05_transformers-sbert.ipynb` | `transformers`, `sentence-transformers` | Polisemia resuelta con vectores contextuales (demo con un Transformer real), self-attention implementada desde cero, codificación posicional, y el **Ejercicio 03** (buscador semántico vs. TF-IDF) sobre el catálogo de productos. |
| `06_sistema-recomendacion.ipynb` | `sentence-transformers` | Práctica integradora: perfil de cliente por promedio de embeddings, top-N de recomendaciones, y el problema real de agregar compras repetidas. |
| `07_sintesis-comparativa.ipynb` | — | Cierre: las tres representaciones sobre la misma frase, criterios de selección, errores frecuentes y glosario. |
