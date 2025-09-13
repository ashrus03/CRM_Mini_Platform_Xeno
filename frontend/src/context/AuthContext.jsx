import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const [token, setToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const initializeAuth = async () => {
      setIsAuthLoading(true);

      const storedToken = localStorage.getItem("jwt_token");
      const storedUser = localStorage.getItem("user");

      try {
        if (storedToken) {
          const decodedToken = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000; // Convert to seconds

          if (decodedToken.exp && decodedToken.exp > currentTime) {
            setToken(storedToken);
            setLoggedIn(true);
          } else {
            // Token has expired
            setLoggedIn(false);
            setToken(null);
            setUser({});
            localStorage.removeItem("jwt_token");
          }
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        setLoggedIn(false);
        setToken(null);
        setUser({});
        localStorage.removeItem("jwt_token");
      } finally {
        setIsAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    navigate,
    token,
    setToken,
    loggedIn,
    setLoggedIn,
    showWelcomeMessage,
    setShowWelcomeMessage,
    user,
    setUser,
    isAuthLoading,
    setIsAuthLoading,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
