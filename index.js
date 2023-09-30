const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const app = express();
const port = 8080;

// Define the URL for the external blog API and headers
const blogURL = "https://intent-kit-16.hasura.app/api/rest/blogs";
const headers = {
    'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
};

// Define the caching duration for memoized functions (10 minutes)
const cachedDuration = 10 * 60 * 1000;

// Create memoized functions for statistics and search
const memoizedStats = _.memoize(calculateStats, undefined, cachedDuration);
const memoizedSearch = _.memoize(searchBlogs, undefined, cachedDuration);



// Route for fetching blog statistics
app.get('/api/blog-stats', async (req, res) => {
    try {
        // Retrieve cached statistics or compute if not cached
        const analyticsResult = await memoizedStats();
        res.json(analyticsResult);
    }
    catch (error) {
        console.error(`Error fetching blog data: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch blog stats' });
    }
});

// Route for searching blogs
app.get('/api/blog-search', async (req, res) => {
    try {
        const query = req.query.query;

        if (!query) {
            // Handle missing query parameter
            res.status(400).json({ error: "Query parameter is missing" });
            return;
        }

        // Retrieve cached search results or compute if not cached
        const searchResults = await memoizedSearch(query);

        res.json(searchResults);
    }
    catch (error) {
        console.error(`Error processing blog search: ${error.message}`);
        res.status(500).json({ error: 'Failed to process blog search' });
    }
});

// Function to fetch blog data from the external API
async function fetchBlogData() {
    const response = await axios.get(blogURL, { headers });
    const blogData = response.data.blogs;
    return blogData;
}

// Function to calculate blog statistics
async function calculateStats() {
    const blogData = await fetchBlogData();

    // Calculate various statistics
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
    };

    return analyticsResult;
}

// Function to search blogs by query
async function searchBlogs(query) {
    const blogData = await fetchBlogData();

    // Perform a case-insensitive search
    const searchResults = _.filter(blogData, (blog) =>
        _.includes(_.toLower(blog.title), _.toLower(query))
    );

    return searchResults;
}

// Start the Express server
app.listen(port, () => {
    console.log("Server is running on port 8080");
});
