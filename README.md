# LearnLab 🎓

[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68.0+-00a393.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-13.0+-black.svg)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10.8+-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Documentation](https://img.shields.io/badge/docs-Codelabs-blue.svg)](https://codelabs-preview.appspot.com/?file_id=1kMzJ_qRJrDknPFatF1raPvsoJUatl_-tfJuICo7p4EM#0)

> Enhancing Learning with Fun, Interactive Journeys for Better Comprehension, Revision, and Evaluation.

## Project URLs
- Code Labs: [Codelabs Documentation](https://codelabs-preview.appspot.com/?file_id=1uRDRgIq0stv5MiOj-4f0KLE3mzC15eOw9zI4dzttLGg#0)
- Application: [Front End](http://34.45.163.161:3000/)
- Swagger: [Swagger](http://34.45.163.161:8000/docs)
- Airflow: [Airflow](http://34.45.163.161:8080/)
- Github Tasks: [GitHub Issues and Tasks](https://github.com/orgs/DAMG7245-Big-Data-Sys-SEC-02-Fall24/projects/7/views/1)


## 👥 Team

- Sai Surya Madhav Rebbapragada
- Uday Kiran Dasari (Project Manager)
- Venkat Akash Varun Pemmaraju

---

## User Interaction with LearnLab
1. Upload/Select a PDF.
2. Query and summarize the document.
3. Generate audio podcasts for convenient learning.
4. Create interactive flashcards for revision.
5. Take quizzes to test understanding.
6. Generate and share blogs summarizing key points.

---

## Core Features

### 1. **Podcast Generation**
- Automated script generation from PDFs.
- Dramatized and engaging podcasts for enhanced comprehension.

### 2. **Interactive Flashcards**
- AI-powered extraction of key concepts.
- Categorized by difficulty levels for personalized learning.

### 3. **Content Transformation**
- Platform-specific article generation.
- Efficient citation and reference management.

### 4. **Interactive Quizzes**
- AI-driven question generation.
- Instant feedback with detailed explanations.

---

## Project Overview

### Scope
- PDF processing and storage.
- Multimodal content generation (audio, textual).
- Cloud-based architecture with user authentication.

### Stakeholders
- Students, educators, researchers, professionals, and content creators.

### Problem Statement
- Inefficient comprehension and retention of dense academic content.
- LearnLab resolves this with multimodal, engaging learning experiences.

### Accomplishments
- Reduced podcast generation time by ~50%.
- Robust quiz and flashcard generation.
- Time and resource optimization for content creation.

---

## Methodology

### Podcast Generation
1. **Content Cleaning**: Extract key text using LLMs.
2. **Transcript Creation**: Generate coherent summaries.
3. **Dramatization**: Enhance engagement with LLM dramatization.
4. **Audio Generation**: Convert to audio using TTS tools.

### Flashcard Generation
1. Extract key concepts from PDF.
2. Organize into structured flashcards by difficulty.

### Quiz Generation
- Create interactive MCQs using PDF context and LLMs.

### Blog Generation
- Summarize PDF insights into blogs.
- Share directly on Blogger or social media.

---

## Workflow Overview
1. Audio Podcasts: Learn on the go.
2. Flashcards: Facilitate structured revision.
3. Quizzes: Assess retention and comprehension.
4. Blogs/Social Media: Share insights and collaborate.

---

## 🛠️ Technology Stack

### Backend
- ![Python](https://img.shields.io/badge/Python-FFD43B?style=flat&logo=python&logoColor=blue)
- ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
- ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens)
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

### Frontend
- ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
- Vercel AI SDK

### AI/ML
- ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)
- LangGraph
- Gemini Learn LM 1.5
- PyPDF
- 11 Labs
- Pinecone

### Cloud & DevOps
- ![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=google-cloud&logoColor=white)
- ![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazon-aws&logoColor=white)
- ![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker&logoColor=white)
- ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white)
- ![Apache Airflow](https://img.shields.io/badge/Apache_Airflow-017CEE?style=flat&logo=Apache%20Airflow&logoColor=white)

## 🏗️ Architecture

### User Flow
```mermaid
flowchart TD
  A[Start] --> B[Login Screen]
  B --> C{Authentication}
  C -->|Success| D[Dashboard]
  C -->|Failure| B
  
  D --> E{New or Existing Resource}
  
  E -->|Upload New| F[Upload PDF Resource]
  F --> G[Processing Document]
  G --> H{Select Learning Mode}
  
  E -->|Pick Existing| H
  
  H -->|Option 1| I[Podcast Generation]
  I --> I1[Generate Audio]
  I1 --> I2[Listen & Learn]
  I2 --> M[Learning Metrics]
  
  H -->|Option 2| J[Flashcard Mode]
  J --> J1[View Cards]
  J1 --> J2[Practice Cards]
  J2 --> M
  
  H -->|Option 3| K[Quiz Mode]
  K --> K1[Take Quiz]
  K1 --> K2[Review Answers]
  K2 --> M
  
  M --> N{Continue Learning?}
  N -->|Yes| H
  N -->|No| O{Share Progress?}
  
  O -->|Yes| P[Generate Content]
  P --> P1[Blog Post]
  P --> P2[Social Media Post]
  O -->|No| Q[Exit]
  P1 --> Q
  P2 --> Q
```

### Agentic architecture
![Learn Lab Agent](assets/learnlab_agent.png)
![Architecture](assets/architecture_diagram.png)
![Agent Architecture](assets/learnlab_Agent_Architecture.jpeg)


## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker
- GCP Account
- AWS Account



1. **Setup Environment:**
```bash
# Clone repository
git clone https://github.com/DAMG7245-Big-Data-Sys-SEC-02-Fall24/LearnLab
cd LearnLab

# Initialize environments and configurations
# Add all relavent .env files
```

2. **Start Services:**
```bash
# Start all services
docker-compose up -d

# Or start specific services
docker-compose up -d frontend backend
```

## Service Ports

| Service   | Port  | URL                     |
|-----------|-------|-------------------------|
| Frontend  | 3000  | http://localhost:3000   |
| Backend   | 8000  | http://localhost:8000   |
| Airflow   | 8080  | http://localhost:8080   |
| Database  | 5432  | postgres://localhost:5432|

## Essential Commands

### Development
```bash
# Build specific service
docker-compose build <service-name>

# View logs
docker-compose logs -f <service-name>

# Restart service
docker-compose restart <service-name>
```

### Database
```bash
# Access PostgreSQL CLI
docker-compose exec db psql -U postgres

# Backup database
docker-compose exec db pg_dump -U postgres learnlab > backup.sql
```

### Cleanup
```bash
# Stop all services
docker-compose down

# Remove volumes
docker-compose down -v
```

## Project Structure
```
LearnLab/
├── frontend/          # Next.js frontend
├── backend/          # FastAPI backend
├── airflow/          # Airflow DAGs
├── docker/           # Docker configurations
└── docker-compose.yml
```

## Environment Setup
Each service requires its own `.env` file. Copy from `.env.example`:

```bash
cd <service-directory>
cp .env.example .env
```





## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 References

- [OpenNotebookLM](https://github.com/gabrielchua/open-notebooklm)
- [Bark](https://github.com/suno-ai/bark)
- [Llama Recipes](https://github.com/meta-llama/llama-recipes)
- [EduChain](https://github.com/satvik314/educhain)
- [Consillium App](https://www.consillium.app/)
- [Median](https://github.com/5uru/Median)
