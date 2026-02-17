const Card = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 rounded-xl ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;