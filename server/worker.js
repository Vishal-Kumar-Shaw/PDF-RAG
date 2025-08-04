import { Worker } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";


const worker = new Worker(
    'file-upload-queue', 
    async job => {
        console.log(`job: `, job.data);
        const data = JSON.parse(job.data);
        /*
            path: data.path
            Read the pdf from path
            chunk the pdf
            call the open-ai embedding model for every chunk
            store the chunk into vector db(quadrant db)
        */
       // load the pdf
       const loader = new PDFLoader(data.path);
       const docs = await loader.load();
       console.log("docs",docs); // page by page by default

       
       // 3. Initialize HuggingFace embeddings (local)
        console.log('⚙️ Initializing HuggingFace Transformers embeddings...');

        const embeddings = new HuggingFaceTransformersEmbeddings({
            modelName: 'Xenova/all-MiniLM-L6-v2', // Fast and open-source
        });
        console.log("here");
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: 'http://localhost:6333',
        collectionName: 'langchainjs-testing',
      }
    );
    await vectorStore.addDocuments(docs);
    console.log(`All docs are added to vector store`);
        // const client = new QdrantClient({
        //     url: 'http://localhost:6333',
        // });

        // const vectorStore = await QdrantVectorStore.fromExistingCollection(
        //     embeddings, 
        //     {
        //         url : 'http://localhost:6333',
        //         collectionName: 'pdf-docs', // make sure this exists or gets created
        //     }
        // );
        // console.log("before adding chunks to vector store");
        // const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
        // client,
        // collectionName: 'pdf-docs',
    //   });
        
        // await vectorStore.addDocuments(docs);
        console.log('✅ PDF chunks stored in Qdrant');
        

    }, 


    { 
        concurrency: 100,
        connection: {
            host: 'localhost',
            port: '6379'
        }

    }
);
