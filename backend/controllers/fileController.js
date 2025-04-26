const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../utils/s3Client');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const {
    fileJoiSchema,
    uploadJoiSchema,
    renameJoiSchema,
    searchJoiSchema
} = require('../validators/fileValidator');

const BUCKET = process.env.AWS_BUCKET_NAME;

const generateUploadURL = async (req, res) => {
    console.log("generateUploadURL");
    const { error } = uploadJoiSchema.validate(req.body);
    if (error) return res.status(400).json({error: error.details[0].message});
    
    const { filename, contentType } = req.body;
    const key = `bunker-files/${uuidv4()}_${filename}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ uploadUrl: url, key });
}

const saveMetadata = async (req, res) => {
    console.log("saveMetadata");
    const { error } = fileJoiSchema.validate(req.body);
    if (error) return res.status(400).json({error: error.details[0].message});

    const userId = req.user.userId;

    const existingFile = await File.findOne({ filename:req.body.filename, userId: userId});
    if (existingFile) return res.status(400).json({error: "File already exists"})
    const file = new File({...req.body, userId: userId});
    await file.save();
    res.status(201).json(file);
}

const getDownloadURL = async (req, res) => {
    console.log("getDownloadURL");
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: file.key,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 300 });

        res.status(200).json({ downloadUrl: url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error generating download URL' });
    }
}

const deleteFile = async (req, res) => {
    console.log("deleteFile");
    const { key } = req.params;

    if (!key) {
        return res.status(400).json({ error: 'Invalid or missing file key' });
    }
    const file = await File.findById(key);
    if (!file) {
        return res.status(404).json({ error: 'No such file exists' });
    }
  
    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: file.key,
    });
  
    try {
        await s3.send(command);
        const deletedMetadata = await File.findOneAndDelete({ _id: key });
    
        if (!deletedMetadata) {
            return res.status(404).json({ error: 'File metadata not found in database' });
        }
    
        return res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Error deleting file from S3:', err);
        return res.status(500).json({ error: 'Failed to delete file from S3' });
    }
};

const renameFile = async (req, res) => {
    const { error, value } = renameJoiSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { key } = req.params;
    const { newFilename } = value;

    try {
        const file = await File.findOne({ _id: key });
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const newKey = `bunker-files/${file.key.split('/')[1].split('_')[0]}_${newFilename}`;

        const copyCommand = new CopyObjectCommand({
            Bucket: BUCKET,
            CopySource: `${BUCKET}/${file.key}`,
            Key: newKey
        });
        await s3.send(copyCommand);

        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: file.key
        });
        await s3.send(deleteCommand);

        file.key = newKey;
        file.filename = newFilename;
        file.url = `https://${BUCKET}.s3.amazonaws.com/${newKey}`;
        await file.save();

        return res.json({
            message: 'File renamed successfully',
            newKey: file.key,
            newFilename: file.filename
        });
    } catch (err) {
        console.error('Rename error:', err);
        res.status(500).json({ error: 'Failed to rename file' });
    }
}

const searchFile = async (req, res) => {
    const { error } = searchJoiSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { query } = req.body;
        const userId = req.user.userId;

        const searchCondition = query
            ? { userId, filename: { $regex: query, $options: 'i' } }
            : { userId };

        const files = await File.find(searchCondition);
        return res.status(200).json({ results: files });
    } catch (err) {
        console.error('Search error:', err);
        return res.status(500).json({ error: 'Server error while searching files' });
    }
};

module.exports = {
    generateUploadURL,
    saveMetadata,
    getDownloadURL,
    deleteFile,
    renameFile,
    searchFile,
}