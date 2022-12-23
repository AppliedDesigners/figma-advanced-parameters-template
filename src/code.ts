async function startUI() {
  // Show the plugin ui html if any is present
  // - __html__ is a special global variable which references the ui specified in manifest.json
  // https://www.figma.com/plugin-docs/api/properties/figma-showui#signature
  figma.showUI(__html__, { visible: false });

  // Receive messages from UI within plugin
  // - https://www.figma.com/plugin-docs/api/properties/figma-ui-onmessage/#signature
  figma.ui.onmessage = async (msg) => {
    figma.closePlugin();
  }
}

startUI();

/**
 * Present suggestions on command palette input
 * - https://www.figma.com/plugin-docs/plugin-parameters#suggestions
 */
figma.parameters.on("input", ({ key, query, result }: ParameterInputEvent) => {
});

/**
 * Perform action after all parameters have been added
 * - DOCS: https://www.figma.com/plugin-docs/plugin-parameters/#run
 */
figma.on("run", async ({ command, parameters }: RunEvent) => {
});

export {};
