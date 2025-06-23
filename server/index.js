import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveFile, processImage } from './services/uploadService.js';

dotenv.config();

const app = express();

// 从环境变量读取配置
const PORT = process.env.PORT || 3001;
const API_TOKEN = process.env.WP_AUTH_TOKEN || 'wp-img-auth-2024-fx-token-9k8j7h6g5f4d3s2a1z';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || (10 * 1024 * 1024); // 默认10MB
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';

console.log('🚀 启动配置:');
console.log(`   - 端口: ${PORT}`);
console.log(`   - 最大文件大小: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`);
console.log(`   - API Token: ${API_TOKEN.substring(0, 20)}...`);
console.log(`   - CORS 来源: ${CORS_ORIGIN}`);
console.log(`   - 上传目录: ${UPLOAD_DIR}`);

const upload = multer({
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS配置
const corsOptions = {
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// 服务静态文件 - 上传的文件
app.use('/uploads', express.static(UPLOAD_DIR));

// 服务前端静态文件
app.use(express.static(path.join(__dirname, '../dist')));

// 图片上传和处理接口
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { processImage: shouldProcess = 'true' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }
    
    // 保存文件
    const fileResult = await saveFile(req.file.buffer, req.file.originalname, {
      processImage: shouldProcess === 'true',
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 80,
      format: 'webp'
    });
    
    res.json({
      success: true,
      message: '文件上传成功',
      data: {
        fileName: fileResult.fileName,
        originalName: req.file.originalname,
        url: fileResult.url,
        size: fileResult.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误: ' + error.message
    });
  }
});

// 图片处理接口（保持向后兼容）
app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    const maxWidth = parseInt(req.body.maxWidth) || 1920;
    const shouldCompress = req.body.shouldCompress === 'true';
    
    if (!shouldCompress) {
      return res.send(req.file.buffer);
    }

    const processedBuffer = await processImage(req.file.buffer, {
      maxWidth,
      quality: 80,
      format: 'webp'
    });

    res.type('image/webp').send(processedBuffer);
  } catch (error) {
    console.error('图片处理错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// 处理SPA路由 - 必须放在所有API路由之后
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务运行在端口 ${PORT}`);
  console.log(`🔗 本地访问: http://localhost:${PORT}`);
  console.log(`🔑 API Token: ${API_TOKEN}`);
  console.log(`📁 上传目录: ${UPLOAD_DIR}`);
});