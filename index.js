const express = require('express');
const app = express();
const PORT  = 8080;

app.use( express.json() )

const cors = require('cors');

app.listen(
    PORT,
    () => console.log('alive')
)

app.use(cors({ origin: 'http://localhost:4200' }));


const appaccessRouter = require("./controller/appaccess");
app.use(appaccessRouter);

const userRouter = require("./controller/user_controller");
app.use(userRouter);

const adminRouter = require("./controller/admin_controller");
app.use(adminRouter);
