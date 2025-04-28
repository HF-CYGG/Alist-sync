// 显示加载状态
function showLoading(show) {
    const loader = document.getElementById('loader') || createLoader();
    loader.style.display = show ? 'block' : 'none';
}

// 创建加载动画
function createLoader() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = `<div class="loader-spinner"></div>`;
    document.body.appendChild(loader);
    return loader;
}

// 错误提示
function showError(message) {
    const errorBox = document.createElement('div');
    errorBox.className = 'error-message multiline';
    errorBox.innerHTML = `
        服务器连接异常
        <small>${message}</small>
    `;
    document.body.appendChild(errorBox);
    setTimeout(() => errorBox.remove(), 3000);
}

// 成功提示
function showSuccess(message) {
    const successBox = document.createElement('div');
    successBox.className = 'success-message';
    successBox.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;
    document.body.appendChild(successBox);
    setTimeout(() => successBox.remove(), 3000);
}

// 新增按钮动画逻辑
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', (e) => {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 200);
    });
});

// 新增配置信息展示
function showSupportedFeatures() {
    const config = JSON.parse(localStorage.getItem('serverConfig') || '{}');
    const features = [];
    
    if (config.webauthn_login_enabled === 'true') features.push('生物认证');
    if (config.sso_login_enabled === 'true') features.push(config.sso_login_platform);
    if (config.package_download === 'true') features.push('打包下载');
    
    document.getElementById('supportedFeatures').textContent = features.join(' · ');
}

// 在switchStep函数中调用
function switchStep(step) {
    if(step === 2) showSupportedFeatures();
}

// 在文件末尾添加
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('serverStatus')) {
        console.error('关键状态元素未找到');
        // 创建备用状态显示元素
        const fallbackStatus = document.createElement('div');
        fallbackStatus.id = 'serverStatus';
        document.querySelector('.status-panel').appendChild(fallbackStatus);
    }
});
function exportLogs() {
    const logs = localStorage.getItem('connectionLogs') || '';
    const blob = new Blob([logs], {type: 'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `connection_${new Date().toISOString().slice(0,10)}.log`;
    link.click();
}

// 每24小时自动导出
setInterval(exportLogs, 86400000);
(function initLogger() {
    try {
        localStorage.getItem('logPath') || localStorage.setItem('logPath', 'logs/connection.log');
    } catch (e) {
        console.error('日志初始化失败:', e);
    }
})();