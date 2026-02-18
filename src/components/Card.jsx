const Card = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-xl shadow-sm ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
