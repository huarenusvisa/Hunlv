# 华人婚姻绿卡网用户模块启用说明

## 1. 创建 Supabase 项目

在 Supabase 新建项目后，进入 SQL Editor，执行：

`supabase/schema.sql`

这会创建：

- profiles 用户公开资料
- profile_reports 举报记录
- admin_users 管理员名单
- profile-photos 照片存储桶
- RLS 数据权限规则

## 2. 配置前端公开密钥

复制 `supabase-config.example.js` 为 `supabase-config.js`，填写：

- Project URL
- anon public key

anon key 可以公开在浏览器端；严禁把 service_role key 写入仓库或网页。

## 3. 配置认证

Supabase Dashboard → Authentication → URL Configuration：

- Site URL: `https://huarenhunlv.com`
- Redirect URLs: `https://huarenhunlv.com/account.html`

建议保持邮箱验证开启。

## 4. 添加首位管理员

先使用 `account.html` 注册并验证管理员邮箱，然后在 Supabase SQL Editor 执行：

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = '你的管理员邮箱';
```

管理员随后可访问：

`/admin-users.html`

## 5. 上线流程

1. 用户注册并验证邮箱
2. 用户填写本人资料和授权
3. 状态写入 pending
4. 管理员在审核后台通过、拒绝或隐藏
5. 通过后 status=approved 且 is_public=true
6. `/users.html` 自动显示公开资料

## 安全要求

- 不收集身份证号码、A-Number、护照号码或移民案件文件
- 不在公开资料显示邮箱、电话、详细住址
- 不允许未成年人使用交友模块
- 不允许盗图、冒用、骚扰、色情或移民欺诈招揽
- 所有写入操作受 Supabase RLS 保护
- 永远不要把 service_role 密钥放在前端
