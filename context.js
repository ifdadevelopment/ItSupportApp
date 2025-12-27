import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { API_BASE_URL } from "./config";
import { replace } from "./navserviceRef";
import Toast from "react-native-toast-message";
import { io } from "socket.io-client";

const DataContext = createContext();

const DataProviderFuncComp = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {

    });

    newSocket.on("disconnect", () => {
    });

    return () => {
      newSocket.disconnect();
    };
  }, []); // <-- empty dependency so it runs once


  /*** Check and refresh session before any API call*/
  const checkSession = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        setLoading(false);
        replace("Login");
        return null;
      }

      const res = await axios.post(`${API_BASE_URL}/get-access-token/`, {
        refreshToken,
        token
      }, () => { setLoading(false) });

      if (res.data?.accessToken) {
        const freshToken = res.data.accessToken;
        setToken(freshToken);
        if (res.data.my_user) {
          setUser(res.data.my_user);
        }
        return freshToken;
      } else {
        setToken(null);
        await AsyncStorage.removeItem("refreshToken");
        setLoading(false);
        replace("Login");
        return null;
      }
    } catch (error) {
      if (error.message?.includes("Network Error") ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes("timeout")) {
        alert("Please Connect To internet");
        return;
      }
      setToken(null);
      await AsyncStorage.removeItem("refreshToken");
      setLoading(false);
      replace("Login");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /** * GET request with session check
*/
  const apiGet = async (endpoint, params = {}, setData) => {
    try {
      const freshToken = await checkSession(); //  get fresh token
      if (!freshToken) return null;

      const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${freshToken}`, // always fresh
        },
        params,
        timeout: 10000,
      });
      setData(res.data);
      return res.data;
    } catch (error) {
      checkSession();
      let message = "Something went wrong. Please try again.";

      if (error.response?.data?.error) {
        message = error.response.data.error;
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: message
      });

      return null;
    }
  };

  /*** POST request with session check */
  const apiPost = async (endpoint, body = {}, setButton, myFunc = async () => { }) => {
    try {
      setButton(true);
      // const freshToken = await AsyncStorage.getItem('token');
      const freshToken = await checkSession();
      if (!freshToken) {
        setLoading(false);
        return null
      };
      const res = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${freshToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      await myFunc();
      return res.data;
    } catch (error) {

      let message = "Something went wrong. Please try again.";
      if (error.response?.data?.error) {
        message = error.response.data.error;
      }
      Toast.show({
        type: "error",
        text1: message,
      });
      return null;
    } finally {
      setLoading(false);
      setButton(false);
    }

  };

  // 📌 Add this in DataContext *below apiPost*
  const apiPostPublic = async (endpoint, body = {}, showToast = true) => {
    try {
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, body, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });
      return res?.data;
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong.";

      if (showToast) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: message,
        });
      }
      return null;
    }
  };

  const logoutFunc = async () => {
    try {
      const data = await apiPost("/logout/", { userId: user?._id }, (m) => { setLoading(false); });
      if (data !== null) {
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem("refreshToken");
        setLoading(false);
        replace("Login");
      }
      else {
        checkSession();
        Toast.show({ type: 'error', text1: "Internal Server Error" });
      }
    }
    catch (err) {
      checkSession();
      Toast.show({ type: 'error', text1: "Please Connect to internet" });
    }
    finally {
      setLoading(false);
    }
  }



  // ---------- NEW: PUT ----------
  const apiPut = async (endpoint, body = {}, setButton, myFunc = async () => { }) => {
    try {
      setButton?.(true);
      const freshToken = await checkSession();
      if (!freshToken) { setLoading(false); return null; }

      const res = await axios.put(`${API_BASE_URL}${endpoint}`, body, {
        headers: {
          Authorization: `Bearer ${freshToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      Toast.show({ type: "success", text1: "Updated successfully" });
      await myFunc();
      return res.data;
    } catch (error) {
      let message = "Update failed. Please try again.";
      if (error.response?.data?.error) message = error.response.data.error;

      Toast.show({ type: "error", text1: "Update failed", text2: message });
      return null;
    } finally {
      setLoading(false);
      setButton?.(false);
    }
  };
  const apiDelete = async (endpoint, optionsOrBody = {}, setButton, myFunc = async () => { }) => {
    try {
      setButton?.(true);
      const freshToken = await checkSession();
      if (!freshToken) { setLoading(false); return null; }

      const config = {
        headers: { Authorization: `Bearer ${freshToken}` },
        timeout: 10000,
        ...optionsOrBody,
      };

      const res = await axios.delete(`${API_BASE_URL}${endpoint}`, config);

      Toast.show({ type: "success", text1: "Deleted successfully" });
      await myFunc();
      return res.data;
    } catch (error) {
      let message = "Delete failed. Please try again.";
      if (error.response?.data?.error) message = error.response.data.error;

      Toast.show({ type: "error", text1: "Delete failed", text2: message });
      return null;
    } finally {
      setLoading(false);
      setButton?.(false);
    }
  };
  const apiPostForm = async (endpoint, formData, setButton) => {
    try {
      setButton(true);

      const freshToken = await checkSession(); // Get the fresh token
      if (!freshToken) return null;

      const res = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${freshToken}`,
          "Content-Type": "multipart/form-data", // Ensure this is set for file uploads
        },
      });

      setButton(false);
      return res.data;
    } catch (err) {
      let message = "Something went wrong. Please try again.";
      if (err.response?.data?.error) {
        message = err.response.data.error;
      }
      Toast.show({
        type: "error",
        text1: message,
      });

      setButton(false);
      return null;
    }
  };


  return (
    <DataContext.Provider
      value={{
        checkSession,
        apiGet,
        token,
        user,
        loading,
        apiPost,
        logoutFunc,
        setUser,
        user,
        setToken,
        setLoading,
        apiPut,
        apiDelete,
        socket,
        apiPostForm, apiPostPublic
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export { DataProviderFuncComp, DataContext };
