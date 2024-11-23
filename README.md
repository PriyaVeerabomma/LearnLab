# MultiLearnAI

## Overview
In today's digital learning landscape, there's a growing need for tools that can transform static PDF documents into diverse, interactive learning materials. Currently, learners often struggle to effectively extract, retain, and engage with information from PDF documents, leading to suboptimal learning outcomes.

To develop an intelligent platform that transforms PDF documents into multiple learning formats (audio podcasts, flashcards, quizzes) while automatically generating and distributing content, enabling comprehensive understanding and retention of material through various learning modalities.

The user journey begins with uploading or selecting a PDF, which they can explore using querying and summarization features. Users can then generate an audio podcast to conveniently listen to the document's insights or create flashcards for revision. After engaging with the flashcards, users can take an interactive quiz to test their understanding of the material. Once satisfied, they can use the blog generator to produce a professional article summarizing the document's key points. If the generated blog meets their expectations, they can seamlessly post it to blog and social media post sharing their learning with a broader audience.

- **GitHub Issues and Tasks**: [Link to GitHub Project Issues](https://github.com/orgs/DAMG7245-Big-Data-Sys-SEC-02-Fall24/projects/7/views/1)
- **Codelabs Documentation**: [Link to Codelabs](https://codelabs-preview.appspot.com/?file_id=1kMzJ_qRJrDknPFatF1raPvsoJUatl_-tfJuICo7p4EM#0)
- **Project Submission Video (5 Minutes)**: [Link to Submission Video](https://drive.google.com/drive/u/0/folders/1wgYeUY-HsDuWcqGq1hSNVRQ3gvQBMLZC)


## User Flow Diagram

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

## Architecture Diagram
```mermaid
graph LR
    subgraph Step1["Step 1: PDF Pre-processing"]
        direction TB
        A[RAW PDF] -->|Input| B[Intelligent Agentic System]
        B -->|Processed| C[Clean Text]
        D[System Prompt: \Create PDF while preserving context\] -.-> B
    end

    subgraph Step2["Step 2: Write Podcast"]
        direction TB
        C -->|Input| E[Intelligent Agentic System]
        E -->|Processed| F[Podcast Script]
        G[System Prompt: \Make this a podcast transcript\] -.-> E
    end

    subgraph Step3["Step 3: Dramatise Podcast"]
        direction TB
        F -->|Input| H[Intelligent Agentic System]
        H -->|Processed| I[Crispy Podcast]
        J[System Prompt: \Make this podcast more dramatic\] -.-> H
    end

    subgraph Step2b["Step 2: Generate Flashcard"]
        direction TB
        C -->|Input| K[Intelligent Agentic System]
        K -->|Processed| L[Flashcard Content]
        M[System Prompt: \Generate a set of questions/answers for flashcard\] -.-> K
    end

    subgraph Step2c["Step 2: Generate Quiz"]
        direction TB
        C -->|Input| N[Intelligent Agentic System]
        N -->|Processed| O[Quiz Content]
        P[System Prompt: \Generate a set of questions/answers for quiz\] -.-> N
    end

    subgraph Step4["Step 4: Generate Audio"]
        direction LR
        I -->|Input| Q[TTS Intelligent Agentic System]
        I -->|Input| R[bark/suno]
        Q -->|Audio| S[Podcast.mp3]
        R -->|Audio| S
    end
```
