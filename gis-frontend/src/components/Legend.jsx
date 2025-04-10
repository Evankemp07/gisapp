import React from "react";

const Legend = ({ hidden, toggle }) => {
  return (
    <div style={{ position: "fixed", bottom: hidden ? "-150px" : "10px", left: "10px", transition: "bottom 0.3s ease-in-out", zIndex: 1000 }}>
      <div
        onClick={toggle}
        style={{
          backgroundColor: "#818381",
          color: "white",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: "4px 10px",
          gap: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
        title={hidden ? "Show" : "Hide"}
      >
        <span style={{ transform: hidden ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s", fontSize: "16px" }}>▲</span>
        <strong>{hidden ? "Show Legend" : "Hide Legend"}</strong>
      </div>

      {!hidden && (
        <div
          style={{
            marginTop: "8px",
            backgroundColor: "#d3d3d3",
            padding: "10px",
            borderRadius: "10px",
            fontSize: "12px",
            color: "#000",
          }}
        >
          <div style={{ marginBottom: "6px" }}>
            <img src="https://hideously-pleased-puma.ngrok-free.app/lightshow/animated.png" alt="Animated" style={{ height: "20px" }} /> = Animated
          </div>
          <div style={{ marginBottom: "6px" }}>
            <img src="https://hideously-pleased-puma.ngrok-free.app/lightshow/noncontestant.png" alt="Non-Contestant" style={{ height: "20px" }} /> = Non-Contestant
          </div>
          <div>
            <img src="https://hideously-pleased-puma.ngrok-free.app/lightshow/contestant.png" alt="Contestant" style={{ height: "20px" }} /> = Contestant
          </div>
        </div>
      )}
    </div>
  );
};

export default Legend;
