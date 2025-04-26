const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    generateUploadURL,
    saveMetadata,
    getDownloadURL,
    deleteFile,
    renameFile,
    searchFile,
} = require('../controllers/fileController');

router.use(protect);

router.post('/upload-url', generateUploadURL);

router.post('/save-metadata', saveMetadata);

router.get('/download/:fileId', getDownloadURL);

router.delete('/delete/:key', deleteFile);

router.put('/rename/:key', renameFile);

router.post('/search', searchFile);

module.exports = router;