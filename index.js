const express = require('express');
const app = express();

app.post('/', (req, res) => {
    const { params, body, query } = res;
    console.log(params, body, query);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`listening to ${PORT}`));
