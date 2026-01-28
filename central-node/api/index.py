import os
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
from fastapi.middleware.cors import CORSMiddleware

# --- 1. SETUP & CONFIGURATION ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

app = FastAPI(title="Siaga - PRISMA RT 04 Assistant Microservice")

# Enable CORS (Critical for Vercel/Next.js communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Vector Store Variable
vector_store = None

# --- 2. INGESTION ENGINE (RAG SETUP) ---
def initialize_rag():
    global vector_store
    
    # Path handling for Vercel Serverless environment
    # In Vercel, the file is usually relative to the function file or current working directory
    # We try multiple common paths to be safe
    possible_paths = [
        os.path.join(os.getcwd(), 'api', 'data', 'panduan_warga_rt04.pdf'), # Vercel root context
        os.path.join(os.getcwd(), 'data', 'panduan_warga_rt04.pdf'),       # Local dev context
        "panduan_warga_rt04.pdf"                                            # Fallback
    ]
    
    pdf_path = None
    for p in possible_paths:
        if os.path.exists(p):
            pdf_path = p
            break
            
    if not pdf_path:
        print(f"Warning: PDF Setup - panduan_warga_rt04.pdf not found in {possible_paths}. RAG features will be limited.")
        return

    print(f"--- Starting RAG Ingestion from {pdf_path} ---")
    
    try:
        # A. Load Document
        loader = PyPDFLoader(pdf_path)
        docs = loader.load()
        
        # B. Split Text
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        # C. Embed & Index
        if GOOGLE_API_KEY:
            embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
            vector_store = FAISS.from_documents(documents=splits, embedding=embeddings)
            print("--- RAG Ingestion Complete ---")
        else:
             print("Warning: GOOGLE_API_KEY missing. Skipping Embeddings.")
            
    except Exception as e:
        print(f"Error during RAG initialization: {e}")

# Run ingestion on startup
# Note: In Serverless, startup events might run on every cold start.
# This adds some latency to the first request but is necessary for RAG.
@app.on_event("startup")
async def startup_event():
    initialize_rag()

# --- 3. RETRIEVAL & GENERATION LOGIC ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/api/chat", response_model=ChatResponse) # Updated route to match Vercel Rewrite
async def chat_endpoint(request: ChatRequest):
    global vector_store
    
    try:
        if not GOOGLE_API_KEY:
             return ChatResponse(reply="Sistem sedang pemeliharaan (API Key Missing). Hubungi Admin.")

        user_query = request.message
        
        # Initialize LLM
        llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3, google_api_key=GOOGLE_API_KEY)

        # Define System Prompt
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

        return ChatResponse(reply=reply_text)

    except Exception as e:
        print(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
