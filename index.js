const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const app = express();
const port = 8080;

const blogURL = "https://intent-kit-16.hasura.app/api/rest/blogs";
const headers = {
    'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
};


app.get('/api/blog-stats', async (req, res) => {
    const response = await axios.get(blogURL, { headers });
    const blogData = response.data.blogs;

    const totalBlogs = blogData.length;
    const blogWithLongestTitle = _.maxBy(blogData, 'title.length');
    const blogsWithPrivacyInTitle = _.filter(blogData, (blog) =>
        _.includes(_.toLower(blog.title), 'privacy')
    );
    const numberOfBlogsWithPrivacyTitle = blogsWithPrivacyInTitle.length;
    const uniqueBlogTitles = _.uniqBy(blogData, 'title').map((blog) => blog.title);
    
    const analyticsResult = {
        totalBlogs,
        blogWithLongestTitle,
        numberOfBlogsWithPrivacyTitle,
        uniqueBlogTitles
    }

    res.send(analyticsResult);
})

app.get('/api/blog-search', async (req, res) => {
    const query = req.query.query;

    if(!query){
        res.status(400).json({error: "Query parameter is missing"})
        return;
    }

    const response = await axios.get(blogURL, { headers });
    const blogData = response.data.blogs;

    const searchResults = _.filter(blogData, (blog) => 
     _.includes(blog.title, query)
    );

    res.send(searchResults);
})



app.listen(port, () => {
    console.log("Port runing on 8080");
})

