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

export async function updateAssistant(businessId: string, assistantId: string, updatedData: any, database: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Businesses",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { "business_id": businessId },  // Filtramos por el ID del negocio
      "update": {
        "$set": {
          "assistants.$[assistant]": updatedData  // Actualizamos el asistente específico
        }
      },
      "arrayFilters": [
        { "assistant.assistant_id": assistantId }  // Filtramos por el ID del asistente
      ]
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


export async function modifyRenataPoints(businessId: string, database: string, quantity: number): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);

  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Businesses",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { "business_id": businessId },
      "update": {
      "$inc": { "renata_points": quantity }
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
      console.error("Error en la función updateOne, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }
}

export async function getTransactionById(businessId: string, database: string): Promise<any> {
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
    //const hashedNewPassword = await bcrypt.hash(password, 10);
    const hashedNewPassword = password;
    const data = JSON.stringify({
      "collection": "Renata_Users",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "filter": { "businessId": businessId },
      "update": {
        "$set": {password:hashedNewPassword}
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
      console.error("Error en la función updateOne, petición axios:", error);
      throw error;
    }
  } else {
    throw new Error('Failed to obtain token.');
  }

}

export async function createUser(userData: any, database: string): Promise<void> {
  const token = await authenticate(EMAIL, PASSWORD);
  if (token) {
    const data = JSON.stringify({
      "collection": "Renata_Users",
      "database": database,
      "dataSource": "GOJI-CLUSTER",
      "document": userData
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

export function fixPhoneNumber(phoneNumber: string) {
  // Replace '521' with '52' only if it occurs at the beginning of the string
  return phoneNumber.replace(/^521/, '52');
}