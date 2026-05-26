const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// 손금 분석하는 기능
app.post('/analyze', async (req, res) => {
  try {
    const { imageData } = req.body;
    const base64Data = imageData.split(',')[1];
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-1',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data
              }
            },
            {
              type: 'text',
              text: `이 손바닥 사진을 보고 손금을 분석해줘.
              
다음 순서대로 설명해:
1. 손금의 주요 선들 설명
2. 성격은 어떨까?
3. 운세는?

쉽고 재미있게 설명해 줄래?`
            }
          ]
        }]
      },
      {
        headers: { 'x-api-key': CLAUDE_API_KEY }
      }
    );
    
    res.json({ analysis: response.data.content[0].text });
    
  } catch (error) {
    console.error('오류:', error.message);
    res.status(500).json({ error: '분석 실패' });
  }
});

// 운세 만드는 기능
app.post('/fortune', async (req, res) => {
  try {
    const { birthDate } = req.body;
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-1',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `생년월일: ${birthDate}

이 날짜에 태어난 사람의 올해 운세를 만들어줘.

이렇게 써줄래:
### 올해의 운세
(한 문단으로 전체 운세)

### 월별 운세
1월: ...
4월: ...
7월: ...
10월: ...

### 각 분야별 운세
💰 돈운: ⭐⭐⭐⭐ - ...
📚 공부운: ⭐⭐⭐ - ...
❤️ 감정운: ⭐⭐⭐⭐ - ...
💪 건강운: ⭐⭐⭐⭐ - ...

### 행운의 비결
- 길일: ...
- 행운의 색: ...`
        }]
      },
      {
        headers: { 'x-api-key': CLAUDE_API_KEY }
      }
    );
    
    res.json({ fortune: response.data.content[0].text });
    
  } catch (error) {
    console.error('오류:', error.message);
    res.status(500).json({ error: '운세 만들기 실패' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ 서버가 시작됐어! http://localhost:${PORT}`);
});