import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [error, setError] = useState(null);

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setResultData("");
    setInput("");
  };

  const formatResponse = (response) => {
    if (!response) {
      console.error("Response is null or undefined.");
      return [];
    }

    const formattedResponse = response
      .split("**")
      .map((part, index) => (index % 2 === 1 ? `<b>${part}</b>` : part))
      .join("")
      .split("*")
      .join("</br>")
      .split(" ");

    return formattedResponse;
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    setError(null);

    try {
      const response = await run(prompt || input);

      const newPrompt = prompt || input.trim();
      if (newPrompt) {
        setRecentPrompt(newPrompt);
        if (!prevPrompts.includes(newPrompt)) {
          setPrevPrompts((prev) => {
            const updatedPrompts = [...prev, newPrompt];
            console.log("Updated prevPrompts:", updatedPrompts); // Debugging log
            return updatedPrompts;
          });
        }
      }

      const formattedResponse = formatResponse(response);
      formattedResponse.forEach((word, index) => {
        delayPara(index, word + " ");
      });
    } catch (error) {
      console.error("Error while fetching response:", error);
      setError(
        "An error occurred while fetching the response. Please try again."
      );
    } finally {
      setLoading(false);
      if (!error) setInput(""); // Clear input only if no error occurred
    }
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    error,
    newChat
  };

  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
