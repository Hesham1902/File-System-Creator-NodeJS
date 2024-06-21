const fs = require("fs/promises");

(async () => {
  const createFile = async (path) => {
    try {
      const existingFileHandle = await fs.open(path, "r");
      // We already have that file...
      existingFileHandle.close();
      return console.log(`The file ${path} already exists.`);
    } catch (e) {
      // we don't have the file, now we should create it
      const newFileHandle = await fs.open(path, "w");
      console.log("A new file succesfully created");
      newFileHandle.close();
    }
  };

  //Commands
  const CREATE_FILE = "create a file";

  // file descriptor
  const commandFileHandler = await fs.open("./commands.txt", "r");

  /** 
  this solution can be problematic because it's loads all the content into the memory
  const test = await fs.readFile("./commands.txt");
  console.log(test);
  **/

  commandFileHandler.on("change", async () => {
    console.log("File content changed");

    const size = (await commandFileHandler.stat()).size;

    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    await commandFileHandler.read(buff, offset, length, position);

    // create a file <path>
    const command = buff.toString("utf-8");

    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      await createFile(filePath);
    }
  });

  // ..watcher
  const watcher = fs.watch("./commands.txt");
  for await (let event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
