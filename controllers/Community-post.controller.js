
// const Post = require('../models/Community-post.model');  // Correct path
// const multer = require('multer');
// const path = require('path');

// // Set up storage for Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Upload folder path
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });

// // Define file filter (only accept images and videos)
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
//     cb(null, true); // Accept file
//   } else {
//     cb(new Error('Invalid file type. Only image and video are allowed!'), false); // Reject file
//   }
// };

// // Initialize Multer upload middleware
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
// });

// // **Create a post with image or video upload**
// exports.createPost = async (req, res) => {
//   try {
//     // Handle file upload using multer for single file 'mediaFile'
//     upload.single('mediaFile')(req, res, async (err) => {
//       if (err) {
//         console.error('Multer error:', err.message);
//         return res.status(400).json({ message: err.message });
//       }

//       // Extract form data from the request body
//       const { content, circleId } = req.body;

//       if (!content) {
//         return res.status(400).json({ message: "Content is required" });
//       }

//       let mediaUrl = null;
//       let mediaType = null;

//       // If a file is uploaded, store the media URL and type
//       if (req.file) {
//         mediaUrl = `/uploads/${req.file.filename}`;
//         mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
//       }

//       // Create a new post object
//       const newPost = new Post({
//         userId: req.user.id, // Extract user from middleware (auth)
//         content: {
//           text: content,
//           mediaUrl: mediaUrl,
//           mediaType: mediaType,
//         },
//         circleId: circleId,
//       });

//       // Save the post to the database
//       const savedPost = await newPost.save();

//       res.status(201).json({ message: "Post created successfully", post: savedPost });
//     });

//   } catch (error) {
//     console.error('Server error:', error.message);
//     res.status(500).json({ error: error.message });
//   }
// };


// // Delete a post
// exports.deletePost = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const post = await Post.findById(id);

//     if (!post) return res.status(404).json({ message: "Post not found" });

//     // Ensure the user owns the post
//     if (post.userId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Unauthorized action" });
//     }

//     await post.deleteOne();
//     res.status(200).json({ message: "Post deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get posts for feed
// exports.getFeedPosts = async (req, res) => {
//   try {
//     const posts = await Post.find()
//       .sort({ createdAt: -1 })
//       .populate("userId", "name email"); // Populate user info (name & email)

//     res.status(200).json(posts);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get user's posts
// exports.getUserPosts = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const userPosts = await Post.find({ userId })
//       .sort({ createdAt: -1 })
//       .populate("userId", "name email");

//     res.status(200).json(userPosts);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


//old one before circle id remove complete work 

const Post = require('../models/Community-post.model');  // Correct path
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Set up storage for Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null,  path.join(__dirname, '../uploads/')); // Upload folder path
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
//   },
// });

// // Define file filter (only accept images and videos)
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
//     cb(null, true); // Accept file
//   } else {
//     cb(new Error('Invalid file type. Only image and video are allowed!'), false); // Reject file
//   }
// };

// // Initialize Multer upload middleware
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
// });

// **Create a post with image or video upload**
exports.createPost = async (req, res) => {
  try {
    // Extract form data from the request body
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    let mediaUrl = null;
    let mediaType = null;

    // If a file is uploaded, store the media URL and type
    if (req.file) {
      mediaUrl = `${req.protocol}://${req.get('host')}/uploads/postImages/${encodeURIComponent(req.file.filename)}`; // File URL to access it from frontend
      mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
    }

    // Create a new post object
    const newPost = new Post({
      userId: req.user.id, // Extract user from middleware (auth)
      content: {
        text: content,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
      },
    });

    // Save the post to the database
    const savedPost = await newPost.save();

    res.status(201).json({ 
      message: "Post created successfully", 
      post: savedPost 
    });

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: error.message });
  }
};


// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure the user owns the post
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get posts for feed
exports.getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email"); // Populate user info (name & email)

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Trim any unnecessary whitespace or newline characters
    const trimmedUserId = userId.trim();

    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(trimmedUserId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    console.log("Fetching posts for user ID:", trimmedUserId);

    // Fetch posts for the user with the valid userId
    const userPosts = await Post.find({ userId: trimmedUserId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    // Return the user posts
    res.status(200).json(userPosts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
