const fs = require("fs/promises");

(async () => {
  // Commands
  const CREATE_FILE = "create a file";
  const RENAME_FILE = "rename the file";
  const DELETE_FILE = "delete the file";
  const ADD_TO_FILE = "add to the file";

  // Functions
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

  const renameFile = async (oldPath, newPath) => {
    try {
      // check of the file exist
      const existingFileHandle = await fs.open(oldPath, "r");
      // if the file exist then rename file name
      await fs.rename(oldPath, newPath);
      await existingFileHandle.close();
      console.log(`The file ${oldPath} changed succesfully to ${newPath}`);
    } catch (e) {
      if (e.code === "ENOENT") {
        console.log(
          "No file at this path to rename, or the destination doesn't exist"
        );
      } else {
        console.log("An error occured");
        console.log(e);
      }
    }
  };

  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      console.log(`The file ${path} deleted succesfully`);
    } catch (e) {
      if (e.code === "ENOENT") {
        // file doesn't exist
        console.log("File doesn't exist");
      } else {
        console.log("An error occured");
        console.log(e);
      }
    }
  };

  const addToFile = async (path, content) => {
    try {
      await fs.appendFile(path, content);
      console.log(`content added succesfully to ${path}`);
    } catch (e) {
      console.log("An error occured");
      console.log(e);
    }
  };

  // file descriptor
  const commandFileHandler = await fs.open("./commands.txt", "r");

  /** 
  this solution can be problematic because it's loads all the content into the memory
  const test = await fs.readFile("./commands.txt");
  console.log(test);
  **/

  // @ts-ignore
  commandFileHandler.on("change", async () => {
    console.log("File content changed");

    const size = (await commandFileHandler.stat()).size;

    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    await commandFileHandler.read(buff, offset, length, position);
    const command = buff.toString("utf-8");

    // ✅ create a file:
    // create a file <path>
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      await createFile(filePath);
    }

    // ✅ rename a file:
    // rename the file <path> to <new-path>
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldPath = command.substring(RENAME_FILE.length + 1, _idx);
      const newPath = command.substring(_idx + 4);
      await renameFile(oldPath, newPath);
    }

    // ✅ delete a file:
    // delete the file <path>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      await deleteFile(filePath);
    }

    // ✅ add to file:
    // add to the file <path> this content: <content>

    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" this content: ");
      const filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
      const content = command.substring(_idx + 15);
      console.log(content);
      await addToFile(filePath, content);
    }
  });

  // ..watcher
  const watcher = fs.watch("./commands.txt");
  let timeout;
  // for await (let event of watcher) {
  //   if (event.eventType === "change") {
  //     // @ts-ignore
  //     commandFileHandler.emit("change");
  //   }
  // }
  for await (const event of watcher) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log(event);
      // @ts-ignore
      commandFileHandler.emit(event.eventType);
    }, 100); // Adjust timeout as needed but 100 ms should do it
  }
})();
