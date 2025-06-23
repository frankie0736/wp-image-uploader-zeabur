import { useState, useCallback } from 'react'
import { Upload, message, Progress } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import useConfigStore from '../store/configStore'
import { generateImageDescription } from '../services/openai'
import { uploadToWordPress } from '../services/wordpress'
import { processImage } from '../utils/imageProcessor'
import pLimit from 'p-limit'  // 需要安装这个包：npm install p-limit

const { Dragger } = Upload
const CONCURRENT_LIMIT = 3  // 同时处理的最大图片数

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const config = useConfigStore()
  
  // 创建并发限制器
  const limit = pLimit(CONCURRENT_LIMIT)

  const updateProgress = useCallback((current, total) => {
    setUploadedCount(current)
    setTotalCount(total)
  }, [])

  const handleUpload = async (file) => {
    try {
      // Ensure configuration is complete
      if (!config.wpUrl || !config.wpUsername || !config.wpPassword) {
        throw new Error('Please complete WordPress configuration first')
      }

      console.log('Processing image:', file.name);

      // 1. 先处理图片（如果启用了压缩）
      const processedImage = await processImage(
        file,
        config.maxImageWidth,
        config.compressImages
      );
      console.log('Image processing completed');

      // 2. Convert processed image to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(processedImage)
        reader.onload = () => resolve(reader.result.split(',')[1])
      })

      // 3. Generate image description
      console.log('Generating image description...');
      const metadata = await generateImageDescription(base64, config)
      console.log('Generated metadata:', metadata);
      
      // 4. Upload to WordPress
      console.log('Uploading to WordPress...');
      const result = await uploadToWordPress(processedImage, metadata, config)
      // console.log('WordPress upload result:', result);
      
      setUploadedCount(prev => prev + 1)
      message.success(`${file.name} uploaded successfully!`)
      return result
    } catch (error) {
      console.error('Upload error details:', error);
      message.error(`${file.name} ${error.message || 'upload failed'}`)
      throw error
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*',
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        setUploading(true)
        if (Array.isArray(file)) {
          const files = file
          updateProgress(0, files.length)
          
          const uploadTasks = files.map((f, index) => 
            limit(async () => {
              await handleUpload(f)
              updateProgress(index + 1, files.length)
            })
          )

          await Promise.allSettled(uploadTasks)
          
          const results = await Promise.allSettled(uploadTasks)
          const failedCount = results.filter(r => r.status === 'rejected').length
          const successCount = results.filter(r => r.status === 'fulfilled').length
          
          if (failedCount > 0) {
            message.warning(`Upload completed: ${successCount} succeeded, ${failedCount} failed`)
          } else {
            message.success('All images uploaded successfully!')
          }
        } else {
          updateProgress(0, 1)
          await handleUpload(file)
          updateProgress(1, 1)
        }
        onSuccess()
      } catch (error) {
        onError(error)
      } finally {
        setUploading(false)
        updateProgress(0, 0)
      }
    }
  }

  return (
    <div>
      <Dragger {...uploadProps} disabled={uploading}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {uploading 
            ? 'Uploading...'
            : 'Click or drag images to this area to upload'
          }
        </p>
        <p className="ant-upload-hint">
          Supports single or multiple image uploads (up to {CONCURRENT_LIMIT} concurrent uploads)
        </p>
      </Dragger>
      {uploading && totalCount > 0 && (
        <Progress 
          percent={Math.round((uploadedCount / totalCount) * 100)} 
          status="active"
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  )
}

export default ImageUploader