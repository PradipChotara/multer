#!/usr/bin/env node

const { program } = require("commander");
const Table = require("cli-table");
const fs = require("fs");

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
      return {
        name: item.name,
        creationTime: formattedTime,
      };
    });
}
const directoryPath = "./uploads";
const folders = getAllFoldersWithCreationTime(directoryPath);
folders.forEach((folder, index) => {
    // console.log([folder.name , folder.creationTime]);
    table.push([folder.name , folder.creationTime]);
})




program
  .command("dashboard")
  .description("Greet someone")
  .action(() => {
    console.log(table.toString());
  });

program.parse(process.argv);
