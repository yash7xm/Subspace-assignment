const express = require('express');
const axios = require('axios');
const app = express();
const port = 8080;

const blogURL = "https://intent-kit-16.hasura.app/api/rest/blogs";
const headers = {
    'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
};


app.get('/api/blog-stats', async (req, res) => {
    const response = await axios.get(blogURL, { headers });
   
    res.send(response.data);
})



app.listen(port, () => {
    console.log("Port runing on 8080");
})

