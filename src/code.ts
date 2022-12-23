async function startUI() {
  figma.showUI(__html__, { visible: false });

  figma.ui.onmessage = async (msg) => {
    figma.closePlugin();
  }
}

startUI();

figma.parameters.on("input", ({ key, query, result }: ParameterInputEvent) => {
});

/**
 * Perform action after all parameters have been added
 */
figma.on("run", async ({ command, parameters }: RunEvent) => {
});

export {};
