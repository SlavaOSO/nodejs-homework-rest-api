const app = require('./app')

const mongoose = require("mongoose");

const DB_HOST =
  "mongodb+srv://SlavaOso:352496Ovv1989@cluster0.xlicgsm.mongodb.net/contacts_reader?retryWrites=true&w=majority";

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(3000);
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });