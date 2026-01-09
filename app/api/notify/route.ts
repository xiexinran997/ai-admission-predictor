import { NextResponse } from 'next/server';

// 注意：这里必须是 export async function POST，不能加 default
export async function POST(request: Request) {
    console.log("🔔 API 被触发了！开始处理...");

    try {
        const body = await request.json();
        console.log("📦 接收到的数据:", body);

        // 检查 Token
        const token = process.env.PUSHPLUS_TOKEN;

        // 打印 Token 状态（隐藏敏感信息）
        if (token) {
            console.log(`🔑 Token 已读取: ${token.slice(0, 4)}****`);
        } else {
            console.error("❌ 错误: 环境变量 PUSHPLUS_TOKEN 未读取到！请检查 .env.local");
        }

        if (!token) {
            return NextResponse.json({ error: 'Token not configured' }, { status: 500 });
        }

        // 构造推送内容
        const title = "💰 新留学线索到账！";
        // 构造更详细的消息内容
        const content = `
手机号：${body.phone}
意向国家：${body.country}
GPA信息：${body.gpa}
    `;

        // 发送请求给 PushPlus
        console.log("🚀 正在向 PushPlus 发送请求...");
        const response = await fetch('http://www.pushplus.plus/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                title,
                content,
                template: 'txt' // 改用 txt 格式测试，防止 html 格式报错
            })
        });

        const data = await response.json();
        console.log("✅ PushPlus 响应结果:", data);

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error("❌ API 处理发生错误:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}