// src/components/BottomMenu.jsx
import './BottomMenu.css';

const BottomMenu = ({ items, activeItem, onItemClick }) => {
  return (
    <div className="bottom-menu">
      {items.map((item) => (
        <button
          key={item.id}
          className={`menu-item ${activeItem === item.id ? 'active' : ''} ${
            item.id === 'ai' ? 'menu-item-ai' : ''
          }`}
          onClick={() => onItemClick(item.id)}
        >
          <span className="menu-icon">{item.icon}</span>
          <span className="menu-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomMenu;
