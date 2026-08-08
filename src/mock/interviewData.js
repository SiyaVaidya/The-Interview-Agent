/**
 * Interview Question Bank — Mock Data
 * 
 * Organized by curriculum topic with difficulty tiers.
 * Each question includes follow-up variants for strong and weak answers.
 * This data will later be replaced by AI-generated questions from the backend.
 */

export const CURRICULUM_TOPICS = [
  { id: 'rag', name: 'Retrieval-Augmented Generation', day: 'Day 5-8' },
  { id: 'vector-db', name: 'Vector Databases', day: 'Day 9-12' },
  { id: 'prompt-eng', name: 'Prompt Engineering', day: 'Day 3-4' },
  { id: 'agentic-ai', name: 'Agentic AI', day: 'Day 17-20' },
  { id: 'mcp', name: 'Model Context Protocol', day: 'Day 21-24' },
  { id: 'ai-deployment', name: 'AI Deployment', day: 'Day 25-28' },
];

export const QUESTION_BANK = [
  // RAG — Introductory
  {
    id: 'rag-1',
    topic: 'rag',
    difficulty: 'introductory',
    question: "Let's start with RAG — Retrieval-Augmented Generation. Can you explain what RAG is and why it's useful when building enterprise AI systems?",
    followUps: {
      strong: {
        question: "Great explanation. You mentioned combining retrieval with generation. In a production RAG pipeline, what strategies would you use to ensure the retrieved documents are actually relevant and don't introduce noise into the generation step?",
        difficulty: 'deep',
      },
      weak: {
        question: "Let me help narrow this down. RAG combines two steps — retrieving relevant information and then generating a response using that information. Can you think of a scenario where an LLM alone, without retrieval, might give an incorrect or outdated answer?",
        difficulty: 'introductory',
      },
    },
  },
  // RAG — Intermediate
  {
    id: 'rag-2',
    topic: 'rag',
    difficulty: 'intermediate',
    question: "When building a RAG system, how would you approach chunking a large document corpus? What factors influence your chunking strategy?",
    followUps: {
      strong: {
        question: "Excellent. You clearly understand chunking trade-offs. Now, how would you evaluate whether your RAG pipeline is actually retrieving the right chunks? What metrics or evaluation approaches would you consider?",
        difficulty: 'deep',
      },
      weak: {
        question: "Think about it this way — if you have a 100-page technical manual, you can't feed the entire thing to an LLM. You need to break it into smaller pieces. What might go wrong if your chunks are too large versus too small?",
        difficulty: 'introductory',
      },
    },
  },
  // Vector Databases — Introductory
  {
    id: 'vdb-1',
    topic: 'vector-db',
    difficulty: 'introductory',
    question: "Let's move to vector databases. Why would you choose a vector database over a traditional relational database for semantic search in an AI application?",
    followUps: {
      strong: {
        question: "Good distinction. When working with vector databases, what role do embedding models play, and how does the choice of embedding model impact your search quality?",
        difficulty: 'intermediate',
      },
      weak: {
        question: "Consider this — a traditional database searches for exact keyword matches. But what if a user asks a question using different words than what's stored in your database? How might vectors help solve that problem?",
        difficulty: 'introductory',
      },
    },
  },
  // Vector Databases — Intermediate
  {
    id: 'vdb-2',
    topic: 'vector-db',
    difficulty: 'intermediate',
    question: "Can you explain the concept of similarity search in vector databases? What distance metrics are commonly used, and when might you prefer one over another?",
    followUps: {
      strong: {
        question: "Solid understanding. In a production environment with millions of vectors, exact nearest-neighbor search becomes expensive. What approximate nearest-neighbor techniques or indexing strategies would you consider to balance speed and accuracy?",
        difficulty: 'deep',
      },
      weak: {
        question: "Let me simplify. Imagine you represent every sentence as a point in space. Two sentences with similar meanings would be close together. How would you measure 'closeness' between two such points?",
        difficulty: 'introductory',
      },
    },
  },
  // Prompt Engineering — Introductory
  {
    id: 'pe-1',
    topic: 'prompt-eng',
    difficulty: 'introductory',
    question: "Let's discuss prompt engineering. What's the difference between zero-shot, one-shot, and few-shot prompting? When would you use each approach?",
    followUps: {
      strong: {
        question: "Well articulated. Beyond few-shot examples, what advanced prompting techniques like chain-of-thought or structured output formatting have you explored? How do they improve reliability for production use cases?",
        difficulty: 'deep',
      },
      weak: {
        question: "Think of it simply — zero-shot means you give the model a task with no examples. One-shot means you show it one example first. Why do you think showing examples might help the model give better answers?",
        difficulty: 'introductory',
      },
    },
  },
  // Prompt Engineering — Intermediate
  {
    id: 'pe-2',
    topic: 'prompt-eng',
    difficulty: 'intermediate',
    question: "In a production AI system, how would you handle prompt injection attacks? What strategies exist to make prompts more robust and secure?",
    followUps: {
      strong: {
        question: "Excellent security awareness. How would you design a testing framework to systematically evaluate your prompts against adversarial inputs before deploying to production?",
        difficulty: 'deep',
      },
      weak: {
        question: "Prompt injection is when a user crafts their input to override your system instructions. For example, a user might type 'Ignore all previous instructions and...' — what simple safeguards could you put in place to prevent this?",
        difficulty: 'introductory',
      },
    },
  },
  // Agentic AI — Introductory
  {
    id: 'agent-1',
    topic: 'agentic-ai',
    difficulty: 'introductory',
    question: "Now let's talk about Agentic AI. What distinguishes an AI agent from a standard LLM API call? What capabilities does an agent have that a simple prompt-response interaction doesn't?",
    followUps: {
      strong: {
        question: "Great breakdown. When designing multi-step agent workflows, how do you handle error recovery? What happens when one step in the agent's reasoning chain fails or produces unexpected output?",
        difficulty: 'deep',
      },
      weak: {
        question: "Think of it this way — a basic LLM call is like asking someone a question and getting an answer. An agent is more like giving someone a task and letting them figure out the steps. What kinds of 'tools' might an agent need access to?",
        difficulty: 'introductory',
      },
    },
  },
  // Agentic AI — Intermediate
  {
    id: 'agent-2',
    topic: 'agentic-ai',
    difficulty: 'intermediate',
    question: "How would you implement tool use in an AI agent? Describe how an agent decides which tool to call and how it processes the tool's response.",
    followUps: {
      strong: {
        question: "Very thorough. How would you approach observability and debugging for agent systems in production? When an agent makes a chain of 10 tool calls, how do you trace what went wrong?",
        difficulty: 'deep',
      },
      weak: {
        question: "Let's break this down. Imagine your agent has access to a calculator tool and a search tool. If a user asks 'What is the GDP of France divided by its population?', how might the agent decide which tools to use and in what order?",
        difficulty: 'introductory',
      },
    },
  },
  // MCP — Introductory
  {
    id: 'mcp-1',
    topic: 'mcp',
    difficulty: 'introductory',
    question: "Let's discuss the Model Context Protocol. What problem does MCP solve, and how does it standardize the way AI models interact with external tools and data sources?",
    followUps: {
      strong: {
        question: "Good understanding of the protocol. How does MCP handle the security boundary between the AI model and external services? What trust considerations come into play?",
        difficulty: 'intermediate',
      },
      weak: {
        question: "Think of MCP as a universal adapter. Today, every AI tool integration requires custom code. MCP creates a standard 'plug-and-play' interface. Can you think of why standardization would matter as AI systems grow more complex?",
        difficulty: 'introductory',
      },
    },
  },
  // MCP — Intermediate
  {
    id: 'mcp-2',
    topic: 'mcp',
    difficulty: 'intermediate',
    question: "In an MCP architecture, how does the concept of 'resources' versus 'tools' differ? When would you expose something as a resource versus as a tool?",
    followUps: {
      strong: {
        question: "Clear distinction. How would you design an MCP server that needs to handle concurrent connections from multiple AI agents while maintaining per-session state?",
        difficulty: 'deep',
      },
      weak: {
        question: "Here's a simpler way to think about it — a 'resource' is like a file or data you can read, while a 'tool' is an action you can perform. If you were building an MCP server for a database, what might be resources and what might be tools?",
        difficulty: 'introductory',
      },
    },
  },
  // AI Deployment — Introductory
  {
    id: 'deploy-1',
    topic: 'ai-deployment',
    difficulty: 'introductory',
    question: "When deploying an AI system to production, what are the key differences compared to deploying a traditional web application? What additional considerations come into play?",
    followUps: {
      strong: {
        question: "Comprehensive answer. How would you implement monitoring and alerting specifically for an AI system? What metrics would you track beyond standard application health checks?",
        difficulty: 'intermediate',
      },
      weak: {
        question: "Think about what makes AI different — the model is large, responses can be unpredictable, and inference takes time. What challenges might these create compared to a simple REST API that does database lookups?",
        difficulty: 'introductory',
      },
    },
  },
  // AI Deployment — Deep
  {
    id: 'deploy-2',
    topic: 'ai-deployment',
    difficulty: 'intermediate',
    question: "How would you design a deployment strategy that allows you to safely update your AI model in production without causing downtime or degraded user experience?",
    followUps: {
      strong: {
        question: "Excellent deployment thinking. How would you implement A/B testing between two different model versions to measure which one performs better on real user interactions?",
        difficulty: 'deep',
      },
      weak: {
        question: "Consider the basic approach — you have a working model serving users, and a new model you want to deploy. What's the risk of just swapping them out instantly? What safer approach could you take?",
        difficulty: 'introductory',
      },
    },
  },
];

/**
 * Candidate profile mock data — simulates what the backend
 * would provide about the candidate's learning journey.
 */
export const MOCK_CANDIDATE = {
  id: 'candidate-alex',
  name: 'Alex',
  completedModules: ['rag', 'prompt-eng', 'vector-db'],
  skippedTopics: ['mcp'],
  strongAreas: ['rag', 'prompt-eng'],
  weakAreas: ['vector-db', 'mcp'],
};
