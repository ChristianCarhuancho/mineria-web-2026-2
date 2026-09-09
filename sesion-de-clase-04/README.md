# Proyecto de Minería Web - Sesión de clase 04

Esta sesión trata la **minería de texto y el Procesamiento del Lenguaje Natural**:
tokenización, normalización, n-gramas y las representaciones Bag of Words y TF-IDF.

Los notebooks no scrapean: trabajan sobre los CSV de texto de la tienda-virtual que
ya están **copiados en la carpeta `datos/`** de este proyecto.

## Instalación de dependencias

Requiere **Python 3.8+**.

```bash
pip install -r requirements.txt
python -m spacy download es_core_news_sm
```

Los recursos de NLTK (`punkt`, `punkt_tab`, `stopwords`) se descargan solos la
primera vez desde cada notebook con `nltk.download(...)`.

## Datos (`datos/`)

| Archivo | Contenido | Uso |
| --- | --- | --- |
| `resenas_entrega.csv` | Reseñas de entrega (`post_compra`): `texto`, `calificacion`, `producto_id`, ... | Corpus para tokenización, n-gramas y el pipeline completo |
| `comentarios.csv` | Testimonios / comentarios de clientes: `texto`, `calificacion`, ciudad, país, ... | Corpus para el notebook de normalización |
| `productos.csv` | Catálogo: `nombre`, `descripcion`, `categoria`, ... | Las **descripciones** son los "documentos" para Bag of Words y TF-IDF |

## Ejercicios (`notebooks/`)

Se recomienda ejecutarlos en este orden; cada uno reutiliza ideas del anterior.

| Notebook | Técnica | Qué hace |
| --- | --- | --- |
| `01_tokenizacion.ipynb` | NLTK (`sent_tokenize`, `word_tokenize`) + spaCy | Divide las reseñas de entrega en frases y palabras; muestra el vocabulario crudo y los atributos lingüísticos por token (POS, lema, stopword). Introduce la tokenización en subpalabras (BPE / WordPiece). |
| `02_normalizacion.ipynb` | `re`, NLTK stopwords, `SnowballStemmer`, spaCy | Sobre los comentarios de clientes: minúsculas, quita puntuación y stopwords, y compara **stemming** (Snowball) con **lematización** (spaCy). Deja una función `normalizar()` reutilizable. |
| `03_ngram.ipynb` | `nltk.ngrams`, `CountVectorizer(ngram_range=...)` | Unigramas, bigramas y trigramas de las reseñas; n-gramas de contenido más frecuentes; estimación de probabilidad `P(wᵢ\|wᵢ₋₁)` y un pequeño modelo generativo de n-gramas. |
| `04_bow.ipynb` | `sklearn.CountVectorizer` | Bag of Words sobre las 90 descripciones de producto: vocabulario, matriz de conteos, dispersión (*sparsity*), palabras frecuentes por categoría y la limitación de ignorar el orden. |
| `05_tf-idf.ipynb` | `sklearn.TfidfVectorizer` | TF, IDF y TF-IDF sobre las mismas descripciones: cálculo de IDF a mano (incluido el caso `IDF = 0`), términos más distintivos por producto y comparación común vs. distintivo frente a BoW. |
| `06_mineria-de-texto.ipynb` | Pipeline completo + `cosine_similarity` | De extremo a extremo sobre las reseñas de entrega: exploración → tokenización + normalización → TF-IDF → análisis (términos que distinguen reseñas negativas de positivas, reseñas similares por coseno, bigramas por sentimiento). Cierra con un ejercicio de clasificación propuesto. |

Cada notebook es autocontenido: se puede ejecutar de principio a fin (`Run All`).