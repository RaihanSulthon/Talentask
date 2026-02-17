import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMouseInsideRef = useRef(false);

  const handleMouseEnter = useCallback(() => {
    isMouseInsideRef.current = true;
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isMouseInsideRef.current = false;
    setIsHovered(false);
  }, []);

  const handleAfterNavigate = useCallback(() => {
    if (!isMouseInsideRef.current) {
      setIsHovered(false);
    }
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isHovered,
        handleMouseEnter,
        handleMouseLeave,
        handleAfterNavigate,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
