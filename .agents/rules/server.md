---
trigger: always_on
---

连接服务器: ssh mtnote。
服务器版本: Linux 6.1.0-9-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.27-1 (2023-05-08) x86_64 GNU/Linux
同步文件: scp -r ./ mtnote:/var/www/html/learn
learn服务目录: /var/www/html/learn
服务器已安装了apache。http://learn.mtnote.cn访问 learn网站。

Apache (80端口)
  └── /var/www/html/learn/
       ├── index.html          ← 前端入口
       ├── api/                ← PHP API
       │    └── index.php      ← 路由分发
       ├── .htaccess           ← URL 重写规则
       ├── data/procesed/*.json  ← 文章数据
       ├── data/audio/*.mp3      ← 音频文件
       ├── css/
       └── js/

scp 时需要忽略.git目录

音频生成:
 tts 依赖环境：mtnote上虚拟python环境venv路径为 /opt/tts-backend/venv 这里安装了tts的依赖。
 在mtnote上用脚本生产音频。