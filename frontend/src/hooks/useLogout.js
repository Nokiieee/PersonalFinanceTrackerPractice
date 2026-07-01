import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const cancel = () => setIsOpen(false);
  const confirm = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return { isOpen, open, cancel, confirm };
}
