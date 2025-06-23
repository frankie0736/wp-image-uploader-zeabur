# WordPress 图片智能上传工具

一个基于 React + Node.js 的 WordPress 图片上传和压缩工具，支持批量上传、智能压缩和格式转换。

## 功能特点

- 🖼️ 批量图片上传
- 🗜️ 智能图片压缩
- 🔄 图片格式转换（支持 WebP）
- 🔐 密码保护访问
- ⚡ 一键部署到 Zeabur

## Zeabur 部署指南

### 1. Fork 仓库

首先 Fork 本仓库到你的 GitHub 账号。

### 2. 在 Zeabur 部署

1. 登录 [Zeabur](https://zeabur.com)
2. 创建新项目
3. 选择从 GitHub 导入
4. 选择你 Fork 的仓库
5. Zeabur 会自动检测并部署

### 3. 配置环境变量

在 Zeabur 项目设置中添加以下环境变量：

```env
# 访问密码（必填）
VITE_ACCESS_PASSWORD=your_secure_password

# WordPress 配置（必填）
VITE_WP_URL=https://your-wordpress-site.com
VITE_WP_USERNAME=your_username
VITE_WP_PASSWORD=your_application_password

# OpenAI 配置（选填，用于图片描述生成）
VITE_OPENAI_KEY=your_openai_api_key
VITE_OPENAI_URL=https://api.openai.com

# 图片处理配置（选填）
VITE_COMPRESS_IMAGES=true
VITE_MAX_IMAGE_WIDTH=1920

# 服务器配置（选填）
PORT=3001
MAX_FILE_SIZE=10
UPLOAD_DIR=./uploads
CORS_ORIGIN=*
```

### 4. 获取 WordPress 应用密码

1. 登录你的 WordPress 后台
2. 进入 用户 -> 个人资料
3. 滚动到"应用程序密码"部分
4. 输入应用名称（如"图片上传工具"）
5. 点击"添加新应用程序密码"
6. 复制生成的密码（注意去掉空格）

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-username/wp-image-uploader-zeabur.git
cd wp-image-uploader-zeabur

# 安装依赖
npm install
cd server && npm install && cd ..

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，填入你的配置

# 启动开发服务器
npm run dev   # 前端
npm run server # 后端
```

## 技术栈

- 前端：React 18 + Vite + Ant Design
- 后端：Node.js + Express
- 图片处理：Sharp
- 部署：Zeabur

## 许可证

MIT