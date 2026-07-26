# 华人婚绿网 V1 首页

这是根据用户提供的首页设计稿制作的可直接部署静态版本。

## 文件

- `index.html`：页面结构与SEO信息
- `styles.css`：桌面端和移动端响应式样式
- `app.js`：导航、弹窗、交友筛选、喜欢按钮、免费评估演示
- `netlify.toml`：Netlify部署与安全响应头

## 本地预览

直接双击 `index.html`，或在目录运行：

```bash
python -m http.server 8080
```

浏览器打开 `http://localhost:8080`。

## 部署到 Netlify

1. 新建 GitHub 仓库，例如 `huarenhunlv-web`。
2. 上传本目录全部文件。
3. 在 Netlify 选择 `Add new site` → `Import an existing project`。
4. 连接 GitHub 仓库。
5. Build command 留空，Publish directory 填 `.`。
6. 部署后在 Domain management 添加 `huarenhunlv.com`。
7. 将 `www.huarenhunlv.com` 设置为别名。
8. 将 `huarenushunlv.com` 设置为301跳转到主域名。

## 下一阶段建议

- Supabase Auth：登录注册
- Supabase Database：个人资料、交友卡片、留言、流程进度
- Cloudflare Turnstile：防机器人
- Stripe：付费咨询或会员
- Resend：邮件通知
- 管理后台：审核、举报、知识文章、案例与用户管理

## 重要提示

页面内的头像和婚礼图片目前来自 Unsplash，仅用于V1视觉占位。正式上线前应替换为拥有商业使用权的品牌素材。
