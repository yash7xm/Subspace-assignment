const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const app = express();
const port = 8080;

const blogURL = "https://intent-kit-16.hasura.app/api/rest/blogs";
const headers = {
    'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
};

const cachedDuration = 10*60*1000;
const memoizedStats = _.memoize(calculateStats, undefined, cachedDuration);
const memoizedSearch = _.memoize(searchBlogs, undefined, cachedDuration);

app.get('/api/blog-stats', async (req, res) => {

    try {

        const analyticsResult = await memoizedStats();

        res.send(analyticsResult);

    }
    catch (error) {
        console.error(`Error fetching blog data: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch blog stats' });
    }
})

app.get('/api/blog-search', async (req, res) => {
   try {
    const query = req.query.query;

    if(!query){
        res.status(400).json({error: "Query parameter is missing"})
        return;
    }

  
    const searchResults = await memoizedSearch(query);
    

    res.send(searchResults);
   }
   catch (error){
    console.error(`Error processing blog search: ${error.message}`);
    res.status(500).json({ error: 'Failed to process blog search' });
   }
})

async function fetchBlogData() {
    const response = await axios.get(blogURL, { headers });
    const blogData = response.data.blogs;
    return blogData;
}

async function calculateStats() {
    const blogData = await fetchBlogData();

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

    return analyticsResult;
}

async function searchBlogs(query) {
    const blogData = await fetchBlogData();

    const searchResults = _.filter(blogData, (blog) => 
     _.includes(blog.title, query)
    );
    
    return searchResults;
}



app.listen(port, () => {
    console.log("Port runing on 8080");
})

