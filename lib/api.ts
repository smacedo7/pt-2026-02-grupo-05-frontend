import axios from "axios";

// Instância única para as chamadas ao backend. Compartilhada pelas telas de
// cadastro e de login, para que a URL base e os cabeçalhos fiquem em um só lugar.
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    headers: {
        "Content-Type": "application/json",
    },
});
