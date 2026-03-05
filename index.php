<?php
/**
 * 统一入口文件 - 设备自适应分流
 */

function isMobile()
{
    $ua = strtolower($_SERVER['HTTP_USER_AGENT']);
    $mobile_agents = array(
        'iphone', 'ipod', 'ipad', 'android', 'windows phone', 'blackberry', 'mobile', 'touch'
    );
    foreach ($mobile_agents as $agent) {
        if (strpos($ua, $agent) !== false) {
            return true;
        }
    }
    return false;
}

if (isMobile()) {
    // 加载移动端专用页面
    include 'm_index.php';
}
else {
    // 加载 PC 端页面
    // 注意：如果是 index.html，直接读取内容输出或重定向
    // 这里采用读取内容输出，保持 URL 不变
    echo file_get_contents('index.html');
}