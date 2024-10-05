const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const app = express();
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from the public directory

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)){
    fs.mkdirSync(imagesDir);
}

app.post('/save-images', async (req, res) => {
    const imageUrls = req.body.imageUrls; // Expect an array of image URLs
    const timestamp = Date.now(); // Use a timestamp to create a unique folder for each set of images
    const currentImagesDir = path.join(imagesDir, `images-${timestamp}`);

    fs.mkdirSync(currentImagesDir);

    const promises = imageUrls.map((url, index) => {
        return axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        }).then(response => {
            return new Promise((resolve, reject) => {
                const imagePath = path.join(currentImagesDir, `image-${index}.jpg`);
                const writer = fs.createWriteStream(imagePath);
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        });
    });

    try {
        await Promise.all(promises);
        res.status(200).send('Images saved successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving images');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
