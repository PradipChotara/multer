#!/usr/bin/env node

const { program } = require("commander");
const Table = require("cli-table");
const fs = require("fs");

console.log('CLI process ID:', process.pid);

// Create a new instance of cli-table
const table = new Table({
  head: ["Folder", "Time"], // Define the column headers
  colWidths: [30, 10], // Define the column widths
});

function getAllFoldersWithCreationTime(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => {
      const stats = fs.statSync(`${directory}/${item.name}`);
      const creationTime = stats.birthtime;
      const formattedTime = `${creationTime.getHours()}:${creationTime.getMinutes()}:${creationTime.getSeconds()}`;

      // Calculate time difference
      const currentTime = new Date();
      const creationTimeMillis = creationTime.getTime();
      const timeDifferenceMillis = currentTime.getTime() - creationTimeMillis;
      const timeDifferenceHours = Math.floor(timeDifferenceMillis / 3600000);
      const timeDifferenceMinutes = Math.floor(
        (timeDifferenceMillis % 3600000) / 60000
      );
      const timeDifferenceSeconds = Math.floor(
        (timeDifferenceMillis % 60000) / 1000
      );
      const timeLeft = `${timeDifferenceHours}:${timeDifferenceMinutes}:${timeDifferenceSeconds}`;

      return {
        name: item.name,
        creationTime: formattedTime,
        timeLeft: timeLeft,
      };
    });
}

const directoryPath = "./uploads";
const folders = getAllFoldersWithCreationTime(directoryPath);
// folders.forEach((folder, index) => {
//   // console.log([folder.name , folder.creationTime]);
//   table.push([folder.name, folder.timeLeft]);
// });

function updateTable() {
  const table = new Table({
    head: ["Folder", "Time", "Time Left"], // Define the column headers
    colWidths: [30, 10, 15], // Define the column widths
  });

  const folders = getAllFoldersWithCreationTime(directoryPath);

  folders.forEach((folder, index) => {
    table.push([folder.name, folder.creationTime, folder.timeLeft]);
  });

  console.clear(); // Clear console to update the table
  console.log(table.toString());
}

// Call updateTable function every second
setInterval(updateTable, 1000);

program
  .command("dashboard")
  .description("Greet someone")
  .action(() => {
    console.log(table.toString());
  });

program.parse(process.argv);
