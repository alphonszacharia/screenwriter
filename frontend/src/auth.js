export const logoutDueToExpiry = () => {
    window.dispatchEvent(
        new CustomEvent("session-expired")
    );
};

export const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        logoutDueToExpiry();
        throw new Error("No authentication token");
    }

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
    };

    if (
        options.body &&
        !(options.body instanceof FormData)
    ) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (
        response.status === 401 ||
        response.status === 403
    ) {
        logoutDueToExpiry();
        throw new Error("Session expired");
    }

    return response;
};