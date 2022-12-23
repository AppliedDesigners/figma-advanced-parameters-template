type Command = "questions"

const QUESTIONS = "questions";

const ERROR = 'error'
const COMMANDS = {
  QUESTIONS
};

const NUMBER = "number"
const PARAMTERS = {
  NUMBER
};

const DEFAULT_FONT_CONFIG = { family: "Inter", style: "Regular" }

const NUMBER_OPTIONS = ["5", "10", "15", "20", "25"]

// https://the-trivia-api.com/docs/
const TRIVIA_API_URL = "https://the-trivia-api.com/api/questions"

function createText(characters: string, size: number) {
  const text = figma.createText()
  text.fontName = DEFAULT_FONT_CONFIG
  text.characters = characters
  text.fontSize = size
  return text 
}

function setFrameLayout(frame: FrameNode) {
  frame.layoutMode = "VERTICAL"
  frame.primaryAxisSizingMode = 'AUTO'
  frame.counterAxisSizingMode = 'AUTO'
  frame.itemSpacing = 50
}

async function startUI() {
  figma.showUI(__html__, { visible: false });

  figma.ui.onmessage = async (msg) => {
    if (msg.type === ERROR) {
      figma.notify(msg.message, {error: true})
    } else if (msg.type === COMMANDS.QUESTIONS) {
      const questions = msg.response
      await figma.loadFontAsync(DEFAULT_FONT_CONFIG);

      const frame = figma.createFrame()

      // Create a text node for each question and set characters to be the question value
      for (let index = 0; index < questions.length; index++) {
        const { question } = questions[index];

        const questionText = createText(question, 20)
        frame.appendChild(questionText)
        frame.layoutGrow = 1
      }
      
      // Set the frame bounding box and items layout behavior
      setFrameLayout(frame)
      
      // Scroll the nodes into view
      // figma.viewport.scrollAndZoomIntoView([frame])
    } else {
      figma.notify(`Unsupported message type: ${msg.type}`)
    }
    
    figma.closePlugin();
  }
}

startUI();

figma.parameters.on("input", ({ key, query, result }: ParameterInputEvent) => {
  switch (key) {
    case PARAMTERS.NUMBER:
      result.setSuggestions(NUMBER_OPTIONS);
      break;
    default:
      return;
  }
});

/**
 * Perform action after all parameters have been added
 */
figma.on("run", async ({ command, parameters }: RunEvent) => {
  const ctxCommand = command as Command;

  if (parameters) {
    switch (ctxCommand) {
      case COMMANDS.QUESTIONS:
        figma.ui.postMessage({
          type: COMMANDS.QUESTIONS,
          url: `${TRIVIA_API_URL}?limit=${parameters.number}`
        });
        break;

      default:
        break;
    }
  }
  // VIP: don't call figma.closePlugin() here
  // - we will close the plugin on response from the API
});

export {};
