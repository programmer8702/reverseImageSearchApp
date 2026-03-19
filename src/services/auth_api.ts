import axios from "axios";

const API_BASE_URL = "https://faceapp-backend-production.up.railway.app/api/v1/auth";

export async function registerUser(email: string, password: string, firstName: string, lastName: string, phoneNumber: string) {
    try {

        const random9Digit = Math.floor(100000000 + Math.random() * 900000000);
        const response = await axios.post(
            `${API_BASE_URL}/signup`,
            {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: phoneNumber || `+1${random9Digit}`,
                password: password,
            }
        );

        if (response.status !== 201) {
            return { code: response.status, error: "Registration failed", message: response.data.message || "Registration failed" };
        }
        else {
            return { code: response.status, message: "Registration successful", token: response.data.data.tokens.accessToken, refreshToken: response.data.data.tokens.refreshToken };
        }

    } catch (error: any) {
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

        if (response.status !== 200) {
            return { code: response.status, error: "Login failed", message: response.data.message || "Login failed" };
        }
        else {
            return { code: response.status, message: "Login successful", token: response.data.data.tokens.accessToken, refreshToken: response.data.data.tokens.refreshToken, emailVerified: response.data.data.emailVerified };
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
        if(!response.data.success){
            return { code: response.status, error: "Token refresh failed", message: response.data.message || "Session expired. Please log in again." };
        }
        return { accessToken: response.data.data.accessToken, refreshToken: response.data.data.refreshToken };
    } catch (error: any) {
        return { code: error.response?.status || 500, error: "Token refresh failed", message: "Session expired. Please log in again." };

        // throw new Error(error.response?.data?.message || "Token refresh failed");
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
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            return null; // Token might be invalid or expired, will trigger re-authentication
        }
        throw new Error(error.response?.data?.message || "Failed to fetch profile");
    }
}

export async function verifyOtp(otp: string, accessToken: string, forgot: boolean = false, email?: string) {
    if (!forgot) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/verify-email-otp`,
                {
                    otp: otp,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }

            );
            if (response.status !== 200) {
                throw new Error(response.data.message || "OTP verification failed");
            }
            return { accessToken: response.data.data.tokens.accessToken, refreshToken: response.data.data.tokens.refreshToken };
        } catch (error: any) {
            console.log("OTP Verification ERROR:", error);
            throw new Error(error.response?.data?.message || "OTP verification failed");
        }
    }
    else {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/verify-otp`,
                {
                    otp: otp,
                    email:email
                }

            );
            if (response.status !== 200) {
                throw new Error(response.data.message || "OTP verification failed");
            }
            return { success: response.data.success, message: response.data.message, resetToken: response.data.resetToken };
        } catch (error: any) {
            console.log("OTP Verification ERROR:", error);
            throw new Error(error.response?.data?.message || "OTP verification failed");
        }
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
        else {
            // console.log("Email OTP Response:", JSON.stringify(response.data));
            return response.data;
        }
        return true;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to send verification OTP");
    }
}

export async function resetPassword(resetToken: string, newPassword: string) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/reset-password`,
            {
                resetToken: resetToken,
                newPassword: newPassword,
            }
        );
        if (response.status !== 200) {
            throw new Error(response.data.message || "Password reset failed");
        }
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Password reset failed");
    }
}

export async function sendForgotPasswordOTP(email: string) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/forgot-password`,
            {
                email: email,
            }
        );
        if (response.status !== 200) {
            throw new Error(response.data.message || "Failed to send OTP");
        }
        return response;
    }
    catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
}


export async function updateProfileAPI(profileData: { firstName?: string; lastName?: string }, accessToken: string) {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/edit-profile`,
            profileData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        // console.log("Profile Update Response:", JSON.stringify(response.data));
        if (response.status !== 200) {
            throw new Error(response.data.message || "Profile update failed");
        }
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Profile update failed");
    }
}
