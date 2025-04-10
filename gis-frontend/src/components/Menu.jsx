import React from "react";

const Menu = ({ menuOpen, toggleMenu, openForm }) => {
  return (
    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
      <button
        onClick={toggleMenu}
        style={{
          background: "#b30000",
          color: "white",
          padding: "10px 15px",
          border: "none",
          borderRadius: "5px",
          fontSize: "25px",
          cursor: "pointer",
        }}
      >
        ☰ Menu
      </button>

      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
            minWidth: "180px",
            marginTop: "5px",
            textAlign: "left",
          }}
        >
          <a
            href="mailto:map@lightsmusicaction.com"
            style={{
              display: "block",
              padding: "10px",
              textDecoration: "none",
              color: "#007bff",
            }}
          >
            📩 Contact Us
          </a>
          <a
            href="https://lightsmusicaction.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "10px",
              textDecoration: "none",
              color: "#007bff",
              borderTop: "1px solid #ddd",
            }}
          >
            🌐 Visit Website
          </a>
          <button
            onClick={openForm}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              textAlign: "left",
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              fontSize: "16px",
              borderTop: "1px solid #ddd",
            }}
          >
            ➕ Add Light Show
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
