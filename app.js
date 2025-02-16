const CLAUDE_API_KEY = "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";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";


async function askDeepseek(prompt) {
    try {
        const url = 'https://api.hyperbolic.xyz/v1/chat/completions';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0dW96aGFuZ2NvbnRhY3RAZ21haWwuY29tIiwiaWF0IjoxNzM3NTI0NjU0fQ.-JsIbehzpF-G0FcUOi98wMgrblnV6Rhv_dqT5l3goXk',
        },
            body: JSON.stringify({
            model: 'deepseek-ai/DeepSeek-R1',
            messages: [
                {
                role: 'user',
                content: prompt
                }
            ],
            max_tokens: 508,
            temperature: 0.1,
            top_p: 0.9,
            stream: false
            }),
        });
        const json = await response.json();

        const output = json.choices[0].message.content;
        
      return output;
    } catch (error) {
      console.error("Error:", error);
      return "Error: " + error.message;
    }
  }


async function sendPrompt() {
  const promptElement = document.getElementById("prompt");
  const responseElement = document.getElementById("response");
  const prompt = promptElement.value.trim();

  if (!prompt) {
    alert("Please enter a prompt!");
    return;
  }

  // Show loading state
  responseElement.textContent = "Loading...";
  responseElement.classList.add("loading");

  try {
    // const response = await askClaude(prompt);
    const response = await askDeepseek(prompt);

    responseElement.textContent = response;
  } catch (error) {
    console.log(error)
    responseElement.textContent = "Error: " + error.message;
  } finally {
    responseElement.classList.remove("loading");
  }
}

function uploadJSON() {
    const fileInput = document.getElementById('fileUpload');
    const jsonContentArea = document.getElementById('jsonContent');
  
    // Ensure a file is selected
    if (fileInput.files.length === 0) {
      jsonContentArea.textContent = 'No file selected.';
      return;
    }
  
    const file = fileInput.files[0];
  
    // Check if the file is a valid JSON
    if (file.type !== 'application/json') {
      jsonContentArea.textContent = 'Please upload a valid JSON file.';
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = function(event) {
      try {
        // Parse the JSON content
        const jsonData = JSON.parse(event.target.result);
  
        // Render the JSON in the pre tag, making sure it is formatted and scrollable
        jsonContentArea.textContent = JSON.stringify(jsonData, null, 2);
      } catch (error) {
        // Handle error if JSON parsing fails
        jsonContentArea.textContent = 'Error parsing JSON: ' + error.message;
      }
    };
  
    // Read the file as text
    reader.readAsText(file);
  }