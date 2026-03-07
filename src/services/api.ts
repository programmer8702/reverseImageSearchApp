import axios from "axios";

const API_BASE_URL = "https://faceapp-apis-production.up.railway.app";

export async function searchImage(fileUri: string) {
  try {
    const formData = new FormData();

    formData.append("image", {
      uri: fileUri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);

    const response = await axios.post(
      `${API_BASE_URL}/search_req_similar_v1`,
      formData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true",
        },
        timeout: 30000,
        withCredentials: false,   // IMPORTANT
      }
    );

    return response.data;

  } catch (error: any) {
    //console.log("UPLOAD ERROR:", error);
    return { error: error.message };
  }
}