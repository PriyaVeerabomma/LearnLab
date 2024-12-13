from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
load_dotenv()

class BlogContent(BaseModel):
    title: str
    body: str

class BlogAgent:
    def __init__(self, api_key: str = os.getenv("GEMINI_API_KEY")):
        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing. Check your environment variables.")
        self.llm = ChatOpenAI(
            model="learnlm-1.5-pro-experimental",
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            api_key=api_key,
            temperature=0.7,
        )

    def generate_blog(self, query: str,rag_context: dict) -> BlogContent:
        """
        Generate blog content from a query string and retrieved context.
        
        Args:
            query (str): The topic or query for the blog.
            rag_context (dict): A dictionary containing "answer" and "evidence".

        Returns:
            BlogContent: A Pydantic model containing the title and body of the blog.
        """
        prompt_template = """
        Write a technical blog based on the following topic and research context:

        Topic: {query}

        Research Context:
        Answer: {answer}
        Evidence: {evidence}

        Guidelines:
        1. Provide a concise, engaging title.
        2. Write a well-structured body with an introduction, main content, and conclusion.
        3. Use a technical tone and ensure factual accuracy based on the context.
        """
        # Format the evidence as a single string
        formatted_evidence = " ".join(rag_context.get("evidence", []))
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_template(prompt_template)
        formatted_prompt = prompt.format_messages(
            query=query,
            answer=rag_context.get("answer", "No answer provided."),
            evidence=formatted_evidence
        )

        response = self.llm.invoke(formatted_prompt)
        if not response or not response.content:
            raise ValueError("Blog generation failed.")

        # Split response into title and body
        content_lines = response.content.split("\n\n", 1)
        title = content_lines[0].strip() if content_lines else "Untitled Blog"
        body = content_lines[1].strip() if len(content_lines) > 1 else "No content generated."

        return BlogContent(title=title, body=body)
