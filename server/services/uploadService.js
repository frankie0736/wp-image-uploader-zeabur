import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量读取上传目录配置
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

// 确保上传目录存在
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`📁 创建上传目录: ${UPLOAD_DIR}`);
  }
}

// 生成唯一文件名
function generateFileName(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${name}_${timestamp}_${random}${ext}`;
}

// 图片压缩和优化
export async function processImage(buffer, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp'
  } = options;

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    let processedImage = image;

    // 调整尺寸
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      processedImage = processedImage.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // 转换格式和压缩
    switch (format.toLowerCase()) {
      case 'webp':
        processedImage = processedImage.webp({ quality });
        break;
      case 'jpeg':
      case 'jpg':
        processedImage = processedImage.jpeg({ quality });
        break;
      case 'png':
        processedImage = processedImage.png({ quality });
        break;
      default:
        processedImage = processedImage.webp({ quality });
    }

    return await processedImage.toBuffer();
  } catch (error) {
    console.error('图片处理错误:', error);
    throw new Error('图片处理失败: ' + error.message);
  }
}

// 保存文件到磁盘
export async function saveFile(buffer, originalName, options = {}) {
  try {
    ensureUploadDir();
    
    const fileName = generateFileName(originalName);
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // 如果是图片文件且需要处理
    if (options.processImage && isImageFile(originalName)) {
      const processedBuffer = await processImage(buffer, options);
      fs.writeFileSync(filePath, processedBuffer);
    } else {
      fs.writeFileSync(filePath, buffer);
    }

    return {
      fileName,
      filePath,
      url: `/uploads/${fileName}`,
      size: buffer.length
    };
  } catch (error) {
    console.error('文件保存错误:', error);
    throw new Error('文件保存失败: ' + error.message);
  }
}

// 检查是否是图片文件
function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

// 获取文件信息
export function getFileInfo(fileName) {
  const filePath = path.join(UPLOAD_DIR, fileName);
  
  if (!fs.existsSync(filePath)) {
    throw new Error('文件不存在');
  }
  
  const stats = fs.statSync(filePath);
  
  return {
    fileName,
    filePath,
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime
  };
}

// 删除文件
export function deleteFile(fileName) {
  const filePath = path.join(UPLOAD_DIR, fileName);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  
  return false;
}

// 清理过期文件（可选）
export function cleanupOldFiles(daysOld = 30) {
  try {
    ensureUploadDir();
    const files = fs.readdirSync(UPLOAD_DIR);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.birthtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    console.log(`🧹 清理了 ${deletedCount} 个过期文件`);
    return deletedCount;
  } catch (error) {
    console.error('清理文件错误:', error);
    return 0;
  }
} 