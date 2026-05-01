# HomePage Studio 中文说明

`HomePage Studio` 是一个纯前端个人网页编辑器。它提供一个通用的学术主页模板，支持在浏览器里直接编辑内容、拖动图片位置、替换媒体、保存草稿、撤回修改、导出网页文件，并上传到 GitHub。

## 当前功能

- 实时预览个人网页
- 直接在预览区修改文字
- 在图片框内拖动图片，调整显示位置
- 拖拽图片或视频文件到媒体区域，直接替换内容
- 本地草稿保存
- 撤回 / 重做
- 导出 `index.html`、`site.css`、`site-data.json`
- 通过 GitHub Contents API 直接上传到 GitHub
- 可用于 GitHub Pages 发布

## 隐私说明

- 默认模板已经去掉真实个人信息
- 仓库里不包含真实姓名、邮箱、学校、论文、项目链接等内容
- 默认数据全部是通用占位内容，你需要自行替换成自己的信息后再发布

## 如何使用

1. 用浏览器打开 `index.html`
2. 在左侧控制面板或右侧预览区直接编辑文字
3. 拖动图片可以调整图片在框内的位置
4. 把本地图片或视频拖到媒体框上，可以直接替换
5. 点击 `Save Draft` 保存当前草稿到浏览器本地
6. 点击 `Undo` / `Redo` 撤回或重做
7. 点击 `Export Site` 导出网页文件
8. 如果你已经准备好了 GitHub 仓库，也可以直接在页面里填写仓库信息并点击 `Upload to GitHub`

## 如何注册 GitHub 并发布到 github.io

### 1. 注册 GitHub 账号

1. 打开 `https://github.com/`
2. 点击 `Sign up`
3. 输入邮箱、密码、用户名
4. 完成邮箱验证

### 2. 创建用于网页的仓库

你有两种常见方式：

1. 个人主页仓库
   仓库名必须是：`<你的用户名>.github.io`
   例如用户名是 `alice`，仓库名就要是 `alice.github.io`

2. 项目主页仓库
   仓库名可以任意，例如：`my-homepage`

### 3. 从 Studio 导出网页

点击 `Export Site` 后，会下载：

- `index.html`
- `site.css`
- `site-data.json`

把这三个文件上传到你的 GitHub 仓库根目录。

### 4. 开启 GitHub Pages

1. 打开你的 GitHub 仓库页面
2. 点击 `Settings`
3. 左侧找到 `Pages`
4. 在 `Build and deployment` 中选择 `Deploy from a branch`
5. 分支选择 `main`
6. 文件夹选择 `/ (root)`
7. 点击保存

等待 GitHub 部署完成后，就可以访问你的网页。

### 5. 访问地址

如果你使用的是个人主页仓库：

- `https://<你的用户名>.github.io/`

如果你使用的是普通项目仓库：

- `https://<你的用户名>.github.io/<仓库名>/`

## 如果想直接从网页上传到 GitHub

你需要准备：

- GitHub 用户名
- 仓库名
- 分支名，通常是 `main`
- GitHub Personal Access Token

### Token 获取方式

1. 打开 GitHub
2. 进入 `Settings`
3. 找到 `Developer settings`
4. 进入 `Personal access tokens`
5. 创建新 token
6. 给它仓库内容写入权限

然后把这些信息填到页面左侧的 `GitHub Publish` 区域中即可。

## 注意事项

- 草稿保存在浏览器 `localStorage`，换浏览器或清缓存后可能丢失
- 如果你拖入的是大图片或大视频，导出的文件会明显变大
- 某些浏览器在直接双击打开本地 HTML 时，对部分前端能力限制较多；如果遇到问题，建议用一个简单静态服务器来打开这个目录

## 后续可以继续增强

- 增加 section 的开关、排序、增删
- 增加图片缩放和裁切控制
- 增加主题颜色和字体预设
- 增加 GitHub Pages 一键初始化功能
