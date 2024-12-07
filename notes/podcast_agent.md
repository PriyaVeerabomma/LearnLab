# podcast_agent :V1

A sophisticated RAG (Retrieval-Augmented Generation) based podcast generation system that creates AI-powered podcasts from PDF documents using LangGraph, OpenAI, and ElevenLabs.

## 🌟 Features

- PDF document processing and indexing using Pinecone vector database
- Context-aware podcast content generation using RAG architecture
- Natural conversational script generation with two distinct speakers
- Text-to-speech synthesis using ElevenLabs voices

## 🛠️ Architecture

The system consists of four main components:

1. **PDFProcessor**: Handles document processing and vector storage
2. **RAGApplication**: Manages document querying and context retrieval
3. **PodcastGenerator**: Orchestrates the podcast generation workflow


### Component Details

#### PDFProcessor Class
```python
PDFProcessor(openai_api_key: str, pinecone_api_key: str)
```
Core methods:
- `create_index()`: Initializes Pinecone vector database
- `read_pdf()`: Extracts text content from PDF files
- `index_document()`: Processes and stores document embeddings
- `query()`: Retrieves relevant document chunks
- `get_available_pdfs()`: Lists indexed documents

#### RAGApplication Class
```python
RAGApplication()
```
Core methods:
- `process_document()`: Handles PDF processing workflow
- `query_document()`: Retrieves context using RAG
- `set_current_pdf()`: Sets active document context
- `generate_answer()`: Creates responses using LangChain

#### PodcastGenerator Class
```python
PodcastGenerator()
```
Core methods:
- `generate_podcast()`: Main podcast generation pipeline
- `create_graph()`: Builds the LangGraph workflow
- `synthesize_speech()`: Handles TTS generation
- `expand_topic()`, `generate_script()`, `refine_script()`: Content generation stages


## Set up environment variables:
```bash
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID_1=voice_id_for_speaker_1
ELEVENLABS_VOICE_ID_2=voice_id_for_speaker_2
```

Available commands:
1. List available documents
2. Index new document
3. Generate podcast from existing document
4. Exit

## 🔄 Workflow

The podcast generation follows this pipeline:
1. Document indexing and RAG context retrieval
2. Topic expansion and outline creation
3. Script generation with two speakers
4. Script refinement and natural language enhancement
5. Text-to-speech synthesis

## 📊 Visualization

![Podcast Agent v1](/assets/podcast_agent_v1.png)

## ⚠️ Changes to add still 

- Implement multiple LLM's Instead of single and Use Groq for Faster Response
- Tweak the prompt 
- Add Prompt Cacheing

## 🙏 Acknowledgments

- LangChain for the RAG framework
- OpenAI for language models
- ElevenLabs for text-to-speech
- Pinecone for vector storage