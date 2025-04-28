// 服务器验证（已实现）
async function verifyServer() {
    const serverUrl = document.getElementById('serverUrl').value;
    showLoading(true);
    
    try {
        const response = await fetch(`${serverUrl}/api/public/settings`, {
            mode: 'cors',
            headers: {'Accept': 'application/json'}
        });
        
        // 增加响应有效性检查
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        // 增加JSON解析保护
        const data = await response.json().catch(jsonError => {
            throw new Error(`无效的JSON响应: ${jsonError.message}`);
        });
        
        // 根据OpenAPI规范处理响应数据
        if (!data.data) {
            throw new Error('服务器返回数据格式异常');
        }

        showSuccess('服务器验证成功');
        // 存储完整响应数据
        localStorage.setItem('serverConfig', JSON.stringify({
            ...data.data,
            code: data.code,
            message: data.message
        }));
        updateServerStatus(data.data); // 传递data.data给状态更新函数
        localStorage.setItem('serverUrl', serverUrl);
        switchStep(2);
    } catch (error) {
        console.error('[DEBUG] 服务器连接错误详情:', {
            url: `${serverUrl}/api/public/settings`,
            error: error.stack // 输出完整错误堆栈
        });
        showError(error.message.includes('JSON') ? 
            '服务器返回数据格式异常，请检查API地址' : 
            `连接失败: ${error.message.replace('Failed to fetch', '网络连接异常')}`);
    } finally {
        showLoading(false);
    }
}

// 用户登录处理（已实现）
async function handleLogin() {
    const serverUrl = localStorage.getItem('serverUrl');
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    showLoading(true);

    try {
        const response = await fetch(`${serverUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (data.code !== 200) throw new Error(data.message);
        
        localStorage.setItem('accessToken', data.data.token);
        switchStep(3);
    } catch (error) {
        showError(error.message || '登录失败');
    } finally {
        showLoading(false);
    }
}

// 步骤切换逻辑（已实现）
function switchStep(step) {
    document.querySelectorAll('.form-step').forEach(f => f.classList.remove('active'));
    document.querySelector(`#${step === 1 ? 'serverForm' : step === 2 ? 'loginForm' : 'syncForm'}`).classList.add('active');
    
    document.querySelectorAll('.step').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.step) === step);
    });
}

// 修改服务器状态更新函数
function updateServerStatus(config) {
    try {
        const serverUrl = localStorage.getItem('serverUrl') || '';
        const statusElement = document.getElementById('serverStatus');
        
        if (!statusElement) return;

        statusElement.innerHTML = `
            ${config.site_title || '未知服务'} (v${config.version || '?'})
            <br><small>${new URL(serverUrl).host || serverUrl}</small>
            <div class="status-details">
                <span>打包下载：${config.package_download === 'true' ? '✅' : '❌'}</span>
                <span>SSO登录：${config.sso_login_enabled === 'true' ? '✅' : '❌'}</span>
            </div>
        `;
    } catch (error) {
        console.error('状态更新失败:', error);
    }
}

// 修改verifyServer的错误处理部分
async function verifyServer() {
    let serverUrl = document.getElementById('serverUrl').value;
    let apiUrl = ''; 
    
    // 自动补全协议头和路径
    if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        serverUrl = `http://${serverUrl}`;
    }
    if (!serverUrl.endsWith('/')) {
        serverUrl += '/';
    }
    
    showLoading(true);
    try {
        apiUrl = new URL('api/public/settings', serverUrl).href;
        const response = await fetch(apiUrl, {
            mode: 'cors',
            headers: {'Accept': 'application/json'}
        }).catch(networkError => {
            throw new Error(`网络请求失败: ${networkError.message}`);
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        const data = await response.json().catch(jsonError => {
            throw new Error(`无效的JSON响应: ${jsonError.message}`);
        });
        
        // 统一使用data.data结构
        showSuccess('服务器验证成功');
        localStorage.setItem('serverConfig', JSON.stringify({
            ...data.data,
            code: data.code,
            message: data.message
        }));
        updateServerStatus(data.data);
        localStorage.setItem('serverUrl', serverUrl);
        switchStep(2);
    } catch (error) {
        console.error('[DEBUG] 服务器连接错误详情:', {
            url: apiUrl,  // 此时apiUrl已正确赋值
            error: error.stack
        });
        logConnectionEvent('ERROR', error.message, {
            url: apiUrl,
            status: response?.status
        });
        showError(error.message.includes('JSON') ? 
            '服务器返回数据格式异常' : 
            error.message.includes('网络请求失败') ?
            '无法连接到服务器' :
            `连接失败: ${error.message}`);
    } finally {
        showLoading(false);
        const statusElement = document.getElementById('serverStatus');
        if (statusElement) {
            statusElement.innerHTML = statusElement.innerHTML.includes('成功') ? 
                '<i class="fas fa-check-circle"></i> 连接状态已更新' : 
                '<i class="fas fa-exclamation-triangle"></i> 连接状态异常';
        }
    }
}

// 保留其他辅助函数（switchStep、updateServerStatus等）

