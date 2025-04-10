import React from "react";

const FormModal = ({ formData, handleChange, handleSubmit, onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          width: "350px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: "15px", color: "#333" }}>
          🎄 Did we miss your favorite? Submit the form below to add it to the map! 🎄
        </h3>

        {[
          { name: "lightShowName", placeholder: "Light Show Name" },
          { name: "name", placeholder: "Your Name" },
          { name: "email", placeholder: "Your Email", type: "email" },
          { name: "address", placeholder: "Light Show Address" },
        ].map(({ name, placeholder, type = "text" }) => (
          <input
            key={name}
            type={type}
            name={name}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            style={{ width: "85%", padding: "8px", marginBottom: "8px" }}
          />
        ))}

        <textarea
          name="description"
          placeholder="Light Show Description"
          value={formData.description}
          onChange={handleChange}
          style={{ width: "85%", padding: "8px", marginBottom: "8px", height: "80px" }}
        ></textarea>

        <div>
          <button
            onClick={handleSubmit}
            style={{
              background: "#007bff",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>

          <button
            onClick={onClose}
            style={{
              background: "#ddd",
              color: "black",
              padding: "10px",
              borderRadius: "5px",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
