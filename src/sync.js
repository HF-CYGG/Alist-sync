let syncInterval;

async function startSync() {
    const serverUrl = localStorage.getItem('serverUrl');
    const token = localStorage.getItem('accessToken');
    
    try {
        // 调用WebDAV接口进行同步
        const response = await fetch(`${serverUrl}/dav`, {
            method: 'PROPFIND',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Depth': '1'
            }
        });
        
        if (!response.ok) throw new Error('同步失败');
        updateProgress(100);
    } catch (error) {
        showError(error.message);
    }
}

function updateProgress(percentage) {
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${percentage}%`;
}

// 进度模拟（实际应使用WebSocket或轮询获取真实进度）
function simulateProgress() {
    let current = 0;
    syncInterval = setInterval(() => {
        current = Math.min(current + Math.random() * 5, 100);
        updateProgress(current);
        if (current >= 100) clearInterval(syncInterval);
    }, 500);
}