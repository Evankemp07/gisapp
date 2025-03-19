document.addEventListener("DOMContentLoaded", function () {
    const textarea = document.querySelector("textarea[name='description']");
    const previewBox = document.createElement("div");
    previewBox.id = "markdown-preview";
    previewBox.style.border = "1px solid #ccc";
    previewBox.style.padding = "10px";
    previewBox.style.marginTop = "10px";
    previewBox.style.minHeight = "50px";
    
    if (textarea) {
        textarea.parentNode.appendChild(previewBox);
        
        textarea.addEventListener("input", function () {
            fetch("/api/locations/render_markdown/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
                },
                body: JSON.stringify({ text: textarea.value })
            })
            .then(response => response.json())
            .then(data => {
                if (data.html) {
                    previewBox.innerHTML = data.html;
                } else {
                    previewBox.innerHTML = "<p>Error generating preview</p>";
                }
            })
            .catch(error => console.error("Error:", error));
        });
    }
});
