# Proyecto de Minería Web - Sesión de clase 07

Esta sesión trata el **análisis de sentimientos**: de los lexicones con
reglas a los Transformers locales, cómo evaluarlos con métricas adecuadas
(macro-F1, κ de Cohen, MAE) y cómo convertir las predicciones en
indicadores de negocio (NSS por país, sentimiento por aspecto y matriz de
riesgo de clientes).

Los notebooks no scrapean: trabajan sobre los CSV de la tienda-virtual que
ya están **copiados en la carpeta `data/`** de este proyecto. Todos los
modelos corren **localmente, en CPU**; no se usa ninguna API externa.

## Instalación y kernel

Requiere **Python 3.11+**. Cada sesión tiene su propio entorno virtual y su
propio kernel de Jupyter para evitar conflictos de versiones con las demás.

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m ipykernel install --user --name s07-venv --display-name "Python (sesion-de-clase-07)"
```

Al abrir los notebooks, seleccionar el kernel **Python (sesion-de-clase-07)**.

La primera ejecución descarga los modelos de Hugging Face a la caché local
(unos 2.3 GB en total); después funcionan sin internet:

| Modelo | Notebooks |
| --- | --- |
| `cardiffnlp/twitter-xlm-roberta-base-sentiment` | 02, 04 |
| `nlptown/bert-base-multilingual-uncased-sentiment` | 03, 04 |
| `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` | 02, 04 |
| `paraphrase-multilingual-MiniLM-L12-v2` (sentence-transformers) | 03, 04 |

## Datos (`data/`)

| Archivo | Contenido | Uso |
| --- | --- | --- |
| `comentarios.csv` | 135 comentarios de 96 clientes, con calificación 1–5★ y fecha | Corpus de sentimiento |
| `resenas_entrega.csv` | 110 reseñas de entrega de 63 clientes sobre 54 productos | Corpus de sentimiento; compras por cliente |
| `productos.csv` | 90 productos, 9 categorías × 10, con precio | Valor del cliente en la matriz de riesgo |
| `clientes.csv` | 120 clientes de 7 países (**datos personales**: DNI, nombre, correo) | País y ciudad de cada texto; se seudonimiza en el laboratorio |

## Notebooks (`notebooks/`)

Se recomienda ejecutarlos en este orden; todos son autocontenidos (`Run All`
funciona de principio a fin).

| Notebook | Técnica | Qué hace |
| --- | --- | --- |
| `01_ejercicio1_lexicon_vs_tfidf.ipynb` | lexicón tipo VADER, `TfidfVectorizer` + `LogisticRegression` | **Ejercicio 1**: etiquetas desde las estrellas, actividad de puntaje a mano, lexicón de 40 términos con negación / «muy» / «pero», pipeline con validación cruzada estratificada, fuga de información, pesos aprendidos y comparación (matriz de confusión, macro-F1, κ, cinco errores de cada enfoque). |
| `02_transformers_locales.ipynb` | `transformers.pipeline` | **Práctica**: por qué la bolsa de palabras pierde el orden, tokenización por sub-palabras, `text-classification` con cardiffnlp sobre las reseñas (`label`, `score`, `top_k=None`) y `zero-shot-classification` con mDeBERTa para polaridad y aspectos. |
| `03_ejercicio2_preentrenado_vs_zero_shot.ipynb` | nlptown, ChromaDB | **Ejercicio 2**: modelo de 1–5★ frente a zero-shot con frases prototipo en ChromaDB; MAE, macro-F1, κ y los 10 desacuerdos más grandes. |
| `04_laboratorio_observatorio.ipynb` | todo lo anterior | **Laboratorio** (etapas A–F): seudonimización, JOIN con `clientes.csv`, línea base, Transformers locales, puntaje continuo, aspectos con ChromaDB, NSS por país, clientes silenciosos, tendencia trimestral, sentimiento por aspecto, matriz de riesgo, diez errores con diagnóstico, hallazgos y limitaciones. Incluye el reto opcional (mDeBERTa frente a ChromaDB). |

## Salidas (`salidas/`)

El laboratorio guarda aquí sus gráficos (`.png`) y tablas (`.csv`):
comparación de enfoques, NSS por país, tendencia trimestral, sentimiento por
aspecto, perfil de clientes, matriz de riesgo, diez errores y los textos con
todas sus predicciones. Los archivos de clientes se guardan **seudonimizados**
(sin DNI, nombre ni correo).
