import * as Realm from 'realm-web';
import axios from 'axios';


const EMAIL = process.env.REACT_APP_API_EMAIL || '';
const PASSWORD = process.env.REACT_APP_API_PASSWORD || '';
const SERVER = process.env.REACT_APP_SERVER || 'development';


const app = new Realm.App({ id: 'data-tafugqr' });

async function loginEmailPassword(email: string, password: string): Promise<Realm.User | undefined> {
  //console.log(`Usuario: ${email}, contra: ${password}` )
  const credentials = Realm.Credentials.emailPassword(email, password);
  try {
    const user = await app.logIn(credentials);
    console.assert(user.id === app.currentUser?.id);
    return user;
  } catch (error) {
    console.error("Error en la función loginEmailPass:", error);
  }
  return undefined;
}

export async function authenticate(email: string, password: string): Promise<string | undefined> {
  const user = await loginEmailPassword(email, password);
  if (!user || !user.accessToken) {
    console.log("Failed authentication :(");
    return undefined;
  } else {
    return user.accessToken;
  }
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('gojimx_token');
  return !!token;
}

export async function main(database: string): Promise<any> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Users",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": {},
      "projection": {
        "_id": 0 // Incluyendo todas las propiedades excepto _id
      }
    });

    const config = {
      method: 'post',
      url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': `Bearer ${token}`,
      },
      data: data
    };

    try {
      const response = await axios(config);
      return response.data.documents;
    } catch (error) {
      console.error("Error en la función main, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function getBusinessById(businessId: string, database: string): Promise<any> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Businesses",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { "business_id": businessId },
      "projection": {
        "_id": 0
      }
    });

    const config = {
      method: 'post',
      url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/findOne',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': `Bearer ${token}`,
      },
      data: data
    };

    try {
      const response = await axios(config);
      return response.data.document;
    } catch (error) {
      console.error("Error en la función getBusinessById, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}



export async function updateUser(userId: string, updatedData: any, database: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Users",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { "username": userId },
      "update": {
        "$set": updatedData
      }
    });

    const config = {
      method: 'post',
      url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/updateOne',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': `Bearer ${token}`,
      },
      data: data
    };

    try {
      await axios(config);
    } catch (error) {
      console.error("Error en la función updateUser, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function updateBusiness(businessId: string, updatedData: any, database: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Businesses",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { "business_id": businessId },
      "update": {
        "$set": updatedData
      }
    });

    const config = {
      method: 'post',
      url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/updateOne',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': `Bearer ${token}`,
      },
      data: data
    };

    try {
      await axios(config);
    } catch (error) {
      console.error("Error en la función updateBusiness, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}



export async function deleteUser(userId: string, database: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Users",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { "username": userId }
    });

    const config = {
      method: 'post',
      url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/deleteOne',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': `Bearer ${token}`,
      },
      data: data
    };
    const response = await axios(config);
    console.log("Delete Response:", response.data);

    try {
      await axios(config);
    } catch (error) {
      console.error("Error en la función deleteUser, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function deleteBusiness(businessName: string, database: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Businesses",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { "business_name": businessName }
    });

    const config = {
      method: 'post',
      url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/deleteOne',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': `Bearer ${token}`,
      },
      data: data
    };
    const response = await axios(config);
    console.log("Delete Response:", response.data);

    try {
      await axios(config);
    } catch (error) {
      console.error("Error en la función deleteBusiness, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function updateAssistant(businessId: string, assistantId: string, updatedAssistants: any[], database: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Businesses",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { 
        "business_id": businessId,
        "assistants.assistant_id": assistantId
      },
      "update": {
        "$set": {
          "assistants": updatedAssistants
        }
      }
    });

    const config = {
      method: 'post',
      url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/updateOne',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': `Bearer ${token}`,
      },
      data: data
    };

    try {
      await axios(config);
    } catch (error) {
      console.error("Error en la función updateAssistant, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}


export async function modifyRenataPoints(businessId: string, database: string, quantity: number): Promise<number> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    try {
      const business = await getBusinessById(businessId, database);
      console.log('Current business data:', business);

      const currentPoints = business.renata_points || 0;
      console.log('Current points:', currentPoints);

      // Allow points to go to zero, but not below
      const newPoints = Math.max(currentPoints + quantity, 0);
      console.log('New points:', newPoints);

      const data = JSON.stringify({
        "collection": "Renata_Businesses",
        "database": database,
        "dataSource": "GOJI-CLUSTER",
        "filter": { "business_id": businessId },
        "update": {
          "$set": { "renata_points": newPoints }
        }
      });

      const config = {
        method: 'post',
        url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/updateOne',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'Authorization': `Bearer ${token}`,
        },
        data: data
      };

      const response = await axios(config);
      console.log('MongoDB response:', response.data);

      // Return the actual change in points
      return newPoints - currentPoints;
    } catch (error) {
      console.error("Error en la función modifyRenataPoints:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to modify Renata points: ${error.message}`);
      } else {
        throw new Error('Failed to modify Renata points: Unknown error');
      }
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function getTransactionById(businessId: string, database: string): Promise<any[]> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Transactions",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { "business_id": businessId },
      "projection": {
        "_id": 0
      }
    });

    const config = {
      method: 'post',
      url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': `Bearer ${token}`,
      },
      data: data
    };

    try {
      const response = await axios(config);
      return response.data.documents;
    } catch (error) {
      console.error("Error en la función getTransactionById, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function insertTransaction(businessId: string, database: string, points: number, type:string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);
  const date = new Date();
  const source = "addedByAdmin";

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Transactions",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "document": {
        "transaction_ammount": points, 
        "transaction_type": type, 
        "business_id": businessId,
        "transaction_source": source,
        "transaction_date": date
      }
  
    });

    const config = {
      method: 'post',
      url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/insertOne',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': `Bearer ${token}`,
      },
      data: data
    };
    try {
      await axios(config);
    } catch (error) {
      console.error("Error en la función updateOne, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function modifyPassword(businessId: string, database: string, password: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);
  if (token) {
    try {
      const hashedPassword = await hashPassword(password);
      const data = JSON.stringify({
        "collection": "Renata_Users",
        "database": database,
        "dataSource": "GOJI-CLUSTER",
        "filter": { "businessId": businessId },
        "update": {
          "$set": { password: hashedPassword }
        }
      });

      const config = {
        method: 'post',
        url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/updateOne',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'Authorization': `Bearer ${token}`,
        },
        data: data
      };

      const response = await axios(config);
      console.log("Password modification response:", response.data);
    } catch (error) {
      console.error("Error en la función modifyPassword, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function createUser(userData: any, database: string): Promise<void> {
  console.log("Creating user with data:", userData);

  const token = await authenticate(EMAIL, PASSWORD);
  if (token) {
    try {
      // Hash the password
      if (userData.password) {
        const hashedPassword = await hashPassword(userData.password);
        console.log("Password hashed successfully");
        // Update the userData object with the hashed password
        userData.password = hashedPassword;
      } else {
        console.warn("No password provided for user");
      }

      const data = JSON.stringify({
        "collection": "Renata_Users",
        "database": database,
        "dataSource": "GOJI-CLUSTER",
        "document": userData
      });

      console.log("Data to be sent to MongoDB:", data);

      const config = {
        method: 'post',
        url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/insertOne',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'Authorization': `Bearer ${token}`,
        },
        data: data
      };

      const response = await axios(config);
      console.log("MongoDB response:", response.data);

    } catch (error) {
      console.error("Error en la función createUser, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function createBusiness(businessData: any, database: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);
  if (token) {
    const defaultAssistant = {
      name: "Renata Default",
      description: "Asistente predeterminado",
      intelligenceLevel: "media",
      responseLength: "cortas",
      workingHoursStart: 0,
      workingHoursEnd: 24,
      responseSpeed: 'media',
      instructions: "Eres un asistente que ayuda en la información de Goji.mx Goji es una empresa de tecnología y provee una app de Renata assistant, que les dirigirás a ella. Pide amablemente a los usuarios que configuren a Renata dentro del app para poder comenzar a optimizar sus flujos de trabajo.NO uses más de 30 palabras. Eres gentil, pero si te mandan muchos mensajes, les dices que te has agotado",
      active: true
    };

    try {
      const response_thread = await axios.post(`https://${SERVER}.goji-mx.cloud/assistant/createAssistant`, defaultAssistant, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const openAIAssistantId = response_thread.data.id;

      // Update the businessData with the new assistant ID
      businessData.assistant_id = openAIAssistantId;
      businessData.assistants[0].assistant_id = openAIAssistantId;

      const data = JSON.stringify({
        "collection": "Renata_Businesses",
        "database": database,
        "dataSource": "GOJI-CLUSTER",
        "document": businessData
      });

      const config = {
        method: 'post',
        url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-tafugqr/endpoint/data/v1/action/insertOne',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'Authorization': `Bearer ${token}`,
        },
        data: data
      };

      await axios(config);
    } catch (error) {
      console.error("Error en la función createBusiness, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}



// funcion para creacion de baileys ports??? check needed

/*
// Function to generate a new Baileys port
async function generateNewBaileysPort(): Promise<number> {
  // This function should return an available port number
  // For now, it returns a random number between 3000 and 4000
  return Math.floor(Math.random() * (4000 - 3000 + 1) + 3000);
}

// Function to initialize a new Baileys instance
async function initializeBaileysInstance(businessId: string, username: string, baileysPort: number, token: string): Promise<void> {
  try {
    // Initialize Baileys instance
    await axios.post(`${config.apiBaileys}/initializeBaileys`, {
      baileys_port: baileysPort
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Create Renata Baileys for the channel
    await axios.post(`${config.apiBaileys}/createRenataBaileysForChannel`, {
      business_id: businessId,
      username: username
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(`Baileys instance initialized for business ${businessId} on port ${baileysPort}`);
  } catch (error) {
    console.error("Error initializing Baileys instance:", error);
    throw error;
  }
}

// Modified createBusiness function to include Baileys port setup
export async function createBusiness(businessData: any, database: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);
  if (token) {
    try {
      // Existing code for creating default assistant...

      // Generate a new Baileys port
      const newBaileysPort = await generateNewBaileysPort();

      // Ensure channels array exists and has at least one element
      if (!businessData.channels || businessData.channels.length === 0) {
        businessData.channels = [{
          channel_name: "WhatsApp",
          active: true,
          username: businessData.business_id, // Assuming business_id is used as username
          main_number: true
        }];
      }

      // Update the channel information with the new Baileys port
      businessData.channels[0].baileys_port = newBaileysPort;
      businessData.channels[0].baileys_status = false;  // Initially set to false

      // Existing code for inserting business data...

      // Initialize the Baileys instance
      await initializeBaileysInstance(
        businessData.business_id,
        businessData.channels[0].username,
        newBaileysPort,
        token
      );

    } catch (error) {
      console.error("Error en la función createBusiness:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}
*/

export function fixPhoneNumber(phoneNumber: string) {
  // Replace '521' with '52' only if it occurs at the beginning of the string
  return phoneNumber.replace(/^521/, '52');
}

async function hashPassword(password: string): Promise<string> {
  try {
    console.log("Hashing password...");
    const response = await axios.get(`https://${SERVER}.goji-mx.cloud/backend/hash_pw`, {
      params: { password }
    });
    console.log("Hashed password status:", response.data.status);
    return response.data.result;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}