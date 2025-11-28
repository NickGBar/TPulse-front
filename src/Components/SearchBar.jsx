// src/components/SearchBar.jsx
import './SearchBar.css';

const SearchBar = ({ value, onChange, onFocus, placeholder = "Поиск..." }) => {
  return (
    <div className="search-bar">
      <div className="search-icon">🔍</div>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
      />
      {value && (
        <button 
          className="clear-button"
          onClick={() => onChange('')}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
