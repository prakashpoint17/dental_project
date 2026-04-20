import axios from "axios";

export const detectImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
        "http://127.0.0.1:8000/detect",
        formData
    );

    return res.data;
};