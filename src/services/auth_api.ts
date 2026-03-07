import axios from "axios";

const API_BASE_URL = "https://faceapp-backend-production.up.railway.app/api/v1/auth";

export async function registerUser(email: string, password: string, firstName: string, lastName: string) {
    try {

        const random9Digit = Math.floor(100000000 + Math.random() * 900000000);
        const response = await axios.post(
            `${API_BASE_URL}/signup`,
            {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: random9Digit.toString(),
                password: password,
            }
        );

        // console.log('SUCCESS:', response.data);

        // console.log("API Response:", JSON.stringify(response.data));
        if (response.status !== 201) {
            return { code: response.status, error: "Registration failed", message: response.data.message || "Registration failed" };
        }
        else {
            return { code: response.status, message: "Registration successful", token: response.data.data.tokens.accessToken, refreshToken: response.data.data.tokens.refreshToken };
        }

    } catch (error: any) {
        // console.log("Registeration ERROR:", error);
        // console.log('STATUS:', error.response?.status);
        // console.log('DATA:', error.response?.data);
        // console.log('FULL ERROR:', error.message);
        return { code: error.response?.status || 500, error: "Registration failed", message: error.response?.data?.message || "Registration failed" };
    }
}

export async function loginUser(email: string, password: string) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/login`,
            {
                email: email,
                password: password,
            }
        );
        
        // console.log("Login Response:", JSON.stringify(response.data));
        if (response.status !== 200) {
            return { code: response.status, error: "Login failed", message: response.data.message || "Login failed" };
        }
        else {
            return { code: response.status, message: "Login successful", token: response.data.data.tokens.accessToken, refreshToken: response.data.data.tokens.refreshToken,emailVerified: response.data.data.emailVerified };
        }
    } catch (error: any) {
        return { code: error.response?.status || 500, error: "Login failed", message: error.response?.data?.message || "Login failed" };
    }
}

export async function refreshTokenAPI(refreshToken: string) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/refresh-token`,
            {
                refreshToken: refreshToken,
            }
        );
        if (response.status !== 200) {
            throw new Error(response.data.message || "Token refresh failed");
        }
        return { accessToken: response.data.data.accessToken };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Token refresh failed");
    }
}

export async function getProfile(accessToken: any) { 
    try {
        const response = await axios.get(
            `${API_BASE_URL}/me`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        if (response.status !== 200) {
            throw new Error(response.data.message || "Failed to fetch profile");
        }
        // console.log("Profile Response:", JSON.stringify(response.data));
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch profile");
    }   
}

export async function verifyOtp(otp: string) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/verify-email-otp`,
            {
                otp: otp,
            }
        );
        if (response.status !== 200) {
            throw new Error(response.data.message || "OTP verification failed");
        }
        return { accessToken: response.data.data.tokens.accessToken, refreshToken: response.data.data.tokens.refreshToken };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "OTP verification failed");
    }   
}

export async function resendOtp(accessToken: string) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/resend-email-otp`,
             {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        if (response.status !== 200) {
            throw new Error(response.data.message || "OTP resend failed");
        }   
        return true;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "OTP resend failed");
    }
}

export async function sendEmailVerificationOTP(accessToken: string) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/send-email-otp`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        if (response.status !== 200) {
            throw new Error(response.data.message || "Failed to send verification OTP");
        }
        else{
            // console.log("Email OTP Response:", JSON.stringify(response.data));
            return response.data;
        }
        return true;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to send verification OTP");
    }
}