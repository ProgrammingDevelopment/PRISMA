import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from typing import Optional
from ml_utils import ml_classifier

# --- 1. SETUP & CONFIGURATION ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in .env file")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Siaga - PRISMA RT 04 Assistant Microservice")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Global Vector Store Variable
vector_store = None

# --- 2. INGESTION ENGINE (RAG SETUP) ---
def initialize_rag():
    """
    Loads the PDF, splits it, creates embeddings, and stores in FAISS.
    """
    global vector_store
    pdf_path = "data/panduan_warga_rt04.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"Warning: {pdf_path} not found. RAG features will be limited.")
        return

    print("--- Starting RAG Ingestion ---")
    
    # A. Load Document
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    print(f"Loaded {len(docs)} pages from PDF.")

    # B. Split Text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    print(f"Created {len(splits)} text chunks.")

    # C. Embed & Index
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_documents(documents=splits, embedding=embeddings)
    print("--- RAG Ingestion Complete ---")

# Run ingestion on startup
@app.on_event("startup")
async def startup_event():
    initialize_rag()
    ml_classifier.train()

# --- 3. RETRIEVAL & GENERATION LOGIC ---
class ChatRequest(BaseModel):
    message: str

class Action(BaseModel):
    label: str
    type: str  # "navigate" | "link"
    value: str

class ChatResponse(BaseModel):
    reply: str
    action: Optional[Action] = None

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    global vector_store
    
    try:
        user_query = request.message
        
        # Initialize LLM
        llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)

        # Define System Prompt for Hybrid Behavior
        system_prompt = (
            "You are 'Siaga', a helpful and polite RT 04 Assistant. "
            "Use the provided Context to answer the user's question about neighborhood rules or info. "
            "If the answer is found in the context, provide it clearly based on the document. "
            "If the answer is NOT in the context, DO NOT say 'I don't know' or 'not in context'. "
            "Instead, use your general knowledge to answer helpfuly and naturally as a polite assistant. "
            "\n\n"
            "Context:\n{context}"
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{input}"),
            ]
        )

        if vector_store:
            # RAG Flow
            retriever = vector_store.as_retriever()
            question_answer_chain = create_stuff_documents_chain(llm, prompt)
            rag_chain = create_retrieval_chain(retriever, question_answer_chain)
            
            response = rag_chain.invoke({"input": user_query})
            reply_text = response["answer"]
        else:
            # Fallback (No PDF loaded)
            fallback_chain = prompt | llm
            response = fallback_chain.invoke({"input": user_query, "context": "No local documents available."})
            reply_text = response.content

        # --- ML INTENT CLASSIFICATION & ACTION ---
        intent = ml_classifier.predict(user_query)
        action = None
        
        if intent == "admin":
            action = Action(label="Buka Layanan Surat", type="navigate", value="/#admin")
        elif intent == "finance":
            action = Action(label="Buka Keuangan", type="navigate", value="/#finance")
        elif intent == "report":
            action = Action(label="Buka Form Pengaduan", type="navigate", value="/#response")
        elif intent == "contact":
            action = Action(label="Chat WA Pengurus", type="link", value="https://wa.me/6287872004448")
        
        return ChatResponse(reply=reply_text, action=action)

    except Exception as e:
        print(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. EXECUTION ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
