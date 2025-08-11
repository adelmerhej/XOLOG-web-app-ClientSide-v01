/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from 'mongodb';
import { ConnectionPool } from 'mssql';

// SQL Server Configuration
export const sqlConfig: { user: string; password: string; server: string; database: string; options: { encrypt: boolean; trustServerCertificate: boolean; }; connectionTimeout: number; requestTimeout: number; } = {
  user: process.env.SQL_USER || 'dbuser',
  password: process.env.SQL_PASSWORD || 'dbuser',
  server: process.env.SQL_HOST || 'localhost',
  database: process.env.SQL_DATABASE || 'master',
  options: {
    encrypt: false, // For Azure
    trustServerCertificate: true // For local dev
  },
  connectionTimeout: 30000, // 30 seconds
  requestTimeout: 60000 // 60 seconds
};


// MongoDB Configuration
export const mongoConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: process.env.MONGODB_DB || 'xologdb'
};

const mongoClient = new MongoClient(mongoConfig.uri);
const dbName = mongoConfig.dbName;

// Execute SQL Stored Procedure and return JSON
async function executeStoredProc(procedureName: string, params: any = {}): Promise<any> {
  // Validate SQL configuration only during runtime
  if (!process.env.SQL_USER || !process.env.SQL_PASSWORD || !process.env.SQL_HOST || !process.env.SQL_DATABASE) {
    throw new Error('Missing required SQL Server environment variables');
  }

  let pool: ConnectionPool | null = null;

  try {
    pool = await new ConnectionPool(sqlConfig).connect();
    const request = pool.request();

    // Add parameters dynamically
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }

    const result = await request.query(`EXEC ${procedureName}`);
    const jsonColumn = Object.keys(result.recordset[0])[0];
    const jsonResult = result.recordset[0][jsonColumn];

    if (jsonResult === undefined || jsonResult === null) {
      throw new Error(`Procedure ${procedureName} returned undefined or null JSON`);
    }

    // Parse the JSON string and ensure we return an array
    try {
      const parsedResult = JSON.parse(jsonResult);
      // Ensure we always return an array, even if the result is a single object
      return Array.isArray(parsedResult) ? parsedResult : [parsedResult];

    } catch (parseError) {
      console.error(`Error parsing JSON from ${procedureName}:`, parseError);
      throw new Error(`Failed to parse JSON result from ${procedureName}: ${parseError}`);
    }
  } finally {
    // Close the pool if it exists
    if (pool) {
      await pool.close();
    }
  }
}

// Save JSON data to MongoDB
async function saveToMongoDB(collectionName: string, data: any[]): Promise<void> {

  try {
    // Validate data before proceeding
    if (!Array.isArray(data)) {
      throw new Error(`Expected array of documents, got: ${typeof data}`);
    }
    if (data.length === 0) {
      console.log(`No documents to insert for collection ${collectionName}`);
      return;
    }

    // Validate MongoDB connection
    if (!mongoClient) {
      throw new Error('MongoClient is not initialized');
    }
    
    // Connect to MongoDB with retry
    let isConnected = false;
    const maxRetries = 3;
    let retryCount = 0;
    
    while (!isConnected && retryCount < maxRetries) {
      try {
        await mongoClient.connect();
        isConnected = true;

      } catch (connectError) {
        retryCount++;
        console.error(`Failed to connect to MongoDB (attempt ${retryCount}/${maxRetries}):`, connectError);
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, 36000 * retryCount));
      }
    }

    // Get database and collection
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);
    
    // Clear existing collection with retry
    let clearSuccess = false;
    retryCount = 0;
    
    while (!clearSuccess && retryCount < maxRetries) {
      try {
        await collection.deleteMany({});
        console.log("Deleting Collection Name:", collectionName);
        clearSuccess = true;
      } catch (deleteError) {
        retryCount++;
        console.error(`Failed to clear collection (attempt ${retryCount}/${maxRetries}):`, deleteError);
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to clear collection ${collectionName} after ${maxRetries} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Insert new documents with retry
    let insertSuccess = false;
    retryCount = 0;
    
    while (!insertSuccess && retryCount < maxRetries) {
      try {
        const insertResult = await collection.insertMany(data);
        console.log(`Inserted documents into collection ${collectionName}:`, {
         insertedCount: insertResult.insertedCount,
         acknowledged: insertResult.acknowledged
        });
        insertSuccess = true;
      } catch (insertError) {
        retryCount++;
        console.error(`Failed to insert documents (attempt ${retryCount}/${maxRetries}):`, insertError);
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to insert documents into ${collectionName} after ${maxRetries} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

  } catch (error) {
    console.error(`Error in saveToMongoDB for collection ${collectionName}:`, error);
    throw error;
  } finally {
    try {
      if (mongoClient) {
        await mongoClient.close();
        console.log(`Disconnected from MongoDB`);
      }
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
  }
}

async function updateJobStatuses(): Promise<void> {
  try {
    console.log("Updating job statuses...", new Date().toLocaleTimeString());
    
    const client = await mongoClient.connect();
    const db = client.db(dbName);
    const collection = db.collection('jobstatus');


    await collection.updateMany(
      { Ata: { $type: "string" } },
      [
        {
          $set: {
            Ata: { $dateFromString: { dateString: "$Ata" } }
          }
        }
      ]
    );

    console.log("Updated job statuses", new Date().toLocaleTimeString());
  } catch (error) {
    console.error("Error updating job statuses:", error);
    throw error;
  }
}

export { executeStoredProc, saveToMongoDB, updateJobStatuses };