const CLAUDE_API_KEY = "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";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
let uploadedJsonString = null
let questionSetWithId = null
let solutionByBot = null
let accuracyField = document.getElementById("accuracy")


function updateUI(fullContent) {
    const responseElement = document.getElementById("response");
    responseElement.textContent = fullContent;
}

async function askDeepseek(prompt) {
    promptHardCoded = "please answer the question set in json format, you could just fill the answer field of each question"
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
                content: uploadedJsonString + promptHardCoded
                }
            ],
            max_tokens: 2048,
            temperature: 0.1,
            top_p: 0.9,
            stream: true
            }),
        });
    // Get the response as a readable stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the stream chunk
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      // Process each line
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          if (line.includes("[DONE]")) continue;
          
          try {
            const jsonData = JSON.parse(line.replace("data: ", ""));
            const content = jsonData.choices[0].delta.content;
            if (content) {
              fullContent += content;
              // Update UI immediately with each chunk
              updateUI(fullContent);
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }
    }

    solutionByBot = extractJSON(fullContent)
    console.log("solutionByBot")
    console.log(solutionByBot)
    accuracy = evaluateAccuracy(questionSetWithId,solutionByBot)
    accuracyField.textContent = accuracyField.textContent + accuracy
    return fullContent;
    } catch (error) {
      console.error("Error:", error);
      return "Error: " + error.message;
    }
  }

  function extractJSON(text) {
    const thinkClosingIndex = text.indexOf('</think>');
    if (thinkClosingIndex === -1) return null;
  
    // Look for JSON array only after the </think> tag
    const textAfterThink = text.slice(thinkClosingIndex + 8); // 8 is length of '</think>'

    const bracketRegex = /\[\s*{[\s\S]*}\s*\]/;
    const bracketMatch = textAfterThink.match(bracketRegex);
    
    if (bracketMatch) {
      try {
        return JSON.parse(bracketMatch[0]);
      } catch (e) {
        console.error("Failed to parse JSON with bracket method:", e);
      }
    }
  
    return null;
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
    askDeepseek(prompt);
  } catch (error) {
    console.log(error)
    responseElement.textContent = "Error: " + error.message;
  } finally {
    responseElement.classList.remove("loading");
  }
}

function evaluateAccuracy(groundTruth, attemptedSolution) {
    if (groundTruth.length !== attemptedSolution.length) {
        console.error("Mismatch in the number of questions.");
        return 0; // Return 0% if the datasets are not the same length
    }

    let correctCount = 0;

    for (let i = 0; i < groundTruth.length; i++) {
        debugger; 
        if (groundTruth[i].id === attemptedSolution[i].id &&
            String(groundTruth[i].answer) === String(attemptedSolution[i].answer)) {
            correctCount++;
        }
    }

    const accuracy = (correctCount / groundTruth.length) * 100;
    return accuracy.toFixed(2) + "%";
}

function removeAnswer(input) {
    return input.map((item, index) => ({
      id: index + 1, // Generate a unique ID based on index
      question: item.question,
      answer: "" // Set answer to an empty string
    }));
  }

function addId(input) {
return input.map((item, index) => ({
    id: index + 1, // Generate a unique ID based on index
    question: item.question,
    answer:item.answer
}));
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
        let jsonData = JSON.parse(event.target.result);
        questionSetWithId = structuredClone(addId(jsonData))
        jsonData = removeAnswer(jsonData)

        // Render the JSON in the pre tag, making sure it is formatted and scrollable
        jsonContentArea.textContent = JSON.stringify(questionSetWithId, null, 2);
        uploadedJsonString = JSON.stringify(jsonData, null, 2)
      } catch (error) {
        // Handle error if JSON parsing fails
        jsonContentArea.textContent = 'Error parsing JSON: ' + error.message;
      }
    };
  
    // Read the file as text
    reader.readAsText(file);
  }