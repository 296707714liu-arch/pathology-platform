import { API_CONFIG } from '../config/api';
import { CaseStudy, SlideAnalysisResult, QuantificationResult, ExamPaper, ExamResult, AnatomySceneConfig } from "../types";

// ============================================================================
// 1. Network Helpers
// ============================================================================

/**
 * Helper to extract JSON from markdown code blocks
 */
function cleanJsonString(text: string): string {
  if (!text) return "{}";
  let clean = text.trim();
  // Find JSON object boundaries
  const firstOpen = clean.indexOf('{');
  const lastClose = clean.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    return clean.substring(firstOpen, lastClose + 1);
  }
  return clean;
}

/**
 * General API Caller - All modules use Gemini via relay API
 */
async function callGeminiApi(messages: any[], jsonMode: boolean = true): Promise<any> {
  const url = `${API_CONFIG.BASE_URL}/v1/chat/completions`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.API_KEY}`
  };
  const body = {
    model: API_CONFIG.MODEL_NAME,
    messages: messages,
    stream: false,
    temperature: 0.2
  };

  try {
    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!response.ok) {
       const err = await response.text();
       throw new Error(`API Error ${response.status}: ${err}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response");
    
    return jsonMode ? JSON.parse(cleanJsonString(content)) : content;
  } catch (error) {
    console.error("Gemini API Request Failed:", error);
    // Return empty object/string to prevent frontend crashes
    return jsonMode ? {} : "服务暂时不可用，请稍后重试。"; 
  }
}


// ============================================================================
// 2. Service Functions
// ============================================================================

// --- 3D Anatomy Generation - 程序化几何布局（使用 Gemini） ---
// 说明：使用 Gemini 生成 3D 场景配置，由前端 Three.js 根据配置动态生成 3D 结构
export async function generateAnatomyScene(userRequirement: string): Promise<AnatomySceneConfig> {
  const systemPrompt = `
    角色：你是一名「医学 3D 解剖可视化设计师」。
    用户想要可视化的结构是：「${userRequirement}」。

    目标：生成一个由简单几何体（球体、长方体、圆柱体）组成的 3D 场景配置，用于教学演示解剖关系。

    几何体类型（type 字段）仅允许：
    - "sphere"   球体：用于表示器官主体 / 结节等
    - "box"      长方体：用于表示组织块 / 解剖区域
    - "cylinder" 圆柱体：用于表示血管 / 管腔结构

    坐标与尺寸规则：
    - position 为 [x, y, z]，范围尽量控制在 -2.0 ~ 2.0 之间，形成紧凑场景。
    - size 用作半径或整体尺寸，推荐范围 0.3 ~ 1.2。
    - cylinder 需要额外 height 字段（高度），推荐范围 0.8 ~ 2.5。

    颜色规则：
    - color 必须是合法 HEX 颜色，例如 "#ff4b4b"。
    - 心脏相关结构可使用红色系，静脉可偏蓝色，骨骼使用浅灰或米白色。

    输出内容：
    1. title：中文标题，简洁概括该解剖场景（例如「心脏腔室与大血管示意」）。
    2. description：中文简要说明，1~3 句，介绍场景中有哪些结构、教学重点是什么。
    3. structures：数组，每个元素描述一个几何体：
       - id: 字符串，唯一 ID，例如 "heart_main_1"
       - name: 中文结构名称，例如 "左心室"、"升主动脉"
       - type: "sphere" | "box" | "cylinder"
       - position: [number, number, number]
       - size: number
       - height: number（仅当 type 为 "cylinder" 时必须提供）
       - color: string（HEX 颜色）

    重要约束：
    - 所有文本（title、description、name）必须使用简体中文。
    - 严格返回合法 JSON 对象，外层不要包裹 Markdown 代码块，不要添加多余说明文字。
    - 保证 JSON 结构与以下 TypeScript 接口兼容：
      {
        "title": string,
        "description": string,
        "structures": Array<{
          "id": string,
          "name": string,
          "type": "sphere" | "box" | "cylinder",
          "position": [number, number, number],
          "size": number,
          "height"?: number,
          "color": string
        }>
      }
  `;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `请根据上述规则，为以下解剖需求生成一个 3D 场景配置：${userRequirement}` }
  ];

  const result = await callGeminiApi(messages, true);
  
  // 验证并修复数据结构
  if (result.structures && Array.isArray(result.structures)) {
    result.structures = result.structures.map((s: any, i: number) => {
      return {
        id: s.id || `structure_${i}`,
        name: s.name || `结构 ${i + 1}`,
        type: s.type || 'sphere',
        position: Array.isArray(s.position) ? s.position.map(Number) : [0, 0, 0],
        size: Number(s.size) || 0.5,
        height: s.height ? Number(s.height) : undefined,
        color: s.color || '#ff4b4b'
      };
    });
  }
  
  return result;
}

// --- Other Services (All using Gemini via relay API) ---

export async function analyzeSlide(base64Image: string, mimeType: string): Promise<SlideAnalysisResult> {
  const prompt = `Analyze this pathology slide. Output STRICT JSON with keys: description, features, differentialDiagnosis, likelyDiagnosis, recommendations. Language: Chinese.`;
  const messages = [
    { role: "user", content: [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
    ]}
  ];
  return callGeminiApi(messages, true);
}

export async function quantifyTissue(base64Image: string, mimeType: string): Promise<QuantificationResult> {
  const prompt = `Perform tissue quantification. Output STRICT JSON with keys: composition, counts, morphometrics, detections, technicalReport.`;
  const messages = [
    { role: "user", content: [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
    ]}
  ];
  return callGeminiApi(messages, true);
}

export async function generateCaseStudy(topic: string, difficulty: string): Promise<CaseStudy> {
  // Use explicit prompts to avoid object return types for string fields and enforce Chinese
  const prompt = `
    Generate a pathology teaching case study about "${topic}".
    Difficulty: ${difficulty}.
    Target Audience: Medical Students/Residents.
    
    CRITICAL INSTRUCTION: All content MUST be in Chinese (Simplified).
    
    Output STRICT JSON with:
    - title (String)
    - patientHistory (String paragraph, NOT object)
    - clinicalPresentation (String paragraph, NOT object)
    - microscopicFindings (String)
    - diagnosis (String)
    - discussionPoints (Array of Strings)
    - quizQuestions (Array of objects: {question, options[], correctAnswer(index), explanation})
  `;
  return callGeminiApi([{ role: "user", content: prompt }], true);
}

export async function generateExamPaper(difficulty: string, topic: string, typeCounts: any): Promise<ExamPaper> {
  const prompt = `
    Generate a pathology exam paper.
    Topic: ${topic}.
    Difficulty: ${difficulty}.
    Question Distribution: ${JSON.stringify(typeCounts)}.
    Language: Chinese (Simplified).
    
    IMPORTANT RULES: 
    1. Generate EXACTLY the number of questions requested for each type.
    2. Ensure JSON is valid and complete. Do NOT cut off.
    3. If total questions > 10, keep explanations concise to prevent token limit issues.
    4. FOR TRUE/FALSE QUESTIONS (true_false): You MUST provide "options": ["正确", "错误"] in the JSON. Do not leave options null.
    
    Output STRICT JSON with:
    - title
    - totalScore
    - durationMinutes
    - questions: Array of {
        id, 
        type (single_choice/multiple_choice/true_false/short_answer), 
        question, 
        options (Array of strings. REQUIRED for true_false as ["正确", "错误"]. Null only for short_answer), 
        correctAnswer (index or string), 
        explanation, 
        knowledgePoint
      }
  `;
  return callGeminiApi([{ role: "user", content: prompt }], true);
}

export async function gradeExam(paper: ExamPaper, userAnswers: Record<number, any>): Promise<ExamResult> {
  const prompt = `
    Grade this pathology exam.
    Paper Context: ${JSON.stringify(paper)}.
    Student Answers: ${JSON.stringify(userAnswers)}.
    
    Task:
    1. Calculate score.
    2. Provide a detailed analysis of the student's performance.
    3. List study suggestions.
    
    CRITICAL: All analysis and suggestions MUST be in Chinese.
    
    Output STRICT JSON with:
    - score (number)
    - totalScore (number)
    - summary (Short encouraging comment in Chinese)
    - detailedAnalysis (Long string paragraph in Chinese analyzing weak points)
    - studySuggestions (Array of strings in Chinese)
    - wrongQuestions (Array of objects: {question, userAnswer, correctAnswer, explanation, knowledgePoint})
  `;
  return callGeminiApi([{ role: "user", content: prompt }], true);
}

export async function performVRInteraction(context: string, action: string): Promise<string> {
  const prompt = `VR Context: ${context}. Action: ${action}. Describe outcome in Chinese.`;
  return callGeminiApi([{ role: "user", content: prompt }], false);
}

export async function streamResearchChat(history: any[], newMessage: string, onChunk: any, onSource: any) {
  // Simple non-streaming fallback
  const messages = history.map((h: any) => ({ role: h.role, content: h.text }));
  messages.push({ role: 'user', content: newMessage });
  try {
    const res = await callGeminiApi(messages, false);
    onChunk(res);
  } catch (e) {
    onChunk("Error connecting to AI.");
  }
}

export async function generateResearchProposal(info: string): Promise<string> {
  const prompt = `Research proposal for: ${info}. Markdown Chinese.`;
  return callGeminiApi([{ role: "user", content: prompt }], false);
}