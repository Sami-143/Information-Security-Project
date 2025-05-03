
import interceptor from "./interceptor";

const documentApi = {
  scanDocument: async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await interceptor.post(`/model/scan`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  // Sends the signed document, signature, and public key to the backend
  sendSignedDocument: async (formData) => {
    const res = await interceptor.post("/documents/verify-doc", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },
}

export default documentApi;
